// frontend/src/app/role/page.tsx
"use client";

import Link from "next/link";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 selection:bg-amber-500/30">
      <div className="w-full max-w-4xl">
        <Link href="/" className="text-xs font-bold text-neutral-500 hover:text-white mb-8 inline-block transition-colors">
          &larr; Back to Home
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Select Your Portal</h1>
          <p className="text-sm text-neutral-400">Choose your role to securely access the Los Andes ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* STUDENT ROLE CARD */}
          <Link href="/login/student" className="group relative bg-[#0b0e17] border border-neutral-800/80 hover:border-amber-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full group-hover:bg-amber-500/20 transition-all" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-amber-500/20">
              👨‍🎓
            </div>
            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">Student Hub</h2>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Access your B1/B2 training roadmap, daily mini-games, and the 8-Stage AI Speaking Simulator.
            </p>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
              Student Login &rarr;
            </span>
          </Link>

          {/* EXAMINER ROLE CARD */}
          <Link href="/login/examiner" className="group relative bg-[#0b0e17] border border-neutral-800/80 hover:border-emerald-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-500/20">
              👩‍🏫
            </div>
            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Examiner Console</h2>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Manage batch tokens, review automated AI mock exam transcripts, and track class readiness.
            </p>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              Faculty Login &rarr;
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}