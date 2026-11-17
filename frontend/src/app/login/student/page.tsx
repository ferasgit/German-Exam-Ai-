// frontend/src/app/login/student/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, route directly to the student hub
    router.push("/students");
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0b0e17] border border-neutral-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        
        <Link href="/role" className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-wider mb-6 inline-block">
          &larr; Change Role
        </Link>
        
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Student Portal</h1>
          <p className="text-xs text-neutral-400">Enter your credentials to access the simulator.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Institute Code</label>
            <input 
              type="text" 
              defaultValue="LA2026"
              className="w-full bg-[#121622] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Registration Number</label>
            <input 
              type="text" 
              defaultValue="LA-B1-084"
              className="w-full bg-[#121622] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all mt-4"
          >
            Enter Practice Hub &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}