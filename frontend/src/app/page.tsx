"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ViewTab = "practice" | "institute" | "dictionary";

export default function PlatformHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>("practice");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [regNo, setRegNo] = useState("LA-B1-2026-084");
  const [tokens, setTokens] = useState(8);
  const [xp, setXp] = useState(1450);
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizWords = [
    { noun: "Ausbildung", article: "die", translation: "Vocational Training" },
    { noun: "Krankenhaus", article: "das", translation: "Hospital (Nursing Track)" },
    { noun: "Beruf", article: "der", translation: "Profession / Career" },
  ];

  const handleArticleGuess = (guess: string) => {
    const current = quizWords[quizIndex];
    if (guess === current.article) {
      setQuizFeedback("✅ Richtig! +15 XP");
      setXp((prev) => prev + 15);
      setTimeout(() => {
        setQuizFeedback(null);
        setQuizIndex((prev) => (prev + 1) % quizWords.length);
      }, 900);
    } else {
      setQuizFeedback(`❌ Falsch! Es ist "${current.article} ${current.noun}"`);
    }
  };

  const handleStartExam = () => {
    setTokens((t) => Math.max(0, t - 1));
    router.push("/exam");
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0b101b]/90 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20">
              DE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  DeutschAI Arena
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Los Andes Partner Edition
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Goethe &bull; telc &bull; Ausbildung Preparation Ecosystem
              </p>
            </div>
          </div>

          {/* STUDENT-ONLY NAVIGATION TABS */}
          <nav className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            {[
              { id: "practice", label: "🎯 Practice Hub" },
              { id: "institute", label: "🏛️ My Institute" },
              { id: "dictionary", label: "📖 Smart Vault" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as ViewTab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* GAMIFIED STATS & LOGIN BADGE */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-400">
              <span>🔥</span>
              <span>14d</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-400">
              <span>💎</span>
              <span>{xp} XP</span>
            </div>
            <div
              onClick={() => setShowTokenConfirm(true)}
              className="cursor-pointer flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all"
              title="Monthly AI Speaking Exam Credits"
            >
              <span>🎟️</span>
              <span>{tokens}/10 Exams</span>
            </div>
            <button
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-xl text-xs font-mono border border-neutral-700"
            >
              {isLoggedIn ? regNo : "Student Login"}
            </button>
            <Link
              href="/admin"
              className="text-[11px] font-mono text-neutral-400 hover:text-amber-400 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-neutral-800 transition-all"
              title="Staff & Examiner Console"
            >
              Staff Portal &nearr;
            </Link>
          </div>
        </div>
      </header>

      {/* STUDENT LOGIN MODAL */}
      {!isLoggedIn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-neutral-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Institute Student Login</h2>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Los Andes Portal
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Enter your Institute Registration Number to unlock your monthly AI Speaking Tokens and batch attendance.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 uppercase font-bold">
                  Institute Reg No.
                </label>
                <input
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 uppercase font-bold">
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <button
                onClick={() => setIsLoggedIn(true)}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold py-2.5 rounded-xl text-xs mt-2"
              >
                Login to Student Arena &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* TAB 1: PRACTICE HUB */}
        {activeTab === "practice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#131b2e] via-[#19233c] to-[#1e1b38] border border-amber-500/40 p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                      Goethe / telc B1 Speaking Simulator
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-2">
                      8-Stage Live AI Speaking Room
                    </h2>
                    <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                      Practice with Examiner Rachel &amp; Partner Josh. Includes real-time voice detection, preparation timer, presentation Q&amp;A, and debate.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTokenConfirm(true)}
                    className="shrink-0 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black px-5 py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    🎙️ Launch Exam (1 🎟️)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                        Daily Mini-Game &bull; Unlimited (Free)
                      </span>
                      <span className="text-[11px] text-neutral-400">+15 XP</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Artikel-Sprint: Der, Die oder Das?
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4">
                      Build daily muscle memory for Ausbildung vocabulary without using exam tokens.
                    </p>

                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-center my-2">
                      <p className="text-lg font-extrabold text-white">
                        ___ {quizWords[quizIndex].noun}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        ({quizWords[quizIndex].translation})
                      </p>
                    </div>

                    {quizFeedback && (
                      <p className="text-xs text-center font-bold text-amber-400 my-2">
                        {quizFeedback}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    {["der", "die", "das"].map((art) => (
                      <button
                        key={art}
                        onClick={() => handleArticleGuess(art)}
                        className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-white font-bold py-2.5 rounded-xl text-xs uppercase transition-all border border-neutral-700"
                      >
                        {art}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                        Personal Mistake Bank
                      </span>
                      <span className="text-[10px] bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded">
                        3 Weaknesses Found
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">
                      Fix Your Past Speaking Errors
                    </h3>
                    <div className="space-y-2.5 mt-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
                        <p className="text-rose-400 line-through">
                          &ldquo;Ich bin nach Deutschland gehen.&rdquo;
                        </p>
                        <p className="text-emerald-400 font-semibold mt-0.5">
                          ✓ &ldquo;Ich möchte nach Deutschland gehen.&rdquo;
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
                        <p className="text-rose-400 line-through">
                          &ldquo;Weil es ist sehr wichtig.&rdquo;
                        </p>
                        <p className="text-emerald-400 font-semibold mt-0.5">
                          ✓ &ldquo;...weil es sehr wichtig ist.&rdquo; (Nebensatz)
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-xs border border-neutral-700">
                    Practice 10 Grammar Drills &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  🏆 Los Andes B1 Batch Leaderboard
                </h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { rank: 1, name: "Anjali Menon", xp: "1,820 XP", badge: "🥇" },
                    { rank: 2, name: "You (LA-B1-084)", xp: `${xp} XP`, badge: "🥈", highlight: true },
                    { rank: 3, name: "Rahul Krishnan", xp: "1,390 XP", badge: "🥉" },
                    { rank: 4, name: "Sneha Varghese", xp: "1,120 XP", badge: "4" },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        s.highlight
                          ? "bg-amber-500/10 border-amber-500/40 text-white font-bold"
                          : "bg-neutral-900/60 border-neutral-800 text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span>{s.badge}</span>
                        <span>{s.name}</span>
                      </div>
                      <span className="font-mono text-amber-400">{s.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY INSTITUTE */}
        {activeTab === "institute" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#0e131f] border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400">
                    Verified Partner Academy
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    Los Andes Institute of Management &amp; Technology
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Holy Family Monastery, Kacheripady, Ernakulam North, Kerala
                  </p>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs px-3 py-1 rounded-full font-bold">
                  Active Student
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl">
                  <p className="text-[11px] text-neutral-400">Enrolled Batch</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">B1 Nursing Track</p>
                </div>
                <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl">
                  <p className="text-[11px] text-neutral-400">Attendance</p>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">92% (22/24 Days)</p>
                </div>
                <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl">
                  <p className="text-[11px] text-neutral-400">Next Offline Class</p>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">Mon, 9:30 AM</p>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase text-neutral-400 mb-2.5">
                  Upcoming Institute Events &amp; Mock Exams
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Ausbildung Nursing Interview Workshop</p>
                      <p className="text-neutral-400 text-[11px]">Room 204 &bull; Fr. Thomas &amp; Examiner Team</p>
                    </div>
                    <span className="font-mono text-amber-400">Tomorrow, 2:00 PM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Mandatory B1 Speaking Assessment</p>
                      <p className="text-neutral-400 text-[11px]">Complete 1 AI Mock Exam before Friday</p>
                    </div>
                    <button
                      onClick={() => setShowTokenConfirm(true)}
                      className="bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg"
                    >
                      Start Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0e131f] border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase text-amber-400 mb-3">
                🇩🇪 Germany Ausbildung Pathway Tracker
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Your step-by-step qualification progress from Kerala to Germany.
              </p>
              <div className="space-y-3 text-xs">
                {[
                  { step: "A1 & A2 Foundation", status: "Completed ✅", done: true },
                  { step: "B1 Language & AI Speaking (Current)", status: "In Progress (78%)", done: true },
                  { step: "B2 Professional Terminology", status: "Locked", done: false },
                  { step: "German Employer Interview Prep", status: "Locked", done: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex justify-between ${
                      item.done
                        ? "bg-emerald-950/20 border-emerald-800/50 text-white"
                        : "bg-neutral-900/40 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    <span className="font-semibold">{item.step}</span>
                    <span className="font-mono">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SMART DICTIONARY VAULT */}
        {activeTab === "dictionary" && (
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-1">
              📖 B1/B2 Ausbildung Smart Vocabulary Vault
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Words you struggled with during your AI Speaking Exams are automatically saved here with gender articles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                { word: "die Krankenpflege", en: "Nursing / Healthcare", example: "Ich mache eine Ausbildung in der Krankenpflege." },
                { word: "die Sehenswürdigkeit", en: "Sight / Tourist Attraction", example: "Meine Heimatstadt hat viele Sehenswürdigkeiten." },
                { word: "der Kompromiss", en: "Compromise (Part 3 Debate)", example: "Lass uns einen gemeinsamen Kompromiss finden." },
              ].map((w, i) => (
                <div key={i} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <p className="text-sm font-extrabold text-amber-400">{w.word}</p>
                  <p className="text-neutral-300 font-semibold mt-0.5">{w.en}</p>
                  <p className="text-neutral-400 italic mt-2">&ldquo;{w.example}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* TOKEN CONFIRMATION MODAL */}
      {showTokenConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-neutral-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              🎟️ Use 1 Exam Token to Enter Exam Room?
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              This will start a full 8-stage live voice simulation with AI Examiner Rachel and Candidate B (Josh). You have{" "}
              <span className="text-amber-400 font-bold">{tokens} tokens</span> remaining this month.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowTokenConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExam}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-400 text-black hover:bg-emerald-300"
              >
                Confirm &amp; Enter Exam &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}