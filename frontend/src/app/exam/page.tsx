"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ExamStage =
  | "PREPARATION"
  | "INTRO"
  | "USER_PRESENTATION"
  | "USER_QA"
  | "PARTNER_PRESENTATION"
  | "PARTNER_QA"
  | "DEBATE"
  | "RESULT";

const STAGE_SECONDS: Record<ExamStage, number> = {
  PREPARATION: 300,
  INTRO: 60,
  USER_PRESENTATION: 240,
  USER_QA: 120,
  PARTNER_PRESENTATION: 90,
  PARTNER_QA: 120,
  DEBATE: 300,
  RESULT: 0,
};

const NEXT_STAGE: Record<ExamStage, ExamStage | null> = {
  PREPARATION: "INTRO",
  INTRO: "USER_PRESENTATION",
  USER_PRESENTATION: "USER_QA",
  USER_QA: "PARTNER_PRESENTATION",
  PARTNER_PRESENTATION: "PARTNER_QA",
  PARTNER_QA: "DEBATE",
  DEBATE: "RESULT",
  RESULT: null,
};

const AUTO_ADVANCE_STAGES: ExamStage[] = ["PREPARATION", "INTRO", "PARTNER_PRESENTATION"];

const STAGE_DISPLAY_GROUPS: { key: ExamStage; label: string; sub: string }[] = [
  { key: "PREPARATION", label: "Prep", sub: "Vorbereitung" },
  { key: "INTRO", label: "Intro", sub: "Einleitung" },
  { key: "USER_PRESENTATION", label: "Teil 1", sub: "Vortrag (Me)" },
  { key: "USER_QA", label: "Teil 1 Q&A", sub: "Fragen" },
  { key: "PARTNER_PRESENTATION", label: "Teil 2", sub: "Vortrag (B)" },
  { key: "PARTNER_QA", label: "Teil 2 Q&A", sub: "Diskussion" },
  { key: "DEBATE", label: "Teil 3", sub: "Debatte" },
  { key: "RESULT", label: "Ergebnis", sub: "Bewertung" },
];

const ALLOW_BARGE_IN = false;
const MIN_VOICED_MS = 400;
const SPEECH_MARGIN = 8;
const MIN_THRESHOLD = 22;
const IDLE_RESTART_MS = 3000;
const AFTER_AI_IGNORE_MS = 700;

// FIX 1: Dynamic WS URL for secure wss:// in production
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8787/voice";

export default function ExamPage() {
  const [status, setStatus] = useState("Press Start Exam");
  const [stage, setStage] = useState<ExamStage>("PREPARATION");
  const [timer, setTimer] = useState(STAGE_SECONDS.PREPARATION);
  const [messages, setMessages] = useState<
    { id: string; sender: "examiner" | "partner" | "user" | "system"; text: string; time: string }[]
  >([]);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"examiner" | "partner" | "user" | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // FIX 2: Busy State to prevent Race Conditions
  const [isAiBusy, setIsAiBusy] = useState(false); 
  const [examEvaluation, setExamEvaluation] = useState<any>(null); // Stores real backend result

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const stageRef = useRef<ExamStage>("PREPARATION");
  const isSpeakingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechDetectedRef = useRef(false);
  const noiseFloorRef = useRef(10);
  const voicedMsRef = useRef(0);
  const lastFrameRef = useRef(0);
  const ignoreUntilRef = useRef(0);
  const recorderBusyRef = useRef(false);
  const lastRestartRef = useRef(0);
  const interruptSentRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  
  const handleStageChangeRef = useRef<((s: ExamStage) => void) | null>(null);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const topics = {
    speech1: "Beschreiben Sie Ihre Heimatstadt.",
    speech2: "Sollte Online-Lernen Schulen ersetzen?",
    debate: "Sollten soziale Medien für Jugendliche begrenzt werden?",
  };

  // =========================
  // FIX 3: ENFORCED TIMER LOGIC
  // =========================
  useEffect(() => {
    if (!examStarted) return;
    let left = STAGE_SECONDS[stage];
    setTimer(left);
    if (left <= 0) return;
    
    const interval = setInterval(() => {
      left -= 1;
      setTimer(left);
      if (left <= 0) {
        clearInterval(interval);
        // Force audio to stop when time is up
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        setIsAiBusy(false);
        const nxt = NEXT_STAGE[stageRef.current];
        if (nxt && handleStageChangeRef.current) handleStageChangeRef.current(nxt);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, stage]);

  const restartRecorder = useCallback(async () => {
    if (recorderBusyRef.current || !micStreamRef.current) return;
    recorderBusyRef.current = true;
    try {
      const old = mediaRecorderRef.current;
      if (old && old.state !== "inactive") {
        old.stop();
        await new Promise((r) => setTimeout(r, 150));
      }
      audioChunksRef.current = [];
      const mr = new MediaRecorder(micStreamRef.current, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start(100);
      lastRestartRef.current = performance.now();
    } finally {
      recorderBusyRef.current = false;
    }
  }, []);

  const playAudioMp3 = useCallback(
    async (base64: string) => {
      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }

        isPlayingRef.current = true;
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        interruptSentRef.current = false;

        speechDetectedRef.current = false;
        voicedMsRef.current = 0;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setActiveSpeaker(null);
          interruptSentRef.current = false;
          setIsAiBusy(false); // AI finished speaking, unlock UI

          const currentStg = stageRef.current;
          
          if (AUTO_ADVANCE_STAGES.includes(currentStg)) {
            setStatus("AI finished. Auto-advancing...");
            setTimeout(() => {
              const nxt = NEXT_STAGE[currentStg];
              if (nxt && handleStageChangeRef.current) {
                handleStageChangeRef.current(nxt);
              }
            }, 1200);
          } else {
            setStatus("Listening... speak now 🎤");
            ignoreUntilRef.current = performance.now() + AFTER_AI_IGNORE_MS;
            setTimeout(() => {
              if (!speechDetectedRef.current) void restartRecorder();
            }, AFTER_AI_IGNORE_MS);
          }
        };

        audio.onerror = () => {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setIsAiBusy(false);
          setActiveSpeaker(null);
        };

        await audio.play();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("Audio play error:", err);
        isPlayingRef.current = false;
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setIsAiBusy(false);
        setActiveSpeaker(null);
      }
    },
    [restartRecorder]
  );

  const processSpeech = useCallback(async () => {
    if (isSpeakingRef.current || !mediaRecorderRef.current || isAiBusy) return;

    const voicedMs = voicedMsRef.current;
    voicedMsRef.current = 0;

    recorderBusyRef.current = true;
    mediaRecorderRef.current.stop();
    await new Promise((r) => setTimeout(r, 200));

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    if (micStreamRef.current) {
      const mr = new MediaRecorder(micStreamRef.current, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start(100);
      lastRestartRef.current = performance.now();
    }
    recorderBusyRef.current = false;

    if (voicedMs < MIN_VOICED_MS) {
      if (!AUTO_ADVANCE_STAGES.includes(stageRef.current)) {
        setStatus("Listening... speak now 🎤");
      }
      return;
    }

    if (audioBlob.size < 3000) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setStatus("Processing speech...");
      setIsAiBusy(true); // Lock the UI while waiting for Groq/Cartesia
      const arrayBuffer = await audioBlob.arrayBuffer();
      wsRef.current.send(arrayBuffer);
    }
  }, [isAiBusy]);

  const connectWS = useCallback(
    async (currentStage: ExamStage) => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      isPlayingRef.current = false;
      setConnected(false);

      let token = "";
      try {
        const r = await fetch("/api/ws-token");
        if (r.ok) token = ((await r.json()) as { token?: string }).token || "";
      } catch {
        token = "";
      }

      const ws = new WebSocket(token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "start", stage: currentStage }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === "connected") {
            setConnected(true);
            setStatus("Connected! Starting...");
          }

          if (msg.type === "processing") {
            setStatus("AI thinking...");
            setIsAiBusy(true);
          }

          if (msg.type === "audio_mp3") {
            const speakerRole =
              msg.speaker === "partner" ||
              ["USER_QA", "PARTNER_PRESENTATION", "PARTNER_QA", "DEBATE"].includes(stageRef.current)
                ? "partner"
                : "examiner";
            setActiveSpeaker(speakerRole);
            await playAudioMp3(msg.data as string);
          }

          // FIX 4: Real Backend Scoring Integration
          if (msg.type === "exam_result") {
            setExamEvaluation(msg.data);
            setShowResultModal(true);
            
            // Format the transcript for Admin dashboard demo sync
            const formattedTranscript = messages.map((m) => ({
              speaker: m.sender === "user" ? "STUDENT" : m.sender === "examiner" ? "EXAMINER (Rachel)" : "PARTNER (Josh)",
              text: m.text,
            }));

            // Pass the REAL data to local storage so the admin panel matches perfectly
            const examResult = {
              lastScore: msg.data.score || 0, 
              cefrBreakdown: msg.data.breakdown || { pronunciation: 0, grammar: 0, vocabulary: 0, taskCompletion: 0 },
              weakness: msg.data.weakness || "Pending review",
              recentTranscript: formattedTranscript,
            };
            localStorage.setItem("demoExamResult", JSON.stringify(examResult));
          }

          if (msg.type === "transcript_ai") {
            const isPartner =
              msg.speaker === "partner" ||
              ["USER_QA", "PARTNER_PRESENTATION", "PARTNER_QA", "DEBATE"].includes(stageRef.current);

            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: isPartner ? "partner" : "examiner",
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

          if (msg.type === "interrupted") {
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
            }
            isPlayingRef.current = false;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            setIsAiBusy(false);
            setActiveSpeaker(null);
            interruptSentRef.current = false;
            setStatus("Listening... 🎤");
          }

          if (msg.type === "error") {
            console.warn("Backend Error Handled");
            setStatus("Network problem — please speak again 🎤");
            setIsAiBusy(false);
          }
        } catch (err) {
          console.error("WS message error:", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setStatus("Disconnected");
      };

      ws.onerror = () => setStatus("Connection error");
    },
    [playAudioMp3, messages]
  );

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      });
      micStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(100);
      setIsListening(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const LOW_BIN = 10;
      const HIGH_BIN = 109;
      lastFrameRef.current = performance.now();
      lastRestartRef.current = performance.now();

      const checkVAD = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = LOW_BIN; i <= HIGH_BIN; i++) sum += dataArray[i];
        const volume = sum / (HIGH_BIN - LOW_BIN + 1);

        setAudioLevel(Math.min(100, Math.round(volume * 2.5)));

        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;
        
        const isMicDisabled = AUTO_ADVANCE_STAGES.includes(stageRef.current) || isAiBusy;
        
        // FIX 5: Audio Buffer Memory Leak
        // Continuously empty recording chunks if the user is not supposed to be speaking
        if (isMicDisabled) {
          audioChunksRef.current = [];
        }

        const busy = isSpeakingRef.current || now < ignoreUntilRef.current || isMicDisabled;

        if (!busy && !speechDetectedRef.current) {
          noiseFloorRef.current = noiseFloorRef.current * 0.97 + volume * 0.03;
        }
        const threshold = Math.max(MIN_THRESHOLD, noiseFloorRef.current * 1.8 + SPEECH_MARGIN);
        const loud = volume > threshold;

        if (loud && !busy) {
          voicedMsRef.current += dt;
          if (!speechDetectedRef.current) {
            speechDetectedRef.current = true;
            setActiveSpeaker("user");
            setStatus("Speaking... 🎤");
          }
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (speechDetectedRef.current && !busy) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(async () => {
              speechDetectedRef.current = false;
              setActiveSpeaker(null);
              silenceTimerRef.current = null;
              await processSpeech();
            }, 1200);
          }
        }

        if (
          !busy &&
          !speechDetectedRef.current &&
          !loud &&
          !recorderBusyRef.current &&
          now - lastRestartRef.current > IDLE_RESTART_MS
        ) {
          void restartRecorder();
        }

        requestAnimationFrame(checkVAD);
      };

      requestAnimationFrame(checkVAD);
    } catch (err) {
      console.error("Mic error:", err);
      setStatus("Microphone access denied or error");
    }
  }, [processSpeech, restartRecorder, isAiBusy]);

  function handleStageChange(newStage: ExamStage) {
    setStage(newStage);
    stageRef.current = newStage;
    setIsAiBusy(false);
    
    if (AUTO_ADVANCE_STAGES.includes(newStage)) {
      setStatus("Nur Zuhören (AI speaking)");
    } else {
      setStatus("Bereit. Bitte sprechen Sie...");
    }

    if (newStage === "RESULT") {
      // Backend will now calculate and send the real result via WebSocket msg.type="exam_result"
      setStatus("Analyzing final score...");
      setIsAiBusy(true); 
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setActiveSpeaker(null);
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "system",
        text: `--- ${newStage} ---`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stage_change", stage: newStage }));
    } else {
      void connectWS(newStage);
    }
  }

  handleStageChangeRef.current = handleStageChange;

  async function startExam() {
    setExamStarted(true);
    setStatus("Starting...");
    await startMic();
    void connectWS("PREPARATION");
  }

  function nextStage() {
    if (isAiBusy) return; // Block skip if AI is thinking/speaking
    const nxt = NEXT_STAGE[stageRef.current];
    if (nxt) handleStageChange(nxt);
  }

  function endAll() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    wsRef.current?.close();
    setConnected(false);
    setExamStarted(false);
    setActiveSpeaker(null);
    
    // In an emergency cancel, just show a generic closed modal
    setExamEvaluation({
      score: 0,
      breakdown: { pronunciation: 0, grammar: 0, vocabulary: 0, taskCompletion: 0 },
      weakness: "Exam ended early."
    });
    setShowResultModal(true);
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const isMicDisabledUi = AUTO_ADVANCE_STAGES.includes(stage) || isAiBusy;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* HEADER */}
      <header className="border-b border-neutral-800/80 bg-[#0d121c]/70 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-md shadow-amber-500/20">
            DE
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              German Practice Exam
            </h1>
            <p className="text-[11px] text-neutral-400 mt-0.5">Unofficial AI Training Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-full text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="font-mono text-[11px] text-neutral-300">
              {connected ? " Live" : " Offline"}
            </span>
          </div>
          <div
            className={`font-mono font-bold text-sm px-3 py-1.5 rounded-lg border transition-all ${
              timer < 60
                ? "bg-rose-950/40 border-rose-800/60 text-rose-400 animate-pulse"
                : "bg-neutral-900/90 border-neutral-800 text-amber-400"
            }`}
          >
            {timerDisplay}
          </div>
        </div>
      </header>

      {/* STAGE STEPPER */}
      <nav aria-label="Exam Progress" className="bg-[#0b0f17] border-b border-neutral-800/60 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs gap-3">
          {STAGE_DISPLAY_GROUPS.map((stg, i) => {
            const isActive = stage === stg.key;
            return (
              <div
                key={stg.key}
                onClick={() => { if(!isAiBusy) handleStageChange(stg.key) }}
                className={`flex items-center gap-2 min-w-max ${isAiBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
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
                  <span
                    className={`font-semibold ${
                      isActive ? "text-amber-400" : "text-neutral-300"
                    }`}
                  >
                    {stg.label}
                  </span>
                  <span className="text-[9px] text-neutral-500 hidden sm:block">{stg.sub}</span>
                </div>
                {i < STAGE_DISPLAY_GROUPS.length - 1 && (
                  <span className="text-neutral-700 mx-2">/</span>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-5 flex flex-col justify-between bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3 mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Prüfungsraum &bull; Teilnehmer
            </h2>
            <span className="text-[11px] font-mono text-amber-400/90">{status}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            {/* ME */}
            <div
              className={`rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center ${
                activeSpeaker === "user"
                  ? "bg-emerald-950/20 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                  : isMicDisabledUi
                  ? "bg-neutral-950 border-neutral-900 opacity-60"
                  : "bg-neutral-900/60 border-neutral-800/80"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                  activeSpeaker === "user"
                    ? "bg-emerald-500 text-black scale-105 shadow-md shadow-emerald-500/30"
                    : isMicDisabledUi
                    ? "bg-neutral-900 text-neutral-600 border border-neutral-800"
                    : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                }`}
              >
                ME
              </div>
              <h3 className="text-xs font-bold text-white">Sie (Kandidat A)</h3>
              <p className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                {activeSpeaker === "user" ? "Spricht..." : isMicDisabledUi ? "Stumm (Zuhören)" : "Bereit"}
              </p>
            </div>

            {/* CANDIDATE B */}
            <div
              className={`rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center ${
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
              <h3 className="text-xs font-bold text-white">Josh (Kandidat B)</h3>
              <p className="text-[10px] text-indigo-400/90 font-mono mt-0.5">
                {activeSpeaker === "partner" ? "Spricht..." : "Hört zu"}
              </p>
            </div>
          </div>

          {/* EXAMINER */}
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
              <h3 className="text-xs font-bold text-white">Rachel (Prüferin)</h3>
              <p className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                {activeSpeaker === "examiner"
                  ? "Spricht..."
                  : "Beobachtet & bewertet"}
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

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800/60 mt-2">
            {!examStarted ? (
              <button
                onClick={startExam}
                className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
              >
                🎓 Start Exam
              </button>
            ) : (
              <>
                <button
                  onClick={nextStage}
                  disabled={stage === "RESULT" || !connected || isAiBusy}
                  className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs border border-neutral-700 transition-all"
                >
                  Skip to Next &rarr;
                </button>
                <button
                  onClick={endAll}
                  disabled={!connected}
                  className="bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 font-bold py-2.5 rounded-xl text-xs border border-rose-800/50 transition-all"
                >
                  End Call &#10005;
                </button>
              </>
            )}
          </div>
        </section>

        {/* MIDDLE COLUMN: EXAM TOPICS */}
        <section className="lg:col-span-4 flex flex-col bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm overflow-y-auto">
          <div className="border-b border-neutral-800/60 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Exam Topics
            </h2>
            <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-mono">
              B1 / B2
            </span>
          </div>

          <div className="space-y-3.5">
            <div
              className={`rounded-xl p-3.5 border transition-all ${
                stage === "USER_PRESENTATION" || stage === "USER_QA"
                  ? "bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-500/10"
                  : "bg-neutral-900/40 border-neutral-800/60 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold">
                  Speech 1
                </span>
                {(stage === "USER_PRESENTATION" || stage === "USER_QA") && (
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider animate-pulse">
                    AKTIV
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{topics.speech1}</h3>
              <p className="text-[11px] text-neutral-400">
                Beschreiben Sie persönliche Erfahrungen, Vor- und Nachteile sowie ein Fazit.
              </p>
            </div>

            <div
              className={`rounded-xl p-3.5 border transition-all ${
                stage === "PARTNER_PRESENTATION" || stage === "PARTNER_QA"
                  ? "bg-indigo-950/20 border-indigo-500/70 shadow-md shadow-indigo-500/10"
                  : "bg-neutral-900/40 border-neutral-800/60 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-indigo-300 font-bold">
                  Speech 2
                </span>
                {(stage === "PARTNER_PRESENTATION" || stage === "PARTNER_QA") && (
                  <span className="text-[10px] text-indigo-400 font-bold tracking-wider animate-pulse">
                    AKTIV
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{topics.speech2}</h3>
              <p className="text-[11px] text-neutral-400">
                Hören Sie der Präsentation Ihres Partners zu und stellen Sie Rückfragen.
              </p>
            </div>

            <div
              className={`rounded-xl p-3.5 border transition-all ${
                stage === "DEBATE"
                  ? "bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-500/10"
                  : "bg-neutral-900/40 border-neutral-800/60 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold">
                  Debate
                </span>
                {stage === "DEBATE" && (
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider animate-pulse">
                    AKTIV
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{topics.debate}</h3>
              <p className="text-[11px] text-neutral-400">
                Diskutieren Sie gemeinsam und einigen Sie sich auf einen Kompromiss.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE CONVERSATION */}
        <section className="lg:col-span-3 flex flex-col bg-[#0e131f]/80 border border-neutral-800/80 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden h-[580px] lg:h-auto">
          <div className="border-b border-neutral-800/60 px-4 py-3 bg-neutral-900/40 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Live Conversation
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              REC
            </span>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-4">
                <p className="text-[11px]">Start exam to begin...</p>
              </div>
            ) : (
              messages.map((m) => {
                if (m.sender === "system") {
                  return (
                    <div
                      key={m.id}
                      className="py-1 text-center font-mono text-[10px] text-amber-400/80 uppercase tracking-wider"
                    >
                      {m.text}
                    </div>
                  );
                }

                const isUser = m.sender === "user";
                const isExaminer = m.sender === "examiner";

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[9px] text-neutral-400 mb-0.5 font-mono">
                      {isUser ? "YOU" : isExaminer ? "EXAMINER (Rachel)" : "PARTNER (Josh)"} &bull;{" "}
                      {m.time}
                    </span>
                    <div
                      className={`max-w-[90%] rounded-xl p-2.5 text-[11px] leading-relaxed ${
                        isUser
                          ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                          : isExaminer
                          ? "bg-blue-950/50 text-blue-100 border border-blue-800/50"
                          : "bg-purple-950/50 text-purple-100 border border-purple-800/50"
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

      {/* COMPLIANT RESULT MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-neutral-700 max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">B1 Practice Exam Result</h2>
            <p className="text-xs text-neutral-400 mb-4">AI Evaluation Estimate</p>
            <div className="space-y-2.5 mb-5">
              {[
                { k: "Wortschatz (Vocabulary)", v: `${examEvaluation?.breakdown?.vocabulary || 0} / 10` },
                { k: "Aufgabenerfüllung (Task)", v: `${examEvaluation?.breakdown?.taskCompletion || 0} / 10` },
                { k: "Formale Richtigkeit (Grammar)", v: `${examEvaluation?.breakdown?.grammar || 0} / 10` },
                { k: "Aussprache (Pronunciation)", v: `${examEvaluation?.breakdown?.pronunciation || 0} / 10` },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between p-2.5 bg-neutral-900/60 rounded-lg text-xs border border-neutral-800"
                >
                  <span className="text-neutral-300">{item.k}</span>
                  <span className="font-mono font-bold text-amber-400">{item.v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className={`text-sm font-bold ${examEvaluation?.score >= 24 ? "text-emerald-400" : "text-rose-400"}`}>
                {examEvaluation?.score >= 24 ? "BESTANDEN" : "NICHT BESTANDEN"} ({examEvaluation?.score || 0} / 40)
              </span>
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