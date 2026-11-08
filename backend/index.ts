import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Groq from "groq-sdk";
import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import { createHmac, timingSafeEqual } from "node:crypto";

// WSL network fix: prefer IPv4 and give each connection attempt more time
dns.setDefaultResultOrder("ipv4first");
(net as unknown as { setDefaultAutoSelectFamilyAttemptTimeout?: (ms: number) => void })
  .setDefaultAutoSelectFamilyAttemptTimeout?.(5000);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY!, maxRetries: 4, timeout: 30000 });

// ---------- security and limits (set values in backend/.env) ----------
const WS_SECRET = process.env.WS_SECRET || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "http://localhost:3000").split(",").map((o) => o.trim());
const TRUST_PROXY = process.env.TRUST_PROXY === "1"; // set to 1 when behind nginx/Caddy/Fly
const MAX_SESSION_MS = 25 * 60 * 1000; // hard cap per connection
const MAX_AUDIO_BYTES = 2 * 1024 * 1024; // max size of one audio message
const MAX_CONNECTIONS_PER_IP = 3;
const MAX_EXAMS_PER_IP_PER_DAY = Number(process.env.MAX_EXAMS_PER_IP_PER_DAY || 5);

// With WS_SECRET set: token check, origin check and limits are on (production).
// Without it: TEST mode, none of these apply.
const SECURE = WS_SECRET.length > 0;
if (!SECURE) console.warn("WS_SECRET not set: running in TEST mode (no token check, no limits).");

function verifyToken(token: string): boolean {
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", WS_SECRET).update(exp).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const connectionsPerIp = new Map<string, number>();
const examsPerIp = new Map<string, { day: string; count: number }>();

function examAllowed(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const e = examsPerIp.get(ip);
  if (!e || e.day !== day) {
    examsPerIp.set(ip, { day, count: 1 });
    return true;
  }
  if (e.count >= MAX_EXAMS_PER_IP_PER_DAY) return false;
  e.count += 1;
  return true;
}

function clientIp(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } }): string {
  if (TRUST_PROXY) {
    const xf = req.headers["x-forwarded-for"];
    const first = (Array.isArray(xf) ? xf[0] : xf)?.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.socket.remoteAddress || "unknown";
}

function errText(err: unknown): string {
  const e = err as { message?: string; cause?: { code?: string } };
  return (e?.message || String(err)).slice(0, 120) + (e?.cause?.code ? " (" + e.cause.code + ")" : "");
}

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`${label} failed, try ${i}/${tries}: ${errText(err)}`);
      if (i < tries) await new Promise((r) => setTimeout(r, 600 * i));
    }
  }
  throw lastErr;
}

const EXAM_LANG = process.env.EXAM_LANG === "en" ? "en" : "de";
const LANG_NAME = EXAM_LANG === "en" ? "English" : "German";

const TOPICS = {
  user: "Beschreiben Sie Ihre Heimatstadt",
  partner: "Sollte Online-Lernen Schulen ersetzen?",
  debate: "Sollten soziale Medien für Jugendliche begrenzt werden?",
};

const BASE_RULES = `
STRICT RULES:
- NEVER answer for the student and NEVER give model answers or example answers.
- Never move to another exam part, never say the exam is finished, never invent other topics. Only the app changes the exam part.
- If the student's message is unclear or only a filler word, say briefly that you did not understand and ask them to continue.
- Plain spoken text only: no lists, no numbering, no bold, no markdown.
- Do not give scores or feedback unless this is the final feedback stage.`;

const SHORT_RULES = `${BASE_RULES}
- Ask only ONE question or give ONE instruction per turn. Maximum 2 short sentences.`;

const EXAMINER = `You are Rachel, the EXAMINER (invigilator) of a German B2 speaking exam. You are not a candidate. You never give opinions on the topics.`;
const PARTNER = `You are Josh, the speaking PARTNER (the second candidate) in a German B2 speaking exam. You are NOT the examiner and you never evaluate or score.`;

const SYSTEM_PROMPTS: Record<string, string> = {
  PREPARATION: `${EXAMINER}
On your first turn, in 5 to 6 short sentences: greet both participants, the student and Josh the speaking partner, welcome the two of them, say you are the examiner, tell the student their own topic is \"${TOPICS.user}\", tell them Josh will present \"${TOPICS.partner}\", say the student presents first, then Josh, with questions after each presentation, then a debate on \"${TOPICS.debate}\", and that they now have preparation time. After that, answer only questions about the format, in one short sentence.
${BASE_RULES}`,

  INTRO: `${EXAMINER}
Preparation time is over. On your first turn, in 3 short sentences: say preparation is over, introduce Josh as the student's speaking partner who will ask questions and debate with them, and say the exam begins now with the student's presentation. After that, answer only questions about the format, in one short sentence.
${BASE_RULES}`,

  USER_PRESENTATION: `${EXAMINER}
The student now gives their own presentation. Topic: \"${TOPICS.user}\".
On your first turn, say in one short sentence that the student may begin and will not be interrupted. Say nothing else.
${SHORT_RULES}`,

  USER_QA: `${PARTNER}
The student just gave a presentation on \"${TOPICS.user}\". It is in the conversation above.
On your first turn: say you are Josh, give brief positive feedback on the presentation in one short sentence, then ask the student ONE follow-up question about something they actually said. After the student answers, react in one short sentence and do NOT ask another question.
${BASE_RULES}
- Maximum 3 short sentences on your first turn, then maximum 1 short sentence per turn.`,

  PARTNER_PRESENTATION: `${PARTNER}
You now give your own presentation. Your topic: \"${TOPICS.partner}\".
On your first turn, give a clear presentation in 8 to 10 sentences: a short introduction, two arguments with an example each, and a short conclusion. Speak as a B2 level speaker, clearly and naturally. End with a thank you. Do not ask the student questions.
${BASE_RULES}`,

  PARTNER_QA: `${PARTNER}
You just gave a presentation on \"${TOPICS.partner}\". Now the student asks you a follow-up question and gives you brief feedback.
On your first turn, say in one short sentence that the student may now ask a question and give feedback. After the student speaks, thank them for the feedback in a few words and answer their question in 2 or 3 sentences. Do not ask questions back.
${BASE_RULES}`,

  DEBATE: `${PARTNER}
You are now debating with the student. Topic: \"${TOPICS.debate}\". You argue FOR limiting social media. Both of you try to reach a consensus.
On your first turn, state your position in one or two sentences and ask for the student's view. After that, answer their arguments with one short counter-argument and acknowledge good points. After about three exchanges, suggest a reasonable compromise to reach consensus, and if the student agrees, accept it.
${SHORT_RULES}`,

  RESULT: `You are Rachel, the German B2 exam examiner, giving the final result.
Judge only the student, not Josh. Base it only on what the student actually said in this conversation: the presentation, the answer to Josh's question, the question and feedback to Josh, and the debate. If the student said very little, score low.
Reply with ONLY a JSON object, no other text, in this exact shape:
{"vocabulary": 0-10, "grammar": 0-10, "fluency": 0-10, "interaction": 0-10, "feedback": "..."}
"feedback" is plain English, maximum 5 short sentences, no markdown, ending with one sentence of encouragement. Do not put scores in the feedback text.`,
};

// change the voices in backend/.env (VOICE_EXAMINER_ID, VOICE_PARTNER_ID), no code edit needed
const VOICES: Record<string, string> = {
  invigilator: process.env.VOICE_EXAMINER_ID || "225ba8cf-9fc2-4371-a78c-fe38ba38898a",
  partner: process.env.VOICE_PARTNER_ID || "d6b0c62a-c7ff-477c-9a1f-eadd64b94360",
};

const SPEAKER: Record<string, "examiner" | "partner"> = {
  PREPARATION: "examiner",
  INTRO: "examiner",
  USER_PRESENTATION: "examiner",
  USER_QA: "partner",
  PARTNER_PRESENTATION: "partner",
  PARTNER_QA: "partner",
  DEBATE: "partner",
  RESULT: "examiner",
};

// the backend only allows the next stage in this order
const NEXT_STAGE: Record<string, string | undefined> = {
  PREPARATION: "INTRO",
  INTRO: "USER_PRESENTATION",
  USER_PRESENTATION: "USER_QA",
  USER_QA: "PARTNER_PRESENTATION",
  PARTNER_PRESENTATION: "PARTNER_QA",
  PARTNER_QA: "DEBATE",
  DEBATE: "RESULT",
};

// stages where the student speaks alone and the AI does not reply
const SILENT_STAGES = new Set(["USER_PRESENTATION"]);
// stages where the AI speaks alone (or students prepare silently) and student audio is ignored
const AI_ONLY_STAGES = new Set(["PREPARATION", "INTRO", "PARTNER_PRESENTATION"]);

// stage triggers are instructions to the model, never student speech
const STAGE_TRIGGERS: Record<string, string> = {
  PREPARATION: "Start the exam now: greet the student and Josh, then announce the topics.",
  INTRO: "Preparation time is over. Introduce Josh and say the exam begins now.",
  USER_PRESENTATION: "Tell the student they may begin their presentation now.",
  USER_QA: "Give brief feedback on the student's presentation and ask your follow-up question now.",
  PARTNER_PRESENTATION: "Give your presentation now.",
  PARTNER_QA: "Invite the student to ask you a question and give brief feedback now.",
  DEBATE: "Start the debate now with your position.",
  RESULT: "Give the final result now.",
};

type Scores = {
  vocabulary: number;
  grammar: number;
  fluency: number;
  interaction: number;
  overall: number;
  passed: boolean;
  feedback: string;
};

const PASS_MARK = 24; // 60% of 40

function parseScores(raw: string): Scores | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]) as Record<string, unknown>;
    const n = (v: unknown) => Math.max(0, Math.min(10, Math.round(Number(v) || 0)));
    const vocabulary = n(j["vocabulary"]);
    const grammar = n(j["grammar"]);
    const fluency = n(j["fluency"]);
    const interaction = n(j["interaction"]);
    const overall = vocabulary + grammar + fluency + interaction;
    const feedback = String(j["feedback"] || "").replace(/[*#_`]/g, "").trim();
    if (!feedback) return null;
    return { vocabulary, grammar, fluency, interaction, overall, passed: overall >= PASS_MARK, feedback };
  } catch {
    return null;
  }
}

type WhisperResult = {
  duration?: number;
  segments?: { no_speech_prob?: number; avg_logprob?: number; compression_ratio?: number }[];
};

// Whisper invents text from silence, breathing and background noise.
// Returns true when the transcript looks like that and should be ignored.
function isJunkTranscript(text: string, r: WhisperResult): boolean {
  const segs = r.segments || [];
  const cleaned = text.toLowerCase().replace(/[^\p{L}\s]/gu, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  // most segments are probably not speech, or Whisper is unsure of what it heard
  if (segs.length > 0 && segs.every((sg) => (sg.no_speech_prob ?? 0) > 0.5)) return true;
  if (segs.length > 0 && segs.every((sg) => (sg.avg_logprob ?? 0) < -1.2)) return true;
  // repetition loops such as "die die die die die"
  if (segs.some((sg) => (sg.compression_ratio ?? 0) > 2.4)) return true;
  if (words.length >= 4 && new Set(words).size <= Math.ceil(words.length / 4)) return true;
  // sounds like "sssss" or "mmmm"
  if (words.length === 1 && /^(\p{L})\1{2,}$/u.test(words[0]!)) return true;

  // typical phrases Whisper adds to silence, only when the clip was very short
  const HALLUCINATIONS = [
    "you", "thank you", "thanks", "bye", "thanks for watching", "thank you for watching",
    "vielen dank", "danke", "vielen dank fürs zuschauen", "tschüss", "bis zum nächsten mal",
    "untertitel der amara org community", "untertitel im auftrag des zdf", "untertitelung des zdf",
  ];
  if (HALLUCINATIONS.includes(cleaned) && (r.duration ?? 0) < 3) return true;

  return false;
}

type Message = { role: string; content: string };
const sessions = new Map<string, Message[]>();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server,
  path: "/voice",
  maxPayload: SECURE ? MAX_AUDIO_BYTES : 50 * 1024 * 1024,
  verifyClient: (info, cb) => {
    if (!SECURE) return cb(true);
    const origin = info.origin || "";
    if (!ALLOWED_ORIGINS.includes(origin)) return cb(false, 403, "Origin not allowed");

    const token = new URL(info.req.url || "", "http://x").searchParams.get("token") || "";
    if (!verifyToken(token)) return cb(false, 401, "Invalid or expired token");

    const ip = clientIp(info.req);
    if ((connectionsPerIp.get(ip) || 0) >= MAX_CONNECTIONS_PER_IP) return cb(false, 429, "Too many connections");
    cb(true);
  },
});

wss.on("connection", (ws: WebSocket, req) => {
  const ip = clientIp(req);
  connectionsPerIp.set(ip, (connectionsPerIp.get(ip) || 0) + 1);
  const sessionKiller = SECURE ? setTimeout(() => ws.close(4000, "Session time limit"), MAX_SESSION_MS) : undefined;
  console.log("Client connected:", ip);

  let currentStage = "PREPARATION";
  let currentLang: "de" | "en" = "de";
  const sessionId = "session_" + Date.now();
  sessions.set(sessionId, []);

  async function generateAndSpeak(userText: string | null, stage: string): Promise<void> {
    try {
      ws.send(JSON.stringify({ type: "processing" }));

      const history = sessions.get(sessionId) || [];
      if (userText !== null) history.push({ role: "user", content: userText });
      if (history.length > 40) history.splice(0, history.length - 40);
      sessions.set(sessionId, history);

      console.log("LLM stage:", stage, userText !== null ? "user: " + userText.slice(0, 50) : "(stage trigger)");

      const isResult = stage === "RESULT";
      const trigger = userText === null ? "\n\nINSTRUCTION: " + (STAGE_TRIGGERS[stage] || "Continue.") : "";

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        reasoning_effort: "low",
        messages: [
          { role: "system" as const, content: (SYSTEM_PROMPTS[stage] || SYSTEM_PROMPTS["PREPARATION"]) + "\n\nREPLY LANGUAGE: " + (isResult || currentLang === "en" ? "English" : "German") + " only." + trigger },
          ...history.map((m) => ({
            role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.content || "",
          })),
        ],
        max_tokens: isResult ? 700 : stage === "PARTNER_PRESENTATION" ? 900 : 400,
        temperature: isResult ? 0.3 : 0.7,
        ...(isResult ? { response_format: { type: "json_object" as const } } : {}),
      });

      const rawText = response.choices[0]?.message?.content || "";
      let aiText = rawText.replace(/[*#_`]/g, "").trim();
      let scores: Scores | null = null;

      if (isResult) {
        scores = parseScores(rawText);
        aiText = scores
          ? scores.feedback
          : "I could not generate your scores. Please try again.";
      }

      history.push({ role: "assistant", content: aiText });
      sessions.set(sessionId, history);

      console.log("LLM:", aiText.slice(0, 80));
      ws.send(JSON.stringify({ type: "transcript_ai", text: aiText, speaker: SPEAKER[stage] || "examiner" }));
      if (scores) ws.send(JSON.stringify({ type: "result_scores", data: scores }));

      const voiceId = SPEAKER[stage] === "partner"
        ? VOICES["partner"]
        : VOICES["invigilator"];

      // Use Cartesia HTTP API — reliable, no WebSocket issues
      const ttsRes = await withRetry("Cartesia", async () => {
        const r = await fetch("https://api.cartesia.ai/tts/bytes", {
          method: "POST",
          headers: {
            "X-API-Key": process.env.CARTESIA_API_KEY!,
            "Cartesia-Version": "2024-11-13",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_id: "sonic-3",
            transcript: aiText,
            language: stage === "RESULT" ? "en" : currentLang,
            voice: { mode: "id", id: voiceId },
            output_format: {
              container: "mp3",
              bit_rate: 128000,
              sample_rate: 44100,
            },
          }),
          signal: AbortSignal.timeout(25000),
        });
        if (r.status >= 500 || r.status === 429) throw new Error("Cartesia status " + r.status);
        return r;
      });

      if (!ttsRes.ok) {
        const err = await ttsRes.text();
        console.error("Cartesia error:", err);
        ws.send(JSON.stringify({ type: "error", message: err }));
        return;
      }

      const audioBuffer = await ttsRes.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");
      console.log("Cartesia TTS done, size:", audioBuffer.byteLength);

      ws.send(JSON.stringify({ type: "audio_mp3", data: audioBase64 }));
      ws.send(JSON.stringify({ type: "turn_complete" }));

    } catch (err) {
      console.error("generateAndSpeak error:", errText(err));
      // drop the unanswered student message so the next turn starts clean
      if (userText !== null) {
        const h = sessions.get(sessionId);
        const last = h && h[h.length - 1];
        if (h && last && last.role === "user" && last.content === userText) h.pop();
      }
      ws.send(JSON.stringify({ type: "error", message: "Network problem. Please speak again." }));
      ws.send(JSON.stringify({ type: "turn_complete" }));
    }
  }

  ws.on("message", async (data: Buffer) => {
    try {
      const text = data.toString("utf8");

      if (text.startsWith("{")) {
        const msg = JSON.parse(text) as Record<string, string>;

        if (msg["type"] === "start") {
          const wanted = msg["stage"] || "PREPARATION";
          if (!(wanted in SPEAKER)) return;
          if (SECURE && wanted === "PREPARATION" && !examAllowed(ip)) {
            ws.send(JSON.stringify({ type: "error", message: "Daily exam limit reached. Please try again tomorrow." }));
            ws.close(4001, "Daily limit");
            return;
          }
          currentStage = wanted;
          sessions.set(sessionId, []);
          ws.send(JSON.stringify({ type: "connected", stage: currentStage }));
          ws.send(JSON.stringify({ type: "topics", data: TOPICS }));

          await generateAndSpeak(null, currentStage);
        }

        if (msg["type"] === "stage_change") {
          const nextStage = msg["stage"] || "";
          if (!(nextStage in SPEAKER)) return;
          if (SECURE && nextStage !== NEXT_STAGE[currentStage]) {
            console.warn("Rejected stage change:", currentStage, "->", nextStage);
            return;
          }
          currentStage = nextStage;

          await generateAndSpeak(null, currentStage);
        }

        if (msg["type"] === "interrupt") {
          ws.send(JSON.stringify({ type: "interrupted" }));
          console.log("Interrupted");
        }

      } else {
        if (data.length < 3000) return;

        if (AI_ONLY_STAGES.has(currentStage)) {
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        console.log("STT: audio size:", data.length);

        const audioFile = new File([new Uint8Array(data)], "audio.webm", { type: "audio/webm" });

        const transcription = (await groq.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-large-v3",
          response_format: "verbose_json",
          language: currentLang,
          temperature: 0,
        })) as unknown as { text: string; language?: string };

        const userText = transcription.text?.trim();
        if (!userText || userText.length < 2) {
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        // ignore background noise that Whisper turns into fake words
        if (isJunkTranscript(userText, transcription as unknown as WhisperResult)) {
          console.log("Ignored noise:", userText);
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        // switch language only when the student clearly asks for it
        const asksEnglish = /(speak|talk|switch|sprich|sprechen|wechsel).*(english|englisch)/i.test(userText);
        const asksGerman = /(speak|talk|switch|sprich|sprechen|wechsel).*(german|deutsch)/i.test(userText);
        if (userText.split(/\s+/).length <= 8) {
          if (asksEnglish) currentLang = "en";
          else if (asksGerman) currentLang = "de";
        }

        console.log("STT:", userText);
        ws.send(JSON.stringify({ type: "transcript_user", text: userText }));

        if (SILENT_STAGES.has(currentStage)) {
          const hist = sessions.get(sessionId) || [];
          const last = hist[hist.length - 1];
          if (last && last.role === "user") last.content += " " + userText;
          else hist.push({ role: "user", content: userText });
          sessions.set(sessionId, hist);
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        await generateAndSpeak(userText, currentStage);
      }

    } catch (err) {
      console.error("WS message error:", errText(err));
      ws.send(JSON.stringify({ type: "error", message: "Network problem. Please speak again." }));
      ws.send(JSON.stringify({ type: "turn_complete" }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clearTimeout(sessionKiller);
    const n = (connectionsPerIp.get(ip) || 1) - 1;
    if (n <= 0) connectionsPerIp.delete(ip);
    else connectionsPerIp.set(ip, n);
    sessions.delete(sessionId);
  });
});

server.listen(8787, () => {
  console.log("Backend running on http://localhost:8787");
  console.log("Voice WebSocket on ws://localhost:8787/voice");
  console.log("Examiner voice:", VOICES["invigilator"], "| Partner voice:", VOICES["partner"]);
});