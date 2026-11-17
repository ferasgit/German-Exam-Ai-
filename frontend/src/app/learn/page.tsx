"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RoadmapStep {
  id: number;
  level: string;
  title: string;
  subtitle: string;
  summary: string;
  keyPoints: { label: string; detail: string }[];
  practiceExamples: { de: string; en: string }[];
}

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 1,
    level: "STEP 1 • A1 FOUNDATION",
    title: "Master the A1 Foundation First",
    subtitle: "Greetings, Self-Introductions, Numbers 1–20 & Core 500 Words",
    summary:
      "Start with high-frequency daily expressions. Building automatic recall for basic introductions gives you immediate confidence in Part 1 of any speaking assessment.",
    keyPoints: [
      { label: "Basic Greetings", detail: "Hallo, Guten Morgen, Guten Tag, Guten Abend, Tschüss, Auf Wiedersehen." },
      { label: "Self-Introduction", detail: "Ich heiße..., Ich komme aus Indien, Ich wohne in..., Mein Beruf ist..." },
      { label: "Numbers 1 to 20", detail: "eins, zwei, drei, vier, fünf... essential for dates, times, and ages." },
      { label: "500 Essential Words", detail: "Focus on family, food, work, daily routines, and common verbs (sein, haben, gehen)." },
    ],
    practiceExamples: [
      { de: "Guten Tag! Ich heiße Rahul und komme aus Kerala.", en: "Good day! My name is Rahul and I come from Kerala." },
      { de: "Ich bin einundzwanzig Jahre alt.", en: "I am twenty-one years old." },
    ],
  },
  {
    id: 2,
    level: "STEP 2 • PRONUNCIATION & ORTHOGRAPHY",
    title: "Understand German Pronunciation & Rules",
    subtitle: "Umlauts (ä, ö, ü), Sharp S (ß) & Noun Capitalization",
    summary:
      "Clear pronunciation accounts for 25% of your speaking score. Mastering special characters early prevents fossilized speaking errors.",
    keyPoints: [
      { label: "The Umlauts (ä, ö, ü)", detail: "ä sounds like 'eh' (Mädchen), ö rounds the lips (schön), ü whistles like 'ew' (für)." },
      { label: "The Eszett / Sharp S (ß)", detail: "Pronounced as a crisp double 'ss' after long vowels (Straße, heißen, groß)." },
      { label: "Capitalize Every Noun", detail: "In German, all nouns are capitalized without exception (das Haus, die Arbeit, der Erfolg)." },
    ],
    practiceExamples: [
      { de: "Ich möchte für meine Prüfung jeden Tag üben.", en: "I would like to practice every day for my exam." },
      { de: "Wie heißt Ihre Straße?", en: "What is the name of your street?" },
    ],
  },
  {
    id: 3,
    level: "STEP 3 • CORE GRAMMAR ARCHITECTURE",
    title: "Build Core Grammar Gradually",
    subtitle: "Three Genders (der, die, das), Word Order & The 4 Cases",
    summary:
      "Never memorize a German noun without its gender article. As you advance toward B1, examiners look specifically for accurate verb placement in subordinate clauses.",
    keyPoints: [
      { label: "Three Noun Genders", detail: "Masculine (der Beruf), Feminine (die Ausbildung), Neuter (das Krankenhaus)." },
      { label: "SVO & Verb-Second Rule", detail: "Main clauses keep the conjugated verb in position 2. Subordinate clauses (weil, dass) kick the verb to the very end." },
      { label: "The Four Cases", detail: "Nominativ (Subject), Akkusativ (Direct Object), Dativ (Indirect/Location), Genitiv (Possession)." },
    ],
    practiceExamples: [
      { de: "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.", en: "I learn German because I want to work in Germany. (Verb at end)" },
      { de: "Ich helfe dem Patienten im Krankenhaus.", en: "I help the patient in the hospital. (Dativ case)" },
    ],
  },
  {
    id: 4,
    level: "STEP 4 • STRUCTURED HABITS & TOOLS",
    title: "Combine Daily Drills with Audio Guides",
    subtitle: "Consistent 20-Minute Sprints & Active Listening",
    summary:
      "Supplement your roadmap with structured audio dialogues and spaced-repetition flashcards to bridge the gap between reading German and speaking it aloud.",
    keyPoints: [
      { label: "Shadowing Technique", detail: "Listen to native audio clips and repeat aloud with a 1-second delay to match rhythm and intonation." },
      { label: "Topic Templates", detail: "Prepare structured connectors for presentations: 'Meiner Meinung nach...', 'Ein großer Vorteil ist...'" },
      { label: "Daily Consistency", detail: "20 minutes of active speaking aloud beats 2 hours of passive reading." },
    ],
    practiceExamples: [
      { de: "Meiner Meinung nach hat Online-Lernen viele Vorteile.", en: "In my opinion, online learning has many advantages." },
      { de: "Zusammenfassend lässt sich sagen, dass...", en: "In summary, it can be said that..." },
    ],
  },
  {
    id: 5,
    level: "STEP 5 • NATIVE MEDIA & B1/B2 SIMULATIONS",
    title: "Incorporate Native Media & Live AI Debates",
    subtitle: "Podcasts, Subtitled Shows & Real-Time Speaking Exams",
    summary:
      "Once you reach A2/B1, train your ear with real-world speed. When you can follow slow German podcasts, you are ready to enter the 8-Stage AI Speaking Simulator.",
    keyPoints: [
      { label: "German Podcasts & Media", detail: "Listen to slow-spoken news and watch German series with German subtitles (never English)." },
      { label: "Spontaneous Q&A Reflexes", detail: "Practice answering unexpected follow-up questions without pausing to translate in your head." },
      { label: "8-Stage AI Exam Readiness", detail: "Test yourPresentation, Q&A, and Debate skills under real timer pressure." },
    ],
    practiceExamples: [
      { de: "Lass uns einen Kompromiss finden: Wie wäre es, wenn wir...?", en: "Let's find a compromise: How about if we...?" },
      { de: "Da stimme ich dir teilweise zu, aber...", en: "I partially agree with you there, but..." },
    ],
  },
];

export default function GlobalLearnPage() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [tokens, setTokens] = useState<number>(0); // Global free users start with 0 exam tokens
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  const toggleComplete = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTryExam = () => {
    if (tokens <= 0) {
      setShowPaywallModal(true);
    } else {
      router.push("/exam");
    }
  };

  const handleDemoPurchase = () => {
    setTokens(10);
    setShowPaywallModal(false);
  };

  const progressPercent = Math.round((completedSteps.length / ROADMAP_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#070a0f] text-neutral-100 font-sans selection:bg-amber-400 selection:text-black flex flex-col">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-[#0b101b]/90 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">
                DE
              </div>
              <div>
                <span className="font-extrabold text-sm text-white">DeutschAI Global</span>
                <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  Free Learner Plan
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300">
              Roadmap: <span className="text-amber-400 font-bold">{progressPercent}%</span>
            </div>

            <button
              onClick={() => setShowPaywallModal(true)}
              className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 transition-all"
            >
              <span>🎟️ {tokens} Exam Tokens</span>
              <span className="text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded ml-1">
                + BUY
              </span>
            </button>

            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white font-semibold px-2"
            >
              &larr; Home
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: STEP-BY-STEP ROADMAP (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gradient-to-r from-[#111827] to-[#0e131f] border border-neutral-800 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Self-Paced Curriculum
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              Step-by-Step German Mastery Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
              Follow these 5 structured pillars from complete beginner (A1) to intermediate speaking readiness (B1/B2). Check off each milestone as you master the concepts.
            </p>

            {/* PROGRESS BAR */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                <span>{completedSteps.length} of 5 Stages Completed</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ACCORDION ROADMAP CARDS */}
          <div className="space-y-4">
            {ROADMAP_STEPS.map((step) => {
              const isDone = completedSteps.includes(step.id);
              const isOpen = expandedStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-[#0e131f] border-amber-500/50 shadow-xl"
                      : "bg-[#0b0f19] border-neutral-800/80 hover:border-neutral-700"
                  }`}
                >
                  {/* CARD HEADER */}
                  <div
                    onClick={() => setExpandedStep(isOpen ? 0 : step.id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(step.id);
                        }}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border transition-all shrink-0 ${
                          isDone
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "bg-neutral-900 border-neutral-700 text-neutral-500 hover:border-amber-400"
                        }`}
                        title="Mark stage complete"
                      >
                        {isDone ? "✓" : step.id}
                      </button>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          {step.level}
                        </span>
                        <h2 className="text-base font-extrabold text-white mt-0.5">
                          {step.title}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">{step.subtitle}</p>
                      </div>
                    </div>

                    <span className="text-neutral-500 text-xs font-mono ml-4">
                      {isOpen ? "▲ Hide" : "▼ Expand"}
                    </span>
                  </div>

                  {/* EXPANDED STUDY DRAWER */}
                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-neutral-800/70 space-y-5">
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {step.summary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {step.keyPoints.map((kp, idx) => (
                          <div
                            key={idx}
                            className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5"
                          >
                            <p className="text-xs font-bold text-amber-400">{kp.label}</p>
                            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                              {kp.detail}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-4">
                        <p className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-2.5">
                          🗣️ Speak Aloud Practice Sentences
                        </p>
                        <div className="space-y-2.5">
                          {step.practiceExamples.map((ex, i) => (
                            <div key={i} className="text-xs border-l-2 border-amber-400 pl-3">
                              <p className="font-bold text-white">&ldquo;{ex.de}&rdquo;</p>
                              <p className="text-neutral-400 text-[11px]">{ex.en}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleComplete(step.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isDone
                              ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                              : "bg-emerald-500 text-black hover:bg-emerald-400"
                          }`}
                        >
                          {isDone ? "Completed ✓" : "Mark Stage as Complete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: AI EXAM SIMULATOR GATE & INSTITUTE UPSELL (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* LOCKED / PAYWALLED AI SPEAKING ROOM CARD */}
          <div className="bg-gradient-to-b from-[#151c2e] to-[#0e131f] border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                Pro Feature
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {tokens > 0 ? "🔓 Unlocked" : "🔒 Requires Token"}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white">
              8-Stage Live AI Speaking Exam
            </h3>
            <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
              Ready to test your B1/B2 speaking skills? Enter a realistic 25-minute voice room with AI Examiner Rachel and Partner Josh.
            </p>

            <ul className="space-y-2 text-xs text-neutral-300 my-5">
              <li>• Real-time German voice recognition</li>
              <li>• Part 1 Presentation, Part 2 Q&amp;A, Part 3 Debate</li>
              <li>• Instant 4-Pillar CEFR grading rubric</li>
            </ul>

            <button
              onClick={handleTryExam}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              {tokens > 0
                ? `🎙️ Launch AI Exam (1 of ${tokens} 🎟️)`
                : "🔒 Unlock AI Exam Room (Get Tokens)"}
            </button>
          </div>

          {/* HAVE AN INSTITUTE CODE BOX */}
          <div className="bg-[#0e131f] border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              🏛️ Studying at a Partner Institute?
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              If your academy is registered with DeutschAI Arena, you do not need to buy tokens. Return to the home page and link your 6-digit batch code.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl border border-neutral-700 transition-all"
            >
              Enter Institute Code &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* PAYWALL / TOKEN PURCHASE MODAL FOR GLOBAL USERS */}
      {showPaywallModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-neutral-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                Independent Learner Upgrade
              </span>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-extrabold text-white mt-2">
              Unlock the 8-Stage AI Speaking Room
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Live AI voice exams use real-time neural speech synthesis and LLM grading. Purchase an Exam Token Pack to start practicing live conversations.
            </p>

            <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-4 my-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-white">10 AI Exam Tokens</p>
                <p className="text-[11px] text-neutral-400">Full 8-stage simulations + CEFR transcripts</p>
              </div>
              <span className="text-lg font-black text-amber-400">₹499</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPaywallModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold"
              >
                Continue Free Roadmap
              </button>
              <button
                onClick={handleDemoPurchase}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/20"
              >
                Simulate Purchase (Add 10 🎟️)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}