"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ExamStage =
  | "PREPARATION"
  | "USER_SPEECH"
  | "AI_PARTNER_SPEECH"
  | "DEBATE"
  | "RESULT";

const STAGE_SECONDS: Record<ExamStage, number> = {
  PREPARATION: 300,
  USER_SPEECH: 180,
  AI_PARTNER_SPEECH: 180,
  DEBATE: 180,
  RESULT: 0,
};

const NEXT_STAGE: Record<ExamStage, ExamStage | null> = {
  PREPARATION: "USER_SPEECH",
  USER_SPEECH: "AI_PARTNER_SPEECH",
  AI_PARTNER_SPEECH: "DEBATE",
  DEBATE: "RESULT",
  RESULT: null,
};

export default function ExamPage() {
  const [status, setStatus] = useState("Press Start Exam");
  const [stage, setStage] = useState<ExamStage>("PREPARATION");
  const [timer, setTimer] = useState(300);
  const [messages, setMessages] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [connected, setConnected] = useState(false);

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
  const interruptSentRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  const topics = {
    speech1: "Beschreiben Sie Ihre Heimatstadt.",
    speech2: "Sollte Online-Lernen Schulen ersetzen?",
    debate: "Sollten soziale Medien fur Jugendliche begrenzt werden?",
  };

  // =========================
  // TIMER
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
        const nxt = NEXT_STAGE[stageRef.current];
        if (nxt) handleStageChange(nxt);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted, stage]);

  // =========================
  // PLAY MP3 AUDIO
  // =========================
  const playAudioMp3 = useCallback(async (base64: string) => {
    try {
      // Stop current audio if playing
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      isPlayingRef.current = true;
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      interruptSentRef.current = false;

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
        interruptSentRef.current = false;
        setStatus("Listening... speak now 🎤");
      };

      audio.onerror = () => {
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      };

      await audio.play();
    } catch (err) {
      console.error("Audio play error:", err);
      isPlayingRef.current = false;
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  // =========================
  // PROCESS SPEECH
  // =========================
  const processSpeech = useCallback(async () => {
    if (isSpeakingRef.current) return;
    if (!mediaRecorderRef.current) return;

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
    }

    if (audioBlob.size < 3000) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setStatus("Processing speech...");
      const arrayBuffer = await audioBlob.arrayBuffer();
      wsRef.current.send(arrayBuffer);
    }
  }, []);

  // =========================
  // CONNECT WEBSOCKET
  // =========================
  const connectWS = useCallback((currentStage: ExamStage) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isPlayingRef.current = false;
    setConnected(false);

    const ws = new WebSocket("ws://localhost:8787/voice");
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
        }

        // MP3 audio from Cartesia HTTP API
        if (msg.type === "audio_mp3") {
          await playAudioMp3(msg.data as string);
        }

        if (msg.type === "turn_complete") {
          if (!isPlayingRef.current) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            setStatus("Listening... speak now 🎤");
          }
        }

        if (msg.type === "transcript_ai") {
          setMessages((prev) => [...prev, `AI: ${msg.text as string}`]);
        }

        if (msg.type === "transcript_user") {
          setMessages((prev) => [...prev, `YOU: ${msg.text as string}`]);
        }

        if (msg.type === "interrupted") {
          // Stop audio immediately
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }
          isPlayingRef.current = false;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          interruptSentRef.current = false;
          setStatus("Listening... 🎤");
        }

        if (msg.type === "error") {
          console.error("Backend error:", msg.message);
          setStatus("Error — check console");
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
  }, [playAudioMp3]);

  // =========================
  // START MIC WITH VAD
  // =========================
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
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

      const checkVAD = () => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // Auto interrupt — higher threshold to avoid false triggers
        if (volume > 25 && isPlayingRef.current && !interruptSentRef.current) {
          interruptSentRef.current = true;
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "interrupt" }));
          }
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }
          isPlayingRef.current = false;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setStatus("Listening... 🎤");
        }

        // Speech detection
        if (volume > 20 && !isSpeakingRef.current) {
          if (!speechDetectedRef.current) {
            speechDetectedRef.current = true;
            setStatus("Speaking... 🎤");
          }
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (speechDetectedRef.current && !isSpeakingRef.current) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(async () => {
              speechDetectedRef.current = false;
              silenceTimerRef.current = null;
              await processSpeech();
            }, 1200);
          }
        }

        requestAnimationFrame(checkVAD);
      };

      requestAnimationFrame(checkVAD);
    } catch (err) {
      console.error("Mic error:", err);
      setStatus("Microphone error");
    }
  }, [processSpeech]);

  // =========================
  // STAGE CHANGE
  // =========================
  function handleStageChange(newStage: ExamStage) {
    setStage(newStage);
    stageRef.current = newStage;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setMessages((prev) => [...prev, `--- ${newStage} ---`]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stage_change", stage: newStage }));
    } else {
      connectWS(newStage);
    }
  }

  async function startExam() {
    setExamStarted(true);
    setStatus("Starting...");
    await startMic();
    connectWS("PREPARATION");
  }

  function nextStage() {
    if (stage === "PREPARATION") handleStageChange("USER_SPEECH");
    else if (stage === "USER_SPEECH") handleStageChange("AI_PARTNER_SPEECH");
    else if (stage === "AI_PARTNER_SPEECH") handleStageChange("DEBATE");
    else if (stage === "DEBATE") handleStageChange("RESULT");
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

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold">German Speaking Exam</h1>
      <p className="text-gray-400 mt-1">Powered by Cartesia + Groq</p>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="bg-gray-900 px-5 py-3 rounded-xl">
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-lg font-semibold">{status}</p>
        </div>
        <div className="bg-gray-900 px-5 py-3 rounded-xl">
          <p className="text-sm text-gray-400">Stage</p>
          <p className="text-lg font-semibold">{stage}</p>
        </div>
        <div className={`px-5 py-3 rounded-xl ${timer < 60 ? "bg-red-900" : "bg-gray-900"}`}>
          <p className="text-sm text-gray-400">Time Left</p>
          <p className="text-lg font-semibold">{timerDisplay}</p>
        </div>
        <div className={`px-5 py-3 rounded-xl ${connected ? "bg-green-900" : "bg-red-900"}`}>
          <p className="text-sm text-gray-400">Connection</p>
          <p className="text-lg font-semibold">{connected ? "🟢 Live" : "🔴 Offline"}</p>
        </div>
        <div className={`px-5 py-3 rounded-xl ${isSpeaking ? "bg-blue-900" : isListening ? "bg-green-900" : "bg-gray-800"}`}>
          <p className="text-sm text-gray-400">Voice</p>
          <p className="text-lg font-semibold">
            {isSpeaking ? "🔊 AI Speaking" : isListening ? "🎤 Listening" : "Standby"}
          </p>
        </div>
      </div>

      <div className="mt-8 border border-gray-700 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Exam Topics</h2>
        <p><span className="text-gray-400">Speech 1:</span> {topics.speech1}</p>
        <p className="mt-2"><span className="text-gray-400">Speech 2:</span> {topics.speech2}</p>
        <p className="mt-2"><span className="text-gray-400">Debate:</span> {topics.debate}</p>
      </div>

      {!examStarted && (
        <button onClick={startExam}
          className="mt-8 bg-green-600 hover:bg-green-700 px-10 py-4 rounded-xl text-xl font-bold">
          🎓 Start Exam
        </button>
      )}

      {examStarted && (
        <div className="mt-8 flex flex-wrap gap-4">
          <button onClick={nextStage} disabled={stage === "RESULT" || !connected}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold">
            Next Stage ⏭
          </button>
          <button onClick={() => { if (currentAudioRef.current) { currentAudioRef.current.pause(); } wsRef.current?.close(); }}
            disabled={!connected}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold">
            End Call 📵
          </button>
        </div>
      )}

      {examStarted && (
        <div className="mt-6 flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${
            isSpeaking ? "bg-blue-500 animate-pulse" :
            isListening ? "bg-green-500 animate-pulse" : "bg-gray-600"
          }`} />
          <p className="text-gray-400 text-sm">
            {isSpeaking ? "AI speaking — start talking to interrupt" :
             isListening ? "Listening — speak naturally" : "Standby"}
          </p>
        </div>
      )}

      <div className="mt-8 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Live Conversation</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 0 && <p className="text-gray-500">Start exam to begin...</p>}
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg text-sm ${
              msg.startsWith("AI:") ? "bg-blue-950 border border-blue-800" :
              msg.startsWith("YOU:") ? "bg-gray-800 border border-gray-600" :
              "bg-gray-900 text-gray-500 text-center"
            }`}>{msg}</div>
          ))}
        </div>
      </div>
    </main>
  );
}