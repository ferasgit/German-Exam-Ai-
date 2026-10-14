import { Hono } from "hono";
import { cors } from "hono/cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Groq from "groq-sdk";
import "dotenv/config";

const app = new Hono();
app.use("*", cors());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const EXAM_LANG = process.env.EXAM_LANG === "en" ? "en" : "de";
const LANG_NAME = EXAM_LANG === "en" ? "English" : "German";

app.get("/", (c) => c.json({ status: "Backend running - Cartesia + Groq" }));

const COMMON_RULES = `
STRICT RULES:
- You are the examiner or partner. NEVER answer for the student and NEVER give model answers or example answers.
- Ask only ONE question or give ONE instruction per turn. Maximum 2 short sentences.
- Never move to another exam part, never say the exam is finished, never invent other topics. Only the app changes the exam part.
- If the student's message is unclear or only a filler word, say briefly that you did not understand and ask them to continue.
- Plain spoken text only: no lists, no numbering, no bold, no markdown.
- Do not give scores or feedback unless this is the final feedback stage.`;

const SYSTEM_PROMPTS: Record<string, string> = {
  PREPARATION: `You are a professional German B2 speaking exam invigilator.
Welcome the student in one or two sentences. Say the exam has three parts: a speech, a partner discussion and a debate. Say the topics are on the screen and they have preparation time. Answer questions about the format only.
${COMMON_RULES}`,

  USER_SPEECH: `You are the German exam invigilator. The student is giving Speech 1. Topic: "Beschreiben Sie Ihre Heimatstadt".
On your first turn, ask the student to begin their speech. After that, let them speak and ask ONE short follow-up question about what they said. Do not correct the student; feedback comes at the end.
${COMMON_RULES}`,

  AI_PARTNER_SPEECH: `You are the speaking partner in a German exam. Topic: "Sollte Online-Lernen Schulen ersetzen?".
On your first turn, give your own opinion in one sentence and ask the student ONE question. After each student answer, react in one sentence and ask ONE follow-up question.
${COMMON_RULES}`,

  DEBATE: `You are the debate partner in a German exam. Topic: "Sollten soziale Medien für Jugendliche begrenzt werden?". You argue FOR limiting social media.
On your first turn, state your position in one or two sentences and ask for the student's view. After that, answer their arguments with one short counter-argument, then wait.
${COMMON_RULES}`,

  RESULT: `You are the German exam invigilator giving the final feedback in English.
Base it only on what the student actually said in this conversation. Give short feedback: Vocabulary X/10, Fluency X/10, Grammar X/10, Confidence X/10, Overall X/40, then one sentence of encouragement. Maximum 6 sentences. If the student said very little, say so and score accordingly. Plain text only, no markdown.`,
};

const VOICES: Record<string, string> = {
  invigilator: "225ba8cf-9fc2-4371-a78c-fe38ba38898a",
  partner: "d6b0c62a-c7ff-477c-9a1f-eadd64b94360",
};

type Message = { role: string; content: string };
const sessions = new Map<string, Message[]>();

const server = createServer();
const wss = new WebSocketServer({ server, path: "/voice" });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  let currentStage = "PREPARATION";
  let currentLang: "de" | "en" = "de";
  const sessionId = "session_" + Date.now();
  sessions.set(sessionId, []);

  async function generateAndSpeak(userText: string, stage: string): Promise<void> {
    try {
      ws.send(JSON.stringify({ type: "processing" }));

      const history = sessions.get(sessionId) || [];
      history.push({ role: "user", content: userText });
      if (history.length > 20) history.splice(0, history.length - 20);
      sessions.set(sessionId, history);

      console.log("LLM stage:", stage, "user:", userText.slice(0, 50));

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        reasoning_effort: "low",
        messages: [
          { role: "system" as const, content: (SYSTEM_PROMPTS[stage] || SYSTEM_PROMPTS["PREPARATION"]) + "\n\nREPLY LANGUAGE: " + (stage === "RESULT" || currentLang === "en" ? "English" : "German") + " only." },
          ...history.map((m) => ({
            role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.content || "",
          })),
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const aiText = (response.choices[0]?.message?.content || "").replace(/[*#_`]/g, "").trim();
      history.push({ role: "assistant", content: aiText });
      sessions.set(sessionId, history);

      console.log("LLM:", aiText.slice(0, 80));
      ws.send(JSON.stringify({ type: "transcript_ai", text: aiText }));

      const voiceId = (stage === "AI_PARTNER_SPEECH" || stage === "DEBATE")
        ? VOICES["partner"]
        : VOICES["invigilator"];

      // Use Cartesia HTTP API — reliable, no WebSocket issues
      const ttsRes = await fetch("https://api.cartesia.ai/tts/bytes", {
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
      console.error("generateAndSpeak error:", err);
      ws.send(JSON.stringify({ type: "error", message: String(err) }));
    }
  }

  ws.on("message", async (data: Buffer) => {
    try {
      const text = data.toString("utf8");

      if (text.startsWith("{")) {
        const msg = JSON.parse(text) as Record<string, string>;

        if (msg["type"] === "start") {
          currentStage = msg["stage"] || "PREPARATION";
          sessions.set(sessionId, []);
          ws.send(JSON.stringify({ type: "connected", stage: currentStage }));

          const firstMessages: Record<string, string> = {
            PREPARATION: "welcome the student warmly and start the German speaking exam",
            USER_SPEECH: "ask the student to begin their speech now",
            AI_PARTNER_SPEECH: "introduce yourself as the speaking partner and start the discussion",
            DEBATE: "start the debate now with your position",
            RESULT: "give the student their detailed exam feedback and scores",
          };

          await generateAndSpeak(firstMessages[currentStage] || "start", currentStage);
        }

        if (msg["type"] === "stage_change") {
          currentStage = msg["stage"] || "PREPARATION";

          const firstMessages: Record<string, string> = {
            PREPARATION: "welcome the student and start the exam",
            USER_SPEECH: "ask the student to begin their speech",
            AI_PARTNER_SPEECH: "introduce yourself as speaking partner and start",
            DEBATE: "start the debate now",
            RESULT: "give the student their exam feedback and scores",
          };

          await generateAndSpeak(firstMessages[currentStage] || "continue", currentStage);
        }

        if (msg["type"] === "interrupt") {
          ws.send(JSON.stringify({ type: "interrupted" }));
          console.log("Interrupted");
        }

      } else {
        if (data.length < 3000) return;

        console.log("STT: audio size:", data.length);

        const audioFile = new File([data], "audio.webm", { type: "audio/webm" });

        let transcription = (await groq.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-large-v3",
          response_format: "verbose_json",
        })) as unknown as { text: string; language?: string };
        let detected = (transcription.language || "").toLowerCase();
        if (!["german", "english", "de", "en"].includes(detected)) {
          transcription = (await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3",
            response_format: "verbose_json",
            language: currentLang,
          })) as unknown as { text: string; language?: string };
          detected = currentLang;
        }
        const detectedLang: "de" | "en" = detected.startsWith("en") ? "en" : "de";

        const userText = transcription.text?.trim();
        if (!userText || userText.length < 2) {
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        // ignore silence or background noise that Whisper turns into fake words
        const segs = ((transcription as unknown as { segments?: { no_speech_prob?: number }[] }).segments) || [];
        const mostlyNoise = segs.length > 0 && segs.every((sg) => (sg.no_speech_prob ?? 0) > 0.6);
        const cleaned = userText.toLowerCase().replace(/[^\p{L}\s]/gu, "").trim();
        const FAKE = ["you", "thank you", "thanks", "thanks for watching", "thank you for watching", "bye", "vielen dank fürs zuschauen"];
        if (mostlyNoise || FAKE.includes(cleaned)) {
          console.log("Ignored noise:", userText);
          ws.send(JSON.stringify({ type: "turn_complete" }));
          return;
        }

        // switch language only on a real sentence or a clear request
        const wordCount = userText.split(/\s+/).length;
        const asksEnglish = /(speak|talk|switch|sprich|sprechen|wechsel).*(english|englisch)/i.test(userText);
        const asksGerman = /(speak|talk|switch|sprich|sprechen|wechsel).*(german|deutsch)/i.test(userText);
        if (wordCount <= 8 && asksEnglish) currentLang = "en";
        else if (wordCount <= 8 && asksGerman) currentLang = "de";
        else if (wordCount >= 3) currentLang = detectedLang;

        console.log("STT:", userText);
        ws.send(JSON.stringify({ type: "transcript_user", text: userText }));
        await generateAndSpeak(userText, currentStage);
      }

    } catch (err) {
      console.error("WS message error:", err);
      ws.send(JSON.stringify({ type: "error", message: String(err) }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    sessions.delete(sessionId);
  });
});

server.listen(8787, () => {
  console.log("Backend running on http://localhost:8787");
  console.log("Voice WebSocket on ws://localhost:8787/voice");
});