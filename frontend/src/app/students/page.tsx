"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./students.css";

type ViewTab = "practice" | "institute" | "analytics";
type ReportTab = "writing" | "reading" | "speech" | "debate" | "b2-exam";

export default function StudentHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>("practice");
  const [activeReport, setActiveReport] = useState<ReportTab>("b2-exam");
  const [tokens, setTokens] = useState(8);
  const [xp] = useState(1450);
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);

  const handleStartExam = () => {
    setTokens((t) => Math.max(0, t - 1));
    router.push("/exam");
  };

  const openMistakes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab("analytics");
    setActiveReport("b2-exam");
  };

  const openTokenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTokenConfirm(true);
  };

  return (
    <div className="hub-shell">
      {/* HEADER */}
      <header className="hub-header">
        <div className="hub-header-inner">
          <div className="brand-group">
            <div className="brand-logo">DE</div>
            <div className="brand-meta">
              <span className="brand-title">
                LOS ANDES Institute of Management &amp; Technology
              </span>
              <div className="metrics-row">
                <div className="metric-pill streak">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span>14d</span>
                </div>
                <div className="metric-pill xp">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>{xp} XP</span>
                </div>
                <div onClick={() => setShowTokenConfirm(true)} className="metric-pill tokens">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>{tokens} Tokens</span>
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <nav className="nav-tabs">
              <button
                onClick={() => setActiveTab("practice")}
                className={`nav-tab ${activeTab === "practice" ? "active" : ""}`}
              >
                Practice Hub
              </button>
              <button
                onClick={() => setActiveTab("institute")}
                className={`nav-tab ${activeTab === "institute" ? "active" : ""}`}
              >
                My Institute
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`nav-tab ${activeTab === "analytics" ? "active-amber" : ""}`}
              >
                Performance
              </button>
            </nav>

            <div className="header-divider" />

            <div className="profile-chip">
              <div className="profile-text">
                <p className="profile-name">favaz.am</p>
                <p className="profile-role">Student Account</p>
              </div>
              <div className="profile-avatar">👨‍💻</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="hub-main">
        {/* TAB 1: 3-COLUMN PORTAL (PRACTICE | ACTIVITY | EXAM SIMULATOR) */}
        {activeTab === "practice" && (
          <div className="portal-grid">
            {/* CARD 1: PRACTICE */}
            <div
              className="portal-card theme-practice"
              onClick={() => router.push("/students/practice")}
            >
              <div className="portal-top">
                <span className="portal-badge">5 Core Skills</span>
                <span className="portal-arrow">&rarr;</span>
              </div>

              <div className="portal-image-wrap">
                <img
                  src="/images/practice-card.png"
                  alt="German Practice Modules"
                  className="portal-image"
                />
              </div>

              <div className="portal-center">
                <h2 className="portal-title">Practice</h2>
                <p className="portal-desc">
                  Train Reading, Writing, Listening, Speech, and Debate with instant AI mistake detection and corrections.
                </p>
              </div>

              <div className="portal-footer">
                <span>Reading • Writing • Listening • Speech • Debate</span>
                <span>Open</span>
              </div>
            </div>

            {/* CARD 2: ACTIVITY */}
            <div
              className="portal-card theme-activity"
              onClick={() => router.push("/students/activity")}
            >
              <div className="portal-top">
                <span className="portal-badge">Unlimited XP</span>
                <span className="portal-arrow">&rarr;</span>
              </div>

              <div className="portal-image-wrap">
                <img
                  src="/images/activity-card.png"
                  alt="German Learning Activities"
                  className="portal-image"
                />
              </div>

              <div className="portal-center">
                <h2 className="portal-title">Activity</h2>
                <p className="portal-desc">
                  Explore your progress dashboard, German-English dictionary, flip flashcards, and daily vocabulary mini-games.
                </p>
              </div>

              <div className="portal-footer">
                <span>Dictionary • Flashcards • Mini-Games</span>
                <span>Play</span>
              </div>
            </div>

            {/* CARD 3: EXAM SIMULATOR */}
            <div className="portal-card theme-exam">
              <div className="portal-top">
                <span className="portal-badge">B1 / B2 Live AI</span>
                <span className="portal-arrow">&rarr;</span>
              </div>

              <div
                className="portal-image-wrap"
                onClick={() => setShowTokenConfirm(true)}
              >
                <img
                  src="/images/exam-card.png"
                  alt="AI Exam Simulator"
                  className="portal-image"
                />
              </div>

              <div className="portal-center">
                <h2 className="portal-title">Exam Simulator</h2>
                <p className="portal-desc">
                  Enter the 8-stage live voice simulation with AI Examiner Rachel under real exam timing and scoring.
                </p>
              </div>

              <div className="exam-actions">
                <button
                  type="button"
                  onClick={() => setShowTokenConfirm(true)}
                  className="btn-primary"
                >
                  Launch Exam (1 🎟️)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    setActiveReport("b2-exam");
                  }}
                  className="btn-secondary"
                >
                  Recent Mistakes &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
    

        {/* TAB 2: MY INSTITUTE */}
        {activeTab === "institute" && (
          <div className="panel-stack">
            <div className="surface-card">
              <div className="institute-top">
                <div>
                  <span className="kicker-amber">Batch Code: LA-B1-084</span>
                  <h2 className="section-title">Los Andes Institute of Management &amp; Technology</h2>
                </div>
                <span className="status-pill">Enrolled &bull; Active</span>
              </div>

              <div className="stats-3-grid">
                <div className="stat-box">
                  <p className="stat-label">Current Batch</p>
                  <p className="stat-value">B1 Nursing Track</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Attendance</p>
                  <p className="stat-value green">92% (22/24 Days)</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Next Offline Class</p>
                  <p className="stat-value amber">Mon, 9:30 AM</p>
                </div>
              </div>
            </div>

            <div className="two-col-grid">
              <div className="surface-card">
                <h3 className="lb-heading amber">🏆 Batch Leaderboard (B1 Nursing)</h3>
                <div className="lb-list">
                  {[
                    { name: "Anjali Menon", xp: "1,820 XP", badge: "🥇" },
                    { name: "favaz.am (You)", xp: `${xp} XP`, badge: "🥈", highlight: true },
                    { name: "Rahul Krishnan", xp: "1,390 XP", badge: "🥉" },
                    { name: "Sneha Varghese", xp: "1,120 XP", badge: "4" },
                    { name: "Kiran Thomas", xp: "980 XP", badge: "5" },
                  ].map((s, idx) => (
                    <div key={idx} className={`lb-row ${s.highlight ? "highlight-amber" : ""}`}>
                      <div className="lb-left">
                        <span>{s.badge}</span>
                        <span>{s.name}</span>
                      </div>
                      <span>{s.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card">
                <h3 className="lb-heading green">🌍 All Institute Leaderboard</h3>
                <div className="lb-list">
                  {[
                    { name: "Deepak S. (B2 IT)", xp: "3,450 XP", badge: "🥇" },
                    { name: "Maria John (B2 Care)", xp: "3,120 XP", badge: "🥈" },
                    { name: "Arjun K. (B1 General)", xp: "2,890 XP", badge: "🥉" },
                    { name: "Sara Ali (B1 Nursing)", xp: "2,540 XP", badge: "4" },
                    { name: "favaz.am (You)", xp: `${xp} XP`, badge: "12", highlight: true },
                  ].map((s, idx) => (
                    <div key={idx} className={`lb-row ${s.highlight ? "highlight-green" : ""}`}>
                      <div className="lb-left">
                        <span>{s.badge}</span>
                        <span>{s.name}</span>
                      </div>
                      <span>{s.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERFORMANCE ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="panel-stack">
            <div className="subnav-bar">
              {(["writing", "reading", "speech", "debate"] as ReportTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveReport(tab)}
                  className={`subnav-btn ${activeReport === tab ? "active" : ""}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setActiveReport("b2-exam")}
                className={`subnav-btn b2-highlight ${activeReport === "b2-exam" ? "active" : ""}`}
              >
                B2 Exam Result
              </button>
            </div>

            {activeReport === "b2-exam" ? (
              <div className="two-col-grid">
                <div className="diag-card mastered">
                  <h3 className="section-title">Mastered Constructs</h3>
                  <div className="diag-item">
                    <strong>Vocabulary:</strong> Die Sehenswürdigkeiten in meiner Heimatstadt sind wunderschön.
                  </div>
                  <div className="diag-item">
                    <strong>Grammar:</strong> Weil das Wetter gut war, sind wir spazieren gegangen.
                  </div>
                </div>

                <div className="diag-card mistakes">
                  <h3 className="section-title">Diagnostic Corrections</h3>
                  <div className="diag-item error-box">
                    <div>You said: <s>Ich arbeite in der Krankenhaus.</s></div>
                    <div className="diag-correction">
                      Ich arbeite in dem Krankenhaus. (Dative neutral: das &rarr; dem)
                    </div>
                  </div>
                  <div className="diag-item error-box">
                    <div>You said: Wir müssen eine Lösung finden.</div>
                    <div className="diag-correction">
                      B2 Alternative: Wir müssen einen Kompromiss finden.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="surface-card" style={{ textAlign: "center", padding: "64px" }}>
                <p className="stat-label">{activeReport} analytics module pending</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TOKEN CONFIRMATION MODAL */}
      {showTokenConfirm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="section-title">🎟️ Use 1 Exam Token?</h3>
            <p className="portal-desc" style={{ marginTop: "10px" }}>
              This will start a full 8-stage live voice simulation. You have{" "}
              <strong>{tokens} tokens</strong> remaining this month.
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowTokenConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleStartExam} className="btn-primary">
                Enter Exam Room &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}