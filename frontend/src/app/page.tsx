"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TOP_INSTITUTES = [
  {
    rank: 1,
    name: "Los Andes Institute of Management & Technology",
    location: "Ernakulam, Kerala",
    tracks: "B1/B2 Nursing & IT Tracks",
    qualified: 312,
    passRate: "94%",
    badge: "🥇",
  },
  {
    rank: 2,
    name: "Rheinland Vocational Academy",
    location: "Kochi, Kerala",
    tracks: "B1 Healthcare & Hospitality",
    qualified: 245,
    passRate: "91%",
    badge: "🥈",
  },
  {
    rank: 3,
    name: "Bavaria Tech & Language Hub",
    location: "Kozhikode, Kerala",
    tracks: "B2 Engineering & Caregiving",
    qualified: 198,
    passRate: "89%",
    badge: "🥉",
  },
  {
    rank: 4,
    name: "Berlin Bridge Career Institute",
    location: "Bengaluru, Karnataka",
    tracks: "B1 General & Ausbildung",
    qualified: 164,
    passRate: "87%",
    badge: "4",
  },
];

export default function GlobalLandingPage() {
  const router = useRouter();
  const [instituteCode, setInstituteCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState(false);

  const handleLinkInstitute = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    const cleaned = instituteCode.trim().toUpperCase();

    if (!cleaned) {
      setCodeError("Please enter your 6-digit academy code.");
      return;
    }

    // Valid demo codes for partner academies
    if (cleaned === "LA2026" || cleaned === "ANDES5") {
      setCodeSuccess(true);
      localStorage.setItem("linked_institute_code", "LA2026");
      setTimeout(() => {
        router.push("/students");
      }, 800);
    } else {
      setCodeError("Invalid code. Try demo code: LA2026");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 font-sans selection:bg-amber-400 selection:text-black flex flex-col scroll-smooth">
      {/* GLOBAL HEADER */}
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 w-full z-50 border-b border-neutral-800/80 bg-[#0a0d14]/85 backdrop-blur-lg px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs shadow-lg shadow-amber-500/20">
              DE
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              DeutschAI Arena
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <Link href="/learn" className="hover:text-white transition-colors">
              For Learners
            </Link>
            <a href="#leaderboard" className="hover:text-white transition-colors">
              Top Institutes
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing &amp; Tokens
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="text-xs font-bold text-neutral-300 hover:text-white transition-colors"
            >
              Global User Login
            </Link>
            <Link
              href="/role"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Institute Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master German B1 &amp; B2 <br /> Speaking Exams with AI.
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The complete German preparation platform for independent learners and partner academies. Follow structured study roadmaps, practice live AI conversations, and track your CEFR speaking readiness.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/learn"
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all"
            >
              Start Free Practice &rarr;
            </Link>
            <a
              href="#pricing"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all"
            >
              🎟️ Get Exam Tokens
            </a>
          </div>
        </div>

        {/* DUAL AUDIENCE SPLIT CARDS */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* CARD 1: INDEPENDENT LEARNERS */}
          <div className="bg-gradient-to-br from-[#121622] to-[#0a0d14] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-all pointer-events-none" />
            
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                Global Self-Study
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3 mb-2">
                For Independent Learners
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                New to German or studying on your own? Follow our step-by-step A1 to B2 interactive roadmap for free, and purchase AI Exam Tokens whenever you are ready to test.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm font-semibold text-neutral-300 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-base">🗺️</span> Step-by-Step A1 to B2 Beginner Roadmap
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-base">🔤</span> Pronunciation, Umlauts &amp; Core Grammar Guides
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-base">🎙️</span> Pay-as-you-go 8-Stage AI Speaking Tokens
                </li>
              </ul>
            </div>

            <Link
              href="/learn"
              className="w-full text-center bg-neutral-800 hover:bg-amber-400 hover:text-black text-white font-extrabold py-3 rounded-xl text-xs transition-all border border-neutral-700"
            >
              Open Free Learning Roadmap &rarr;
            </Link>
          </div>

          {/* CARD 2: INSTITUTE STUDENTS */}
          <div className="bg-gradient-to-br from-[#0d1620] to-[#0a0d14] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-bold">
                Academy Workspace
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3 mb-2">
                For Institute Students
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                Enrolled at a registered partner academy? Enter your 6-digit institute invite code below to unlock your sponsored monthly exam tokens and batch dashboard.
              </p>

              {/* WORKING CODE INPUT BAR */}
              <form onSubmit={handleLinkInstitute} className="mb-6">
                <div className="bg-neutral-950/90 border border-neutral-700 focus-within:border-emerald-400 rounded-xl p-1.5 flex items-center transition-all">
                  <span className="px-3 text-neutral-500 text-xs font-mono font-bold select-none">
                    CODE:
                  </span>
                  <input
                    type="text"
                    value={instituteCode}
                    onChange={(e) => setInstituteCode(e.target.value)}
                    placeholder="Enter code (e.g. LA2026)"
                    className="bg-transparent w-full text-white font-mono text-xs sm:text-sm uppercase outline-none placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold px-5 py-2 rounded-lg transition-all shrink-0"
                  >
                    Link &rarr;
                  </button>
                </div>

                {codeError && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-2 px-1">
                    ⚠️ {codeError}
                  </p>
                )}
                {codeSuccess && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2 px-1 animate-pulse">
                    ✓ Code verified! Redirecting to your Institute Hub...
                  </p>
                )}
              </form>
            </div>

            {/* PLATFORM NETWORK METRICS */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80 text-xs font-semibold text-neutral-300">
              <div>
                <span className="block text-emerald-400 text-xl font-black">15+</span>
                <span className="text-neutral-400 text-[11px]">Registered Partner Institutes</span>
              </div>
              <div>
                <span className="block text-amber-400 text-xl font-black">2,400+</span>
                <span className="text-neutral-400 text-[11px]">Active Enrolled Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP REGISTERED INSTITUTES LEADERBOARD */}
        <section id="leaderboard" className="max-w-5xl mx-auto w-full mt-24 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Verified Academy Rankings
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                🏆 Top Registered Institutes
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Ranked by total B1/B2 students qualified through AI speaking simulations
            </p>
          </div>

          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 px-6 py-3.5 bg-neutral-900/70 border-b border-neutral-800 text-[10px] font-mono uppercase text-neutral-400 font-bold">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6 sm:col-span-5">Institute Name</div>
              <div className="col-span-3 hidden sm:block">Specialization</div>
              <div className="col-span-5 sm:col-span-3 text-right">Students Qualified</div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {TOP_INSTITUTES.map((inst) => (
                <div
                  key={inst.rank}
                  className={`grid grid-cols-12 items-center px-6 py-4 text-xs transition-colors ${
                    inst.rank === 1
                      ? "bg-amber-500/5 hover:bg-amber-500/10"
                      : "hover:bg-neutral-900/40"
                  }`}
                >
                  <div className="col-span-1 font-bold text-base">{inst.badge}</div>
                  <div className="col-span-6 sm:col-span-5 pr-2">
                    <p className="font-bold text-white text-xs sm:text-sm">{inst.name}</p>
                    <p className="text-[11px] text-neutral-400">{inst.location}</p>
                  </div>
                  <div className="col-span-3 hidden sm:block">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-mono">
                      {inst.tracks}
                    </span>
                  </div>
                  <div className="col-span-5 sm:col-span-3 text-right">
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {inst.qualified} Qualified
                    </span>
                    <span className="block text-[10px] text-neutral-400">
                      {inst.passRate} Readiness Rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING & EXAM TOKENS SECTION */}
        <section id="pricing" className="max-w-5xl mx-auto w-full mt-24 pt-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Flexible Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Simple Pricing for Everyone
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Start learning German fundamentals for free, or unlock live 8-stage AI voice evaluations with Exam Tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TIER 1: FREE */}
            <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Free Global Learner</h3>
                <p className="text-2xl font-black text-white mt-2">
                  ₹0 <span className="text-xs font-normal text-neutral-400">/ forever</span>
                </p>
                <p className="text-xs text-neutral-400 mt-2 mb-6">
                  Essential self-study roadmap for beginners building A1–B1 foundations.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-300 mb-6">
                  <li>✓ Interactive 5-Stage German Roadmap</li>
                  <li>✓ Core 500 Vocabulary &amp; Grammar Rules</li>
                  <li>✓ Umlaut &amp; Pronunciation Checklists</li>
                  <li className="text-neutral-600">✕ Live 8-Stage AI Voice Exam Room</li>
                </ul>
              </div>
              <Link
                href="/learn"
                className="w-full text-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Start Learning Free
              </Link>
            </div>

            {/* TIER 2: INDEPENDENT PRO TOKENS */}
            <div className="bg-gradient-to-b from-[#161f33] to-[#0e131f] border-2 border-amber-400/80 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
              <span className="absolute -top-3 right-5 bg-amber-400 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-400">Independent Exam Pack</h3>
                <p className="text-2xl font-black text-white mt-2">
                  ₹499 <span className="text-xs font-normal text-neutral-400">/ 10 Exam Tokens</span>
                </p>
                <p className="text-xs text-neutral-300 mt-2 mb-6">
                  For self-taught students ready to test their speaking skills with AI Examiner Rachel.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-200 mb-6">
                  <li>✓ Everything in Free Learner</li>
                  <li>✓ <strong>10 Full 8-Stage AI Speaking Exams</strong></li>
                  <li>✓ 4-Pillar CEFR Score Breakdown</li>
                  <li>✓ Recorded Transcript &amp; Grammar Alerts</li>
                </ul>
              </div>
              <Link
                href="/learn?upgrade=true"
                className="w-full text-center bg-amber-400 hover:bg-amber-300 text-black font-extrabold py-2.5 rounded-xl text-xs transition-all"
              >
                Buy 10 Exam Tokens &rarr;
              </Link>
            </div>

            {/* TIER 3: PARTNER INSTITUTE */}
            <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-400">Partner Academy</h3>
                <p className="text-2xl font-black text-white mt-2">
                  Custom <span className="text-xs font-normal text-neutral-400">/ per batch</span>
                </p>
                <p className="text-xs text-neutral-400 mt-2 mb-6">
                  Complete B1/B2 grading automation and batch tracking for language institutes.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-300 mb-6">
                  <li>✓ Custom 6-Digit Student Invite Code</li>
                  <li>✓ Dedicated Examiner Admin Console</li>
                  <li>✓ Bulk Monthly Token Allocation</li>
                  <li>✓ Batch Weakness &amp; Attendance Analytics</li>
                </ul>
              </div>
              <Link
                href="/admin"
                className="w-full text-center bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 text-emerald-300 font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                View Examiner Console &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}