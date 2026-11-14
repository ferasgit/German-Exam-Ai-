"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StudentRecord {
  id: string;
  name: string;
  regNo: string;
  batch: "B1 Nursing Track" | "B1 Hospitality Track" | "B2 IT & Engineering";
  attendance: number;
  tokensUsed: number;
  tokensTotal: number;
  lastScore: number;
  cefrBreakdown: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    taskCompletion: number;
  };
  weakness: string;
  recentTranscript: { speaker: string; text: string; note?: string }[];
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "1",
    name: "Muhammed Favaz",
    regNo: "LA-B1-084",
    batch: "B1 Nursing Track",
    attendance: 92,
    tokensUsed: 2,
    tokensTotal: 10,
    lastScore: 33,
    cefrBreakdown: { pronunciation: 8.0, grammar: 7.5, vocabulary: 8.5, taskCompletion: 9.0 },
    weakness: "Nebensatz word order (weil / dass verb placement)",
    recentTranscript: [
      { speaker: "EXAMINER (Rachel)", text: "Bitte beschreiben Sie Ihre Heimatstadt." },
      {
        speaker: "STUDENT",
        text: "Ich komme aus Kozhikode. Es ist sehr schön, weil es hat viele Strände.",
        note: "AI Grammar Alert: 'weil es viele Strände hat' (verb at end).",
      },
      { speaker: "PARTNER (Josh)", text: "Gibt es dort auch gute Krankenhäuser für eine Ausbildung?" },
      { speaker: "STUDENT", text: "Ja, wir haben ein großes Medical College in meiner Stadt." },
    ],
  },
  {
    id: "2",
    name: "Anjali Menon",
    regNo: "LA-B1-012",
    batch: "B1 Nursing Track",
    attendance: 96,
    tokensUsed: 4,
    tokensTotal: 10,
    lastScore: 36,
    cefrBreakdown: { pronunciation: 8.5, grammar: 9.0, vocabulary: 9.5, taskCompletion: 9.0 },
    weakness: "Pronunciation of umlauts (ä, ö, ü) under speed",
    recentTranscript: [
      { speaker: "PARTNER (Josh)", text: "Sollten soziale Medien für Jugendliche begrenzt werden?" },
      { speaker: "STUDENT", text: "Meiner Meinung nach sollten Eltern die Zeit kontrollieren." },
    ],
  },
  {
    id: "3",
    name: "Rahul Krishnan",
    regNo: "LA-B1-049",
    batch: "B1 Hospitality Track",
    attendance: 74,
    tokensUsed: 1,
    tokensTotal: 10,
    lastScore: 21,
    cefrBreakdown: { pronunciation: 5.5, grammar: 5.0, vocabulary: 5.0, taskCompletion: 5.5 },
    weakness: "Long hesitation in Part 2 Partner Q&A",
    recentTranscript: [
      { speaker: "EXAMINER (Rachel)", text: "Haben Sie eine Frage an Ihren Partner?" },
      {
        speaker: "STUDENT",
        text: "Ähm... ja... wie findest du... Online Schule?",
        note: "AI Fluency Alert: 4.2s pause detected; missing formal 'Sie' address.",
      },
    ],
  },
  {
    id: "4",
    name: "Sneha Varghese",
    regNo: "LA-B2-019",
    batch: "B2 IT & Engineering",
    attendance: 89,
    tokensUsed: 5,
    tokensTotal: 10,
    lastScore: 31,
    cefrBreakdown: { pronunciation: 7.5, grammar: 8.0, vocabulary: 8.0, taskCompletion: 7.5 },
    weakness: "Passive voice constructions in technical debate",
    recentTranscript: [
      { speaker: "EXAMINER (Rachel)", text: "Welche Rolle spielt KI in der modernen Schule?" },
      { speaker: "STUDENT", text: "Viele Aufgaben können heute schneller gelöst werden." },
    ],
  },
];

export default function ExaminerAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [examinerEmail, setExaminerEmail] = useState("examiner@losandes.edu.in");
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(INITIAL_STUDENTS[0]);

  const filteredStudents =
    selectedBatch === "ALL"
      ? students
      : students.filter((s) => s.batch === selectedBatch);

      
// NEW: Fetch live exam results from LocalStorage
  useEffect(() => {
    const savedResult = localStorage.getItem("demoExamResult");
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult);
      
      setStudents((prev) => 
        prev.map((student) => {
          if (student.regNo === "LA-B1-084") { // Update YOUR specific student row
            const updatedStudent = {
              ...student,
              tokensUsed: student.tokensUsed + 1,
              lastScore: parsedResult.lastScore,
              cefrBreakdown: parsedResult.cefrBreakdown,
              weakness: parsedResult.weakness,
              recentTranscript: parsedResult.recentTranscript,
            };
            
            // If this student is currently selected in the right panel, update that too
            if (selectedStudent?.regNo === "LA-B1-084") {
              setSelectedStudent(updatedStudent);
            }
            return updatedStudent;
          }
          return student;
        })
      );
    }
  }, []); // Run once when admin page loads


  const handleRefillAllTokens = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, tokensUsed: 0, tokensTotal: 10 }))
    );
    if (selectedStudent) {
      setSelectedStudent({ ...selectedStudent, tokensUsed: 0, tokensTotal: 10 });
    }
  };

  // 1. EXAMINER SECURITY LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-neutral-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl max-w-md w-full p-7 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-black flex items-center justify-center text-xs">
                DE
              </div>
              <span className="font-extrabold text-sm text-white">Examiner Admin Gate</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-rose-950/60 border border-rose-800/50 text-rose-300 px-2.5 py-0.5 rounded-full">
              Staff Only
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
            Restricted to authorized Los Andes Institute examiners and faculty. Student accounts cannot access batch tracking or token allocation.
          </p>

          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] text-neutral-400 uppercase font-bold">
                Examiner Official Email
              </label>
              <input
                value={examinerEmail}
                onChange={(e) => setExaminerEmail(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 uppercase font-bold">
                Faculty Passkey
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <button
              onClick={() => setIsAuthenticated(true)}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 mt-2"
            >
              Unlock Examiner Console &rarr;
            </button>

            <div className="pt-3 border-t border-neutral-800 text-center">
              <Link href="/" className="text-xs text-neutral-400 hover:text-white">
                &larr; Return to Student Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. FULL EXAMINER DASHBOARD
  return (
    <div className="min-h-screen bg-[#070a0f] text-neutral-100 flex flex-col font-sans">
      {/* ADMIN TOP HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0b101b]/90 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-black text-xs shadow-lg shadow-emerald-500/20">
              ADM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white">
                  Los Andes Examiner &amp; Batch Console
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Faculty Verified
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                CEFR Analytics &bull; AI Transcript Auditing &bull; Monthly Token Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefillAllTokens}
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-amber-400/10 transition-all"
            >
              🎟️ Reset Monthly Batch Tokens (10/Student)
            </button>
            <Link
              href="/"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-700"
            >
              &larr; Student App View
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* TOP KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e131f] border border-neutral-800 p-4 rounded-2xl">
            <p className="text-[11px] text-neutral-400 uppercase font-mono">Active Batch Students</p>
            <p className="text-2xl font-extrabold text-white mt-1">124</p>
            <p className="text-[11px] text-emerald-400 mt-1">3 Active Ausbildung Tracks</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 p-4 rounded-2xl">
            <p className="text-[11px] text-neutral-400 uppercase font-mono">B1 Passing Readiness</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">84%</p>
            <p className="text-[11px] text-neutral-400 mt-1">Avg Score: 31.4 / 40</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 p-4 rounded-2xl">
            <p className="text-[11px] text-neutral-400 uppercase font-mono">Monthly Exam Tokens</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">412 / 1,200</p>
            <p className="text-[11px] text-neutral-400 mt-1">API Cost Protected (Cap: 10/mo)</p>
          </div>
          <div className="bg-[#0e131f] border border-neutral-800 p-4 rounded-2xl">
            <p className="text-[11px] text-neutral-400 uppercase font-mono">Top Batch Weakness</p>
            <p className="text-sm font-bold text-rose-400 mt-1.5">Nebensatz Word Order</p>
            <p className="text-[11px] text-neutral-400 mt-1">Detected in 38% of B1 speeches</p>
          </div>
        </div>

        {/* BATCH FILTER TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e131f] border border-neutral-800 p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {[
              "ALL",
              "B1 Nursing Track",
              "B1 Hospitality Track",
              "B2 IT & Engineering",
            ].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBatch(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBatch === b
                    ? "bg-amber-400 text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                {b === "ALL" ? "All Batches" : b}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Click any student row to inspect AI Transcript &amp; CEFR Breakdown
          </span>
        </div>

        {/* MAIN 2-COLUMN WORKSPACE: ROSTER TABLE + STUDENT AI INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: STUDENT ROSTER */}
          <div className="lg:col-span-7 bg-[#0e131f] border border-neutral-800 rounded-2xl p-5 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-mono">
                  <th className="py-3 px-3">Student / Reg No</th>
                  <th className="py-3 px-3">Track</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Tokens Used</th>
                  <th className="py-3 px-3">Last AI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  const passed = s.lastScore >= 24;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-l-2 border-l-amber-400"
                          : "hover:bg-neutral-900/60"
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{s.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">{s.regNo}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-neutral-300">
                          {s.batch}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={s.attendance >= 85 ? "text-emerald-400" : "text-rose-400"}>
                          {s.attendance}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-300">
                        {s.tokensUsed} / {s.tokensTotal}
                      </td>
                      <td className="py-3.5 px-3 font-bold">
                        <span className={passed ? "text-emerald-400" : "text-rose-400"}>
                          {s.lastScore} / 40 {passed ? "(Pass)" : "(Review)"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* RIGHT 5 COLS: SELECTED STUDENT AI AUDIT DRAWER */}
          <div className="lg:col-span-5 bg-[#0e131f] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            {selectedStudent ? (
              <>
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400">
                        AI Speaking Diagnostic Report
                      </span>
                      <h2 className="text-base font-extrabold text-white">
                        {selectedStudent.name} ({selectedStudent.regNo})
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-400">
                      {selectedStudent.lastScore} / 40
                    </span>
                  </div>

                  {/* CEFR 4-PILLAR RUBRIC */}
                  <div className="grid grid-cols-2 gap-2.5 my-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-400">Pronunciation</span>
                      <span className="font-mono font-bold text-white">
                        {selectedStudent.cefrBreakdown.pronunciation} / 10
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-400">Grammar</span>
                      <span className="font-mono font-bold text-white">
                        {selectedStudent.cefrBreakdown.grammar} / 10
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-400">Vocabulary</span>
                      <span className="font-mono font-bold text-white">
                        {selectedStudent.cefrBreakdown.vocabulary} / 10
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-400">Task Fluency</span>
                      <span className="font-mono font-bold text-white">
                        {selectedStudent.cefrBreakdown.taskCompletion} / 10
                      </span>
                    </div>
                  </div>

                  {/* DETECTED WEAKNESS */}
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-xs mb-4">
                    <p className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                      Primary Classroom Action Item
                    </p>
                    <p className="text-neutral-200 font-semibold mt-0.5">
                      {selectedStudent.weakness}
                    </p>
                  </div>

                  {/* AI EXAM TRANSCRIPT SNIPPET */}
                  <div>
                    <h3 className="text-xs font-bold uppercase text-neutral-400 mb-2">
                      Recorded AI Mock Exam Transcript
                    </h3>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                      {selectedStudent.recentTranscript.map((line, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800"
                        >
                          <p className="text-[10px] font-mono text-amber-400 font-bold">
                            {line.speaker}
                          </p>
                          <p className="text-neutral-200 mt-0.5">{line.text}</p>
                          {line.note && (
                            <p className="text-[11px] text-rose-400 font-semibold mt-1 bg-rose-950/40 px-2 py-1 rounded">
                              ⚠️ {line.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-neutral-500">Select a student to inspect details.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}