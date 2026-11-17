"use client";

import { useState } from "react";

// Mock Data for the Admin Table
const STUDENTS = [
  {
    id: "LA-B1-084",
    name: "Muhammed Favaz",
    track: "B1 Nursing Track",
    attendance: "92%",
    tokensUsed: 3,
    score: 35,
    status: "Pass",
    scores: { pronunciation: 8.5, grammar: 9, vocabulary: 8.5, fluency: 9 },
    weakness: "Needs broader vocabulary in Debate stage",
    transcript:
      "Guten Tag, herzlich willkommen! Ich bin die Prüferin Rachel. Ihr Thema ist 'Beschreiben Sie Ihre Heimatstadt'. Josh wird das Thema 'Sollte Online-Lernen Schulen ersetzen?' präsentieren. Zuerst spricht der Student, danach Josh, jeweils mit Fragen im Anschluss. Anschließend diskutieren wir das Thema 'Sollten soziale Medien für Jugendliche begrenzt werden?'. Sie haben jetzt Vorbereitungszeit.",
  },
  {
    id: "LA-B1-012",
    name: "Anjali Menon",
    track: "B1 Nursing Track",
    attendance: "96%",
    tokensUsed: 4,
    score: 36,
    status: "Pass",
    scores: { pronunciation: 9, grammar: 9, vocabulary: 9, fluency: 9 },
    weakness: "Minor hesitation during Part 2 Q&A",
    transcript: "Guten Morgen. Ich möchte über meine Heimatstadt sprechen...",
  },
  {
    id: "LA-B1-042",
    name: "Rahul Krishnan",
    track: "B1 Hospitality Track",
    attendance: "74%",
    tokensUsed: 1,
    score: 21,
    status: "Review",
    scores: { pronunciation: 5.5, grammar: 5, vocabulary: 5.5, fluency: 5 },
    weakness: "Struggles with Nebensatz word order (Verb at end)",
    transcript: "Hallo... ich äh... komme aus... Kerala. Es ist sehr schön...",
  },
  {
    id: "LA-B2-019",
    name: "Sneha Varghese",
    track: "B2 IT & Engineering",
    attendance: "89%",
    tokensUsed: 5,
    score: 31,
    status: "Pass",
    scores: { pronunciation: 8, grammar: 7.5, vocabulary: 8, fluency: 7.5 },
    weakness: "Overusing basic connectors (und, aber) in B2 Debate",
    transcript: "Meiner Meinung nach ist Technologie sehr wichtig, weil...",
  },
];

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState("All Batches");
  const [selectedStudentId, setSelectedStudentId] = useState("LA-B1-084");

  const selectedStudent = STUDENTS.find((s) => s.id === selectedStudentId) || STUDENTS[0];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col font-sans selection:bg-emerald-400 selection:text-black">
      
      {/* PREMIUM EXAMINER HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0a0d14]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LEFT: SPANNING BRANDING */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-emerald-500/20 shrink-0">
              ADM
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  LOS ANDES Institute of Management &amp; Technology
                </h1>
                <div className="h-3.5 w-px bg-neutral-700 hidden sm:block" />
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold tracking-wider hidden sm:block">
                  EXAMINER
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS & EXAMINER PROFILE */}
          <div className="flex items-center gap-6">
            
            {/* Action Button */}
            <button className="hidden md:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-[11px] font-bold transition-all">
              <span>🔄</span> Reset Batch Tokens
            </button>

            <div className="h-8 w-px bg-neutral-800 hidden lg:block" />

            {/* Examiner Profile */}
            <div className="cursor-pointer flex items-center gap-3 hover:opacity-80 transition-all group">
              <div className="hidden md:flex flex-col justify-center text-right">
                <p className="text-xs font-extrabold text-white leading-none mb-1">Dr. S. Müller</p>
                <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider leading-none">Chief Examiner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-base shadow-inner group-hover:border-emerald-500/50 transition-colors">
                👩‍🏫
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
            <p className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider mb-1">Active Batch Students</p>
            <p className="text-3xl font-black text-white">124</p>
            <p className="text-[10px] text-emerald-400 mt-2 font-bold">3 Active Ausbildung Tracks</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
            <p className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider mb-1">B1 Passing Readiness</p>
            <p className="text-3xl font-black text-amber-400">84%</p>
            <p className="text-[10px] text-neutral-400 mt-2">Avg Score: 31.4 / 40</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
            <p className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider mb-1">Monthly Exam Tokens</p>
            <p className="text-3xl font-black text-sky-400">412 <span className="text-lg text-neutral-600">/ 1,200</span></p>
            <p className="text-[10px] text-neutral-400 mt-2">API Cost Protected (Cap: 10/mo)</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
            <p className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider mb-1">Top Batch Weakness</p>
            <p className="text-sm font-extrabold text-rose-400 mt-2 leading-tight">Nebensatz Word Order</p>
            <p className="text-[10px] text-neutral-400 mt-2">Detected in 36% of B1 speeches</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-4 overflow-x-auto no-scrollbar">
          {["All Batches", "B1 Nursing Track", "B1 Hospitality Track", "B2 IT & Engineering"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/10"
                  : "bg-neutral-900/50 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800"
              }`}
            >
              {tab}
            </button>
          ))}
          <p className="ml-auto text-[10px] font-mono text-neutral-500 hidden sm:block">
            Click any student row to inspect AI Transcript
          </p>
        </div>

        {/* BOTTOM SPLIT VIEW: TABLE & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: STUDENT TABLE (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0e131f] border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-neutral-900/80 border-b border-neutral-800 text-[9px] font-mono uppercase text-neutral-500 font-bold tracking-wider">
              <div className="col-span-4">Student / Reg No</div>
              <div className="col-span-3">Track</div>
              <div className="col-span-2 text-center">Attendance</div>
              <div className="col-span-3 text-right">Last AI Score</div>
            </div>
            
            <div className="divide-y divide-neutral-800/50">
              {STUDENTS.filter(s => activeTab === "All Batches" || s.track === activeTab).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`grid grid-cols-12 gap-4 items-center px-5 py-3.5 text-xs cursor-pointer transition-all ${
                    selectedStudentId === s.id
                      ? "bg-amber-500/5 border-l-2 border-amber-400"
                      : "hover:bg-neutral-900/40 border-l-2 border-transparent"
                  }`}
                >
                  <div className="col-span-4">
                    <p className={`font-extrabold ${selectedStudentId === s.id ? "text-amber-400" : "text-white"}`}>{s.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{s.id}</p>
                  </div>
                  <div className="col-span-3">
                    <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                      {s.track.replace(" Track", "")}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-bold ${parseInt(s.attendance) > 80 ? "text-emerald-400" : "text-rose-400"}`}>
                      {s.attendance}
                    </span>
                  </div>
                  <div className="col-span-3 text-right flex flex-col items-end">
                    <span className={`font-black text-sm ${s.status === "Pass" ? "text-emerald-400" : "text-rose-400"}`}>
                      {s.score} <span className="text-[10px] text-neutral-500 font-normal">/ 40</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 mt-0.5 font-bold">
                      ({s.status})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: STUDENT DIAGNOSTIC PANEL (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0e131f] border border-neutral-800 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <p className="text-[9px] font-mono uppercase text-amber-400 font-bold tracking-wider mb-1">
                  AI Speaking Diagnostic Report
                </p>
                <h3 className="text-xl font-black text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-neutral-400 font-mono">{selectedStudent.id}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-lg text-center">
                <p className="text-sm font-black text-amber-400">{selectedStudent.score} <span className="text-xs text-neutral-500 font-normal">/ 40</span></p>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-[11px] text-neutral-400">Pronunciation</span>
                <span className="text-xs font-bold text-white">{selectedStudent.scores.pronunciation} <span className="text-neutral-500 text-[10px]">/ 10</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-[11px] text-neutral-400">Grammar</span>
                <span className="text-xs font-bold text-white">{selectedStudent.scores.grammar} <span className="text-neutral-500 text-[10px]">/ 10</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-[11px] text-neutral-400">Vocabulary</span>
                <span className="text-xs font-bold text-white">{selectedStudent.scores.vocabulary} <span className="text-neutral-500 text-[10px]">/ 10</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-[11px] text-neutral-400">Task Fluency</span>
                <span className="text-xs font-bold text-white">{selectedStudent.scores.fluency} <span className="text-neutral-500 text-[10px]">/ 10</span></span>
              </div>
            </div>

            {/* Action Item */}
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 mb-6 relative z-10">
              <p className="text-[9px] font-mono uppercase text-rose-400 font-bold tracking-wider mb-1">
                Primary Classroom Action Item
              </p>
              <p className="text-xs text-rose-200 font-medium">
                {selectedStudent.weakness}
              </p>
            </div>

            {/* Transcript */}
            <div className="flex-1 flex flex-col min-h-[200px] relative z-10">
              <p className="text-[9px] font-mono uppercase text-neutral-500 font-bold tracking-wider mb-2">
                Recorded AI Mock Exam Transcript
              </p>
              <div className="flex-1 bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 overflow-y-auto">
                <p className="text-[10px] font-bold text-amber-400 mb-1">EXAMINER (Rachel)</p>
                <p className="text-[11px] text-neutral-300 leading-relaxed italic">
                  {selectedStudent.transcript}
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}