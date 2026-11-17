// frontend/src/app/login/examiner/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExaminerLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, route directly to the admin console
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0b0e17] border border-neutral-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <Link href="/role" className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-wider mb-6 inline-block">
          &larr; Change Role
        </Link>
        
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Examiner Workspace</h1>
          <p className="text-xs text-neutral-400">Secure faculty access for Los Andes Institute.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Faculty ID</label>
            <input 
              type="text" 
              defaultValue="Dr. S. Müller"
              className="w-full bg-[#121622] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Secure Password</label>
            <input 
              type="password" 
              defaultValue="••••••••"
              className="w-full bg-[#121622] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all mt-4"
          >
            Access Console &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}