"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ViewTab = "practice" | "institute" | "analytics";
type ReportTab = "writing" | "reading" | "speech" | "debate" | "b2-exam";

export default function StudentHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>("practice");
  const [activeReport, setActiveReport] = useState<ReportTab>("b2-exam");
  const [tokens, setTokens] = useState(8);
  const [xp, setXp] = useState(1450);
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);

  // Daily Mini-Game State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizWords = [
    { noun: "Ausbildung", article: "die", translation: "Vocational Training" },
    { noun: "Krankenhaus", article: "das", translation: "Hospital" },
    { noun: "Beruf", article: "der", translation: "Profession" },
  ];

  const handleArticleGuess = (guess: string) => {
    const current = quizWords[quizIndex];
    if (guess === current.article) {
      setQuizFeedback("✅ +15 XP");
      setXp((prev) => prev + 15);
      setTimeout(() => {
        setQuizFeedback(null);
        setQuizIndex((prev) => (prev + 1) % quizWords.length);
      }, 900);
    } else {
      setQuizFeedback(`❌ ${current.article} ${current.noun}`);
    }
  };

  const handleStartExam = () => {
    setTokens((t) => Math.max(0, t - 1));
    router.push("/exam");
  };

  const openMistakes = () => {
    setActiveTab("analytics");
    setActiveReport("b2-exam");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* PREMIUM HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#07090e]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LEFT: BRANDING & METRICS */}
          <div className="flex items-stretch gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20 shrink-0">
              DE
            </div>
            <div className="flex flex-col justify-between py-0.5">
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-sm tracking-tight text-white hidden sm:block">
                  LOS ANDES Institute of Management & Technology
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-orange-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
                  <span>14d</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-sky-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <span>{xp} XP</span>
                </div>
                <div
                  onClick={() => setShowTokenConfirm(true)}
                  className="cursor-pointer flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 hover:bg-emerald-900/40 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  <span>{tokens} Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TABS & PROFILE */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-1 bg-[#0b0e17] p-1 rounded-xl border border-neutral-800/60 shadow-inner">
              <button
                onClick={() => setActiveTab("practice")}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "practice"
                    ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800/50 border border-transparent"
                }`}
              >
                Practice Hub
              </button>
              <button
                onClick={() => setActiveTab("institute")}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "institute"
                    ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800/50 border border-transparent"
                }`}
              >
                My Institute
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "analytics"
                    ? "bg-amber-500/10 text-amber-400 shadow-md border border-amber-500/30"
                    : "text-neutral-500 hover:text-amber-400/80 hover:bg-amber-500/5 border border-transparent"
                }`}
              >
                Performance
              </button>
            </nav>

            <div className="h-8 w-px bg-neutral-800 hidden lg:block" />

            <div className="cursor-pointer flex items-center gap-3 hover:opacity-80 transition-all group">
              <div className="hidden md:flex flex-col justify-center text-right">
                <p className="text-xs font-extrabold text-white leading-none mb-1">favaz.am</p>
                <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider leading-none">Student Account</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-base shadow-inner group-hover:border-amber-500/50 transition-colors">
                👨‍💻
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* TAB 1: PRACTICE HUB */}
        {activeTab === "practice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: HERO & SKILLS GRID */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="relative overflow-hidden rounded-3xl bg-[#0b0e17] border border-neutral-800/60 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold mb-4 inline-block">
                  B1 / B2 Speaking Simulator
                </span>
                
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                  8-Stage Live Speaking Room
                </h2>
                
                <p className="text-sm text-neutral-400 max-w-xl mb-8 leading-relaxed">
                  Enter a realistic 25-minute voice simulation with AI Examiner Rachel. Test your presentation, Q&amp;A, and debate reflexes under real exam pressure.
                </p>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button
                    onClick={() => setShowTokenConfirm(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    Launch Exam (1 🎟️)
                  </button>
                  <button
                    onClick={openMistakes}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-neutral-600 font-bold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center gap-2"
                  >
                    Show Recent Mistakes &rarr;
                  </button>
                </div>
              </div>

              {/* PREMIUM SKILLS GRID WITH SVG ICONS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    title: "Writing", 
                    status: "Level 12", 
                    svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  },
                  { 
                    title: "Reading", 
                    status: "Level 15",
                    svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  },
                  { 
                    title: "Speech", 
                    status: "B1 Active",
                    svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  },
                  { 
                    title: "Debate", 
                    status: "B2 Exam", 
                    active: true,
                    svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center h-36 group ${
                      skill.active
                        ? "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10 shadow-lg shadow-amber-500/5"
                        : "bg-[#0b0e17] border-neutral-800/60 hover:border-neutral-600"
                    }`}
                  >
                    <div className={`mb-3 transition-colors ${skill.active ? "text-amber-400" : "text-neutral-400 group-hover:text-white"}`}>
                      {skill.svg}
                    </div>
                    <h3 className={`text-xs font-extrabold ${skill.active ? "text-amber-400" : "text-white"}`}>
                      {skill.title}
                    </h3>
                    <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-wider">{skill.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold tracking-widest">
                    Daily Mini-Game
                  </span>
                  <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    Unlimited
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-white mb-2">
                  Der, Die oder Das?
                </h3>
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  Build muscle memory for essential vocabulary. No exam tokens required.
                </p>

                <div className="bg-[#121622] border border-neutral-800/80 rounded-2xl p-6 text-center my-auto shadow-inner">
                  <p className="text-xl font-black text-white tracking-wide">
                    ___ {quizWords[quizIndex].noun}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2 font-mono uppercase tracking-wider">
                    {quizWords[quizIndex].translation}
                  </p>
                </div>

                <div className="h-6 mt-5 mb-3 flex items-center justify-center">
                  {quizFeedback && (
                    <p className={`text-xs font-bold ${quizFeedback.includes("✅") ? "text-emerald-400" : "text-rose-400"}`}>
                      {quizFeedback}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-auto">
                  {["der", "die", "das"].map((art) => (
                    <button
                      key={art}
                      onClick={() => handleArticleGuess(art)}
                      className="bg-[#121622] hover:bg-amber-400 hover:text-black text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all border border-neutral-800 hover:border-amber-400"
                    >
                      {art}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY INSTITUTE */}
        {activeTab === "institute" && (
          <div className="space-y-6">
            {/* Institute Header Info */}
            <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/60 pb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-widest mb-2 block">
                    Batch Code: LA-B1-084
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Los Andes Institute of Management &amp; Technology
                  </h2>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-5 py-2 rounded-xl font-bold whitespace-nowrap">
                  Enrolled &bull; Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-center">
                <div className="bg-[#121622] border border-neutral-800/80 p-5 rounded-2xl">
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-1.5">Current Batch</p>
                  <p className="text-base font-extrabold text-white">B1 Nursing Track</p>
                </div>
                <div className="bg-[#121622] border border-neutral-800/80 p-5 rounded-2xl">
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-1.5">Attendance</p>
                  <p className="text-base font-extrabold text-emerald-400">92% (22/24 Days)</p>
                </div>
                <div className="bg-[#121622] border border-neutral-800/80 p-5 rounded-2xl">
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-1.5">Next Offline Class</p>
                  <p className="text-base font-extrabold text-amber-400">Mon, 9:30 AM</p>
                </div>
              </div>
            </div>

            {/* LEADERBOARDS (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard 1: Batch-Wise */}
              <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-6 border-b border-neutral-800/60 pb-3">
                  🏆 Batch Leaderboard (B1 Nursing)
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { rank: 1, name: "Anjali Menon", xp: "1,820 XP", badge: "🥇" },
                    { rank: 2, name: "favaz.am (You)", xp: `${xp} XP`, badge: "🥈", highlight: true },
                    { rank: 3, name: "Rahul Krishnan", xp: "1,390 XP", badge: "🥉" },
                    { rank: 4, name: "Sneha Varghese", xp: "1,120 XP", badge: "4" },
                    { rank: 5, name: "Kiran Thomas", xp: "980 XP", badge: "5" },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        s.highlight
                          ? "bg-amber-500/10 border-amber-500/30 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                          : "bg-[#121622] border-neutral-800/60 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-base w-6 text-center">{s.badge}</span>
                        <span className={s.highlight ? "text-amber-400 font-black" : "font-bold"}>{s.name}</span>
                      </div>
                      <span className="font-mono font-bold">{s.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard 2: All Institute */}
              <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-6 border-b border-neutral-800/60 pb-3">
                  🌍 All Institute Leaderboard
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { rank: 1, name: "Deepak S. (B2 IT)", xp: "3,450 XP", badge: "🥇" },
                    { rank: 2, name: "Maria John (B2 Care)", xp: "3,120 XP", badge: "🥈" },
                    { rank: 3, name: "Arjun K. (B1 General)", xp: "2,890 XP", badge: "🥉" },
                    { rank: 4, name: "Sara Ali (B1 Nursing)", xp: "2,540 XP", badge: "4" },
                    { rank: 12, name: "favaz.am (You)", xp: `${xp} XP`, badge: "12", highlight: true },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        s.highlight
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "bg-[#121622] border-neutral-800/60 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-base w-6 text-center">{s.badge}</span>
                        <span className={s.highlight ? "text-emerald-400 font-black" : "font-bold"}>{s.name}</span>
                      </div>
                      <span className="font-mono font-bold">{s.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERFORMANCE ANALYTICS (FORMERLY SMART VAULT) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* SUB-NAVIGATION */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-800/60 pb-4">
              {[
                { id: "writing", label: "Writing" },
                { id: "reading", label: "Reading" },
                { id: "speech", label: "Speaking" },
                { id: "debate", label: "Debate" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id as ReportTab)}
                  className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    activeReport === tab.id
                      ? "bg-neutral-800 text-white shadow-inner border border-neutral-700"
                      : "text-neutral-500 hover:text-white border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              
              <div className="w-px h-6 bg-neutral-800 mx-2" />
              
              {/* Highlighted B2 Exam Tab */}
              <button
                onClick={() => setActiveReport("b2-exam")}
                className={`px-6 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all ${
                  activeReport === "b2-exam"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "bg-transparent text-neutral-500 border border-neutral-800 hover:border-amber-500/30 hover:text-amber-400"
                }`}
              >
                B2 Exam Result
              </button>
            </div>

            {/* SPLIT RESULT VIEW (MISTAKES VS NON-MISTAKES) */}
            {activeReport === "b2-exam" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT: MASTERED (NON-MISTAKES) */}
                <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Mastered Constructs</h3>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">Correct Usage &amp; Strengths</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { type: "Vocabulary", text: "Die Sehenswürdigkeiten in meiner Heimatstadt sind wunderschön.", highlight: "Sehenswürdigkeiten" },
                      { type: "Grammar", text: "Weil das Wetter gut war, sind wir spazieren gegangen.", highlight: "Weil... war," },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-[#121622] rounded-2xl border border-neutral-800">
                        <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-2">{item.type} Check passed</p>
                        <p className="text-sm text-neutral-300">
                          {item.text.split(item.highlight).map((part, index, array) => (
                            <span key={index}>
                              {part}
                              {index < array.length - 1 && <span className="text-emerald-300 font-bold border-b border-emerald-500/30">{item.highlight}</span>}
                            </span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: DIAGNOSTIC (MISTAKES) */}
                <div className="bg-[#0b0e17] border border-neutral-800/60 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-1 h-full bg-rose-500/50" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Diagnostic Corrections</h3>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">Identified Exam Mistakes</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-rose-950/10 rounded-2xl border border-rose-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-mono text-rose-400 uppercase tracking-widest">Grammar Error (Gender)</p>
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded uppercase font-bold">Priority Fix</span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-neutral-500 mb-1">You said:</p>
                        <p className="text-sm text-neutral-300 line-through decoration-rose-500/50">Ich arbeite in <span className="text-rose-400">der</span> Krankenhaus.</p>
                      </div>
                      
                      <div className="p-3 bg-[#121622] rounded-xl border border-emerald-900/30">
                        <p className="text-xs text-neutral-500 mb-1">Correction:</p>
                        <p className="text-sm font-bold text-emerald-400">Ich arbeite in <span className="text-emerald-300 underline underline-offset-4 decoration-emerald-500/50">dem</span> Krankenhaus.</p>
                        <p className="text-[10px] text-emerald-500/70 mt-2 font-mono">Dative case neutral (das &rarr; dem)</p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-950/10 rounded-2xl border border-amber-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Vocabulary (Debate)</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-neutral-500 mb-1">You hesitated &amp; used basic word:</p>
                        <p className="text-sm text-neutral-300">Wir müssen eine <span className="text-amber-400 border-b border-amber-500/50 border-dashed">Lösung</span> finden.</p>
                      </div>
                      <div className="p-3 bg-[#121622] rounded-xl border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">B2 Alternative:</p>
                        <p className="text-sm font-bold text-white">Wir müssen einen <span className="text-amber-400">Kompromiss</span> finden.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0b0e17] rounded-3xl border border-neutral-800/60">
                <p className="text-neutral-400 font-mono text-xs uppercase tracking-widest">{activeReport} analytics module pending</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TOKEN CONFIRMATION MODAL */}
      {showTokenConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-neutral-700 rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2">
              🎟️ Use 1 Exam Token?
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              This will start a full 8-stage live voice simulation. You have{" "}
              <span className="text-amber-400 font-bold">{tokens} tokens</span> remaining this month.
            </p>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setShowTokenConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#121622] text-neutral-300 border border-neutral-700 hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExam}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all"
              >
                Enter Exam Room &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}