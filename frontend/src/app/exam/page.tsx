"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ExamStage = "PREPARATION" | "STAGE_1" | "STAGE_2" | "STAGE_3" | "RESULT";

interface MessageItem {
  id: string;
  sender: "examiner" | "partner" | "user" | "system";
  text: string;
  time: string;
}

const STAGES: { key: ExamStage; label: string; sub: string }[] = [
  { key: "PREPARATION", label: "Prep", sub: "Einleitung" },
  { key: "STAGE_1", label: "Stage 1", sub: "Vortrag (Me)" },
  { key: "STAGE_2", label: "Stage 2", sub: "Diskussion (B)" },
  { key: "STAGE_3", label: "Stage 3", sub: "Debatte" },
  { key: "RESULT", label: "Evaluation", sub: "Ergebnis" },
];

const TOPICS = [
  {
    stage: "STAGE_1",
    badge: "Speech 1",
    title: "Beschreiben Sie Ihre Heimatstadt",
    bullets: [
      "Wo liegt Ihre Heimatstadt und wie ist die Atmosphäre?",
      "Wichtige Sehenswürdigkeiten und Freizeitmöglichkeiten",
      "Persönliche Vor- und Nachteile des Lebens dort",
    ],
  },
  {
    stage: "STAGE_2",
    badge: "Speech 2",
    title: "Sollte Online-Lernen Schulen ersetzen?",
    bullets: [
      "Reagieren Sie auf die Argumente Ihres Partners (Lukas)",
      "Vergleich: Traditioneller Unterricht vs. E-Learning",
      "Eigene Erfahrungen und Empfehlungen teilen",
    ],
  },
  {
    stage: "STAGE_3",
    badge: "Stage 3 Debatte",
    title: "Soziale Medien für Jugendliche begrenzen?",
    bullets: [
      "Partner vertritt strikte Beschränkungen",
      "Verteidigen Sie Ihren Standpunkt mit praktischen Beispielen",
      "Einigen Sie sich am Ende auf einen gemeinsamen Kompromiss",
    ],
  },
];

export default function ExamPage() {
  const [stage, setStage] = useState<ExamStage>("PREPARATION");
  const [timer, setTimer] = useState(300);
  const [examStarted, setExamStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Klicken Sie auf 'Prüfung starten'");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"examiner" | "partner" | "user" | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechDetectedRef = useRef(false);
  const stageRef = useRef<ExamStage>("PREPARATION");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer Countdown
  useEffect(() => {
    if (!examStarted) return;
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted]);

  // Audio Player
  const playAudioMp3 = useCallback(async (base64: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      isPlayingRef.current = true;
      setIsSpeaking(true);

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const blob = new Blob([bytes], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        isPlayingRef.current = false;
        setIsSpeaking(false);
        setActiveSpeaker(null);
        setStatus("Bereit. Bitte sprechen Sie...");
      };

      await audio.play();
    } catch {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setActiveSpeaker(null);
    }
  }, []);

  // Process Speech
  const processSpeech = useCallback(async () => {
    if (isPlayingRef.current || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    await new Promise((r) => setTimeout(r, 150));

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    if (micStreamRef.current) {
      const mr = new MediaRecorder(micStreamRef.current, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mr.start(100);
    }

    if (audioBlob.size > 2500 && wsRef.current?.readyState === WebSocket.OPEN) {
      setStatus("Sprache wird analysiert...");
      const arrayBuffer = await audioBlob.arrayBuffer();
      wsRef.current.send(arrayBuffer);
    }
  }, []);

  // WebSocket Connection
  const connectWS = useCallback((initialStage: ExamStage) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket("ws://localhost:8787/voice");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "start", stage: initialStage }));
    };

    ws.onmessage = async (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        if (msg.type === "connected") setStatus("Prüfungskammer aktiv");
        if (msg.type === "audio_mp3") {
          const speaker = stageRef.current === "STAGE_2" ? "partner" : "examiner";
          setActiveSpeaker(speaker);
          await playAudioMp3(msg.data as string);
        }
        if (msg.type === "transcript_ai") {
          const sender = stageRef.current === "STAGE_2" ? "partner" : "examiner";
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender,
              text: msg.text as string,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
        if (msg.type === "transcript_user") {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "user",
              text: msg.text as string,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    ws.onclose = () => setConnected(false);
  }, [playAudioMp3]);

  // Microphone Setup with Audio Visualizer
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      audioCtx.createMediaStreamSource(stream).connect(analyser);

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mr.start(100);

      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(dataArr);
        const avg = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;
        setAudioLevel(Math.min(100, Math.round(avg * 2.5)));

        if (avg > 18 && !isPlayingRef.current) {
          setActiveSpeaker("user");
          speechDetectedRef.current = true;
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        } else if (speechDetectedRef.current && !isPlayingRef.current) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(async () => {
              speechDetectedRef.current = false;
              setActiveSpeaker(null);
              silenceTimerRef.current = null;
              await processSpeech();
            }, 1200);
          }
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch {
      setStatus("Mikrofon nicht verfügbar");
    }
  }, [processSpeech]);

  const handleStartExam = async () => {
    setExamStarted(true);
    await startMic();
    connectWS("PREPARATION");
  };

  const handleNextStage = () => {
    const stageOrder: ExamStage[] = ["PREPARATION", "STAGE_1", "STAGE_2", "STAGE_3", "RESULT"];
    const currIdx = stageOrder.indexOf(stage);
    if (currIdx < stageOrder.length - 1) {
      const next = stageOrder[currIdx + 1];
      setStage(next);
      if (next === "RESULT") setShowResultModal(true);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stage_change", stage: next }));
      }
    }
  };

  const handleEndAll = () => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    wsRef.current?.close();
    setConnected(false);
    setExamStarted(false);
    setActiveSpeaker(null);
    setShowResultModal(true);
  };

  const timeMin = Math.floor(timer / 60);
  const timeSec = timer % 60;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP BAR */}
      <header className="border-b border-neutral-800/80 bg-[#0d121c]/70 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-md shadow-amber-500/20">
            DE
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Goethe / telc B1–B2 AI Simulator</h1>
            <p className="text-[11px] text-neutral-400">Offizielle Prüfungsumgebung</p>
          </div>
        </div>

        {/* TIMER & STATUS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded-full text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
            <span className="font-mono text-[11px] text-neutral-300">{connected ? "ONLINE" : "STANDBY"}</span>
          </div>

          <div className="font-mono font-bold text-sm bg-neutral-900/90 border border-neutral-800 text-amber-400 px-3 py-1 rounded-lg">
            {timeMin}:{timeSec.toString().padStart(2, "0")}
          </div>
        </div>
      </header>

      {/* STAGE STEPPER (Prep / Stage 1 / Stage 2 / Stage 3 / Evaluation) */}
      <nav aria-label="Prüfungsfortschritt" className="bg-[#0b0f17] border-b border-neutral-800/60 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs">
          {STAGES.map((stg, i) => {
            const isActive = stage === stg.key;
            return (
              <div key={stg.key} className="flex items-center gap-2 min-w-max cursor-pointer" onClick={() => setStage(stg.key)}>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    isActive
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-110"
                      : "bg-neutral-800/80 text-neutral-400"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex flex-col">
                  <span className={`font-semibold ${isActive ? "text-amber-400" : "text-neutral-300"}`}>{stg.label}</span>
                  <span className="text-[9px] text-neutral-500 hidden sm:block">{stg.sub}</span>
                </div>
                {i < STAGES.length - 1 && <span className="text-neutral-700 mx-3">/</span>}
              </div>
            );
          })}
        </div>
      </nav>

      {/* MAIN 3-PANEL LAYOUT MATCHING WIREFRAME SKETCH */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: 3 PARTICIPANTS VIRTUAL EXAM TABLE (5 Cols) */}
        <section aria-labelledby="stage-participants-title" className="lg:col-span-5 flex flex-col justify-between bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3 mb-2">
            <h2 id="stage-participants-title" className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Prüfungsraum &bull; Teilnehmer
            </h2>
            <span className="text-[11px] font-mono text-amber-400/90">{status}</span>
          </div>

          {/* TOP ROW: CANDIDATE A (ME) & CANDIDATE B (PARTNER) */}
          <div className="grid grid-cols-2 gap-4 my-2">
            {/* ME (CANDIDATE A) */}
            <div
              className={`relative rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center ${
                activeSpeaker === "user"
                  ? "bg-emerald-950/20 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                  : "bg-neutral-900/60 border-neutral-800/80"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                  activeSpeaker === "user"
                    ? "bg-emerald-500 text-black scale-105 shadow-md shadow-emerald-500/30"
                    : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                }`}
              >
                ME
              </div>
              <h3 className="text-xs font-bold text-white">Sie (Kandidat A)</h3>
              <p className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                {activeSpeaker === "user" ? "Spricht gerade..." : "Bereit"}
              </p>
            </div>

            {/* CANDIDATE B (PARTNER) */}
            <div
              className={`relative rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center ${
                activeSpeaker === "partner"
                  ? "bg-indigo-950/20 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                  : "bg-neutral-900/60 border-neutral-800/80"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                  activeSpeaker === "partner"
                    ? "bg-indigo-500 text-white scale-105 shadow-md shadow-indigo-500/30"
                    : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                }`}
              >
                B
              </div>
              <h3 className="text-xs font-bold text-white">Lukas (Kandidat B)</h3>
              <p className="text-[10px] text-indigo-400/90 font-mono mt-0.5">
                {activeSpeaker === "partner" ? "Diskutiert..." : "Hört zu"}
              </p>
            </div>
          </div>

          {/* BOTTOM ROW: EXAMINER (DR. WEBER) IN CENTER */}
          <div className="flex justify-center my-2">
            <div
              className={`w-full max-w-[280px] rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center ${
                activeSpeaker === "examiner"
                  ? "bg-amber-950/20 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30"
                  : "bg-neutral-900/60 border-neutral-800/80"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mb-2 transition-all ${
                  activeSpeaker === "examiner"
                    ? "bg-amber-400 text-black scale-105 shadow-lg shadow-amber-400/30"
                    : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                }`}
              >
                Prüfer
              </div>
              <h3 className="text-xs font-bold text-white">Dr. Weber (Prüfer)</h3>
              <p className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                {activeSpeaker === "examiner" ? "Leitet die Prüfung..." : "Beobachtet & bewertet"}
              </p>
            </div>
          </div>

          {/* AUDIO WAVEFORM INDICATOR */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5 flex items-center gap-1.5 h-8 mt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  audioLevel > i * 3.5 ? "bg-amber-400 h-5" : "bg-neutral-800 h-1.5"
                }`}
              />
            ))}
          </div>

          {/* ACTION BUTTONS (Next / End All) */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800/60 mt-2">
            {!examStarted ? (
              <button
                onClick={handleStartExam}
                className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
              >
                Prüfung starten &bull; Start Exam
              </button>
            ) : (
              <>
                <button
                  onClick={handleNextStage}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-xs border border-neutral-700 transition-all"
                >
                  Next Stage &rarr;
                </button>
                <button
                  onClick={handleEndAll}
                  className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold py-2.5 rounded-xl text-xs border border-rose-800/50 transition-all"
                >
                  End All &#10005;
                </button>
              </>
            )}
          </div>
        </section>

        {/* MIDDLE COLUMN: EXAM TOPICS (Aufgabenkarte) (4 Cols) */}
        <section aria-labelledby="exam-topics-title" className="lg:col-span-4 flex flex-col bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm overflow-y-auto">
          <div className="border-b border-neutral-800/60 pb-3 mb-4 flex items-center justify-between">
            <h2 id="exam-topics-title" className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Exam Topics (Themen)
            </h2>
            <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-mono">
              B1 / B2
            </span>
          </div>

          <div className="space-y-3.5">
            {TOPICS.map((t, idx) => {
              const isCurrent = stage === t.stage;
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isCurrent
                      ? "bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-500/10"
                      : "bg-neutral-900/40 border-neutral-800/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold">
                      {t.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-400 font-bold tracking-wider animate-pulse">
                        AKTIV
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white mb-2">{t.title}</h3>
                  <ul className="space-y-1.5">
                    {t.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE CONVERSATION TRANSCRIPT (3 Cols) */}
        <section aria-labelledby="live-transcript-title" className="lg:col-span-3 flex flex-col bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden h-[580px] lg:h-auto">
          <div className="border-b border-neutral-800/60 px-4 py-3 bg-neutral-900/40 flex items-center justify-between">
            <h2 id="live-transcript-title" className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Live Transcript
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              REC
            </span>
          </div>

          {/* LIVE CHAT FEED */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-4">
                <p className="text-[11px]">Das Live-Protokoll startet, sobald die Prüfung beginnt.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === "user";
                const isExaminer = m.sender === "examiner";
                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] text-neutral-400 mb-0.5 font-mono">
                      {isUser ? "Sie (A)" : isExaminer ? "Dr. Weber" : "Lukas (B)"} &bull; {m.time}
                    </span>
                    <div
                      className={`max-w-[90%] rounded-xl p-2.5 text-[11px] leading-relaxed ${
                        isUser
                          ? "bg-emerald-950/30 text-emerald-100 border border-emerald-800/40"
                          : isExaminer
                          ? "bg-amber-950/30 text-amber-100 border border-amber-800/40"
                          : "bg-indigo-950/30 text-indigo-100 border border-indigo-800/40"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatScrollRef} />
          </div>
        </section>
      </main>

      {/* EVALUATION / SCORE MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-neutral-700 max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Goethe B1 Prüfungsbewertung</h2>
            <p className="text-xs text-neutral-400 mb-4">Offizielles Zertifikats-Ergebnis</p>
            <div className="space-y-2.5 mb-5">
              {[
                { k: "Wortschatz (Vocabulary)", v: "8.5 / 10" },
                { k: "Aufgabenerfüllung (Task)", v: "9.0 / 10" },
                { k: "Formale Richtigkeit (Grammar)", v: "7.5 / 10" },
                { k: "Aussprache (Pronunciation)", v: "8.0 / 10" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-2.5 bg-neutral-900/60 rounded-lg text-xs border border-neutral-800">
                  <span className="text-neutral-300">{item.k}</span>
                  <span className="font-mono font-bold text-amber-400">{item.v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="text-sm font-bold text-emerald-400">BESTANDEN (33 / 40)</span>
              <button
                onClick={() => setShowResultModal(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}