"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./Activity.css";

type Word = {
  id: number;
  german: string;
  english: string;
  article?: string;
  plural?: string;
  category: string;
  level: "A1" | "A2" | "B1";
  example: string;
  exampleEnglish: string;
  grammar: string;
};

type ActivitySection = "home" | "dictionary" | "cards" | "sprint";

const WORDS: Word[] = [
  { id: 1, german: "Haus", english: "house", article: "das", plural: "Häuser", category: "Noun", level: "A1", example: "Das Haus ist groß.", exampleEnglish: "The house is big.", grammar: "Neuter noun · Plural: Häuser" },
  { id: 2, german: "Buch", english: "book", article: "das", plural: "Bücher", category: "Noun", level: "A1", example: "Ich lese ein Buch.", exampleEnglish: "I am reading a book.", grammar: "Neuter noun · Plural: Bücher" },
  { id: 3, german: "Familie", english: "family", article: "die", plural: "Familien", category: "Noun", level: "A1", example: "Meine Familie ist nett.", exampleEnglish: "My family is kind.", grammar: "Feminine noun · Plural: Familien" },
  { id: 4, german: "Freund", english: "friend (male)", article: "der", plural: "Freunde", category: "Noun", level: "A1", example: "Er ist mein Freund.", exampleEnglish: "He is my friend.", grammar: "Masculine noun · Plural: Freunde" },
  { id: 5, german: "Wasser", english: "water", article: "das", category: "Noun", level: "A1", example: "Ich trinke Wasser.", exampleEnglish: "I drink water.", grammar: "Neuter noun · Usually uncountable" },
  { id: 6, german: "Zeit", english: "time", article: "die", plural: "Zeiten", category: "Noun", level: "A1", example: "Ich habe heute Zeit.", exampleEnglish: "I have time today.", grammar: "Feminine noun · Plural: Zeiten" },
  { id: 7, german: "gehen", english: "to go", category: "Verb", level: "A1", example: "Wir gehen nach Hause.", exampleEnglish: "We are going home.", grammar: "Irregular verb · geht · ging · ist gegangen" },
  { id: 8, german: "machen", english: "to do / make", category: "Verb", level: "A1", example: "Was machst du heute?", exampleEnglish: "What are you doing today?", grammar: "Regular verb · macht · machte · hat gemacht" },
  { id: 9, german: "lernen", english: "to learn", category: "Verb", level: "A1", example: "Ich lerne Deutsch.", exampleEnglish: "I am learning German.", grammar: "Regular verb · lernt · lernte · hat gelernt" },
  { id: 10, german: "sprechen", english: "to speak", category: "Verb", level: "A1", example: "Sie spricht Deutsch.", exampleEnglish: "She speaks German.", grammar: "Irregular verb · spricht · sprach · hat gesprochen" },
  { id: 11, german: "essen", english: "to eat", category: "Verb", level: "A1", example: "Wir essen zusammen.", exampleEnglish: "We eat together.", grammar: "Irregular verb · isst · aß · hat gegessen" },
  { id: 12, german: "trinken", english: "to drink", category: "Verb", level: "A1", example: "Er trinkt Kaffee.", exampleEnglish: "He drinks coffee.", grammar: "Irregular verb · trinkt · trank · hat getrunken" },
  { id: 13, german: "schön", english: "beautiful / nice", category: "Adjective", level: "A1", example: "Das ist ein schöner Tag.", exampleEnglish: "That is a beautiful day.", grammar: "Adjective · Comparative: schöner · Superlative: am schönsten" },
  { id: 14, german: "klein", english: "small", category: "Adjective", level: "A1", example: "Der Hund ist klein.", exampleEnglish: "The dog is small.", grammar: "Adjective · Comparative: kleiner · Superlative: am kleinsten" },
  { id: 15, german: "schnell", english: "fast / quickly", category: "Adjective", level: "A1", example: "Der Zug ist schnell.", exampleEnglish: "The train is fast.", grammar: "Adjective / adverb · Comparative: schneller" },
  { id: 16, german: "heute", english: "today", category: "Adverb", level: "A1", example: "Heute arbeite ich nicht.", exampleEnglish: "I am not working today.", grammar: "Temporal adverb" },
  { id: 17, german: "immer", english: "always", category: "Adverb", level: "A1", example: "Sie kommt immer pünktlich.", exampleEnglish: "She always arrives on time.", grammar: "Frequency adverb" },
  { id: 18, german: "hier", english: "here", category: "Adverb", level: "A1", example: "Ich wohne hier.", exampleEnglish: "I live here.", grammar: "Adverb of place" },
  { id: 19, german: "ich", english: "I", category: "Pronoun", level: "A1", example: "Ich heiße Anna.", exampleEnglish: "My name is Anna.", grammar: "Personal pronoun · Nominative · Accusative: mich · Dative: mir" },
  { id: 20, german: "wir", english: "we", category: "Pronoun", level: "A1", example: "Wir lernen zusammen.", exampleEnglish: "We study together.", grammar: "Personal pronoun · Nominative · Accusative: uns · Dative: uns" },
  { id: 21, german: "mit", english: "with", category: "Preposition", level: "A1", example: "Ich fahre mit dem Bus.", exampleEnglish: "I travel by bus.", grammar: "Preposition · Always takes the dative case" },
  { id: 22, german: "für", english: "for", category: "Preposition", level: "A1", example: "Das Geschenk ist für dich.", exampleEnglish: "The present is for you.", grammar: "Preposition · Always takes the accusative case" },
  { id: 23, german: "und", english: "and", category: "Conjunction", level: "A1", example: "Anna und Tom lernen Deutsch.", exampleEnglish: "Anna and Tom are learning German.", grammar: "Coordinating conjunction · Does not change normal word order" },
  { id: 24, german: "aber", english: "but", category: "Conjunction", level: "A1", example: "Ich bin müde, aber glücklich.", exampleEnglish: "I am tired but happy.", grammar: "Coordinating conjunction" },
  { id: 25, german: "der", english: "the (masculine)", category: "Article", level: "A1", example: "Der Mann ist freundlich.", exampleEnglish: "The man is friendly.", grammar: "Definite article · Masculine nominative" },
  { id: 26, german: "ein", english: "a / an (masculine or neuter)", category: "Article", level: "A1", example: "Das ist ein Tisch.", exampleEnglish: "That is a table.", grammar: "Indefinite article · Masculine nominative / neuter nominative or accusative" },
  { id: 27, german: "weil", english: "because", category: "Conjunction", level: "A2", example: "Ich lerne, weil ich eine Prüfung habe.", exampleEnglish: "I am studying because I have an exam.", grammar: "Subordinating conjunction · Finite verb moves to the end" },
  { id: 28, german: "obwohl", english: "although", category: "Conjunction", level: "B1", example: "Obwohl es regnet, gehe ich spazieren.", exampleEnglish: "Although it is raining, I am going for a walk.", grammar: "Subordinating conjunction · Finite verb moves to the end" },
  { id: 29, german: "Entscheidung", english: "decision", article: "die", plural: "Entscheidungen", category: "Noun", level: "B1", example: "Das war eine wichtige Entscheidung.", exampleEnglish: "That was an important decision.", grammar: "Feminine noun · Plural: Entscheidungen" },
  { id: 30, german: "verbessern", english: "to improve", category: "Verb", level: "B1", example: "Ich möchte mein Deutsch verbessern.", exampleEnglish: "I want to improve my German.", grammar: "Regular verb · verbessert · verbesserte · hat verbessert" },
];

const SPRINT_WORDS = [
  { noun: "Ausbildung", article: "die", translation: "Vocational Training" },
  { noun: "Krankenhaus", article: "das", translation: "Hospital" },
  { noun: "Beruf", article: "der", translation: "Profession" },
  { noun: "Entscheidung", article: "die", translation: "Decision" },
  { noun: "Haus", article: "das", translation: "House" },
  { noun: "Freund", article: "der", translation: "Friend" },
];

const LEVELS = ["All", "A1", "A2", "B1"] as const;
const CATEGORIES = ["All", "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Article"];

export default function ActivityPage() {
  const router = useRouter();
  const [section, setSection] = useState<ActivitySection>("home");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(0);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [known, setKnown] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [deck, setDeck] = useState<Word[]>(WORDS);

  // Article Sprint State
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintXp, setSprintXp] = useState(0);
  const [sprintFeedback, setSprintFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("german-activity-favorites") || "[]"));
      setKnown(JSON.parse(localStorage.getItem("german-activity-known") || "[]"));
      setSprintXp(Number(localStorage.getItem("german-activity-xp") || "0"));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("german-activity-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("german-activity-known", JSON.stringify(known));
  }, [known]);

  useEffect(() => {
    localStorage.setItem("german-activity-xp", String(sprintXp));
  }, [sprintXp]);

  const filtered = useMemo(
    () =>
      WORDS.filter((word) => {
        const text = `${word.german} ${word.english} ${word.article || ""}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (level === "All" || word.level === level) &&
          (category === "All" || word.category === category) &&
          (!showFavorites || favorites.includes(word.id))
        );
      }),
    [query, level, category, showFavorites, favorites]
  );

  const cardWords = useMemo(
    () =>
      deck.filter(
        (word) =>
          (level === "All" || word.level === level) &&
          (category === "All" || word.category === category) &&
          (!showFavorites || favorites.includes(word.id))
      ),
    [deck, level, category, showFavorites, favorites]
  );

  const pageCount = Math.max(1, Math.ceil(cardWords.length / 9));
  const pageWords = cardWords.slice(page * 9, page * 9 + 9);

  const toggleFavorite = (id: number) =>
    setFavorites((old) => (old.includes(id) ? old.filter((i) => i !== id) : [...old, id]));

  const toggleKnown = (id: number) =>
    setKnown((old) => (old.includes(id) ? old.filter((i) => i !== id) : [...old, id]));

  const shuffleCards = () => {
    setDeck((old) => [...old].sort(() => Math.random() - 0.5));
    setPage(0);
    setFlipped([]);
  };

  const handleArticleGuess = (guess: string) => {
    const current = SPRINT_WORDS[sprintIndex];
    if (guess === current.article) {
      setSprintFeedback({ text: "✅ +15 XP", ok: true });
      setSprintXp((prev) => prev + 15);
      setTimeout(() => {
        setSprintFeedback(null);
        setSprintIndex((prev) => (prev + 1) % SPRINT_WORDS.length);
      }, 800);
    } else {
      setSprintFeedback({ text: `❌ ${current.article} ${current.noun}`, ok: false });
    }
  };

  const openSection = (next: ActivitySection) => {
    setSection(next);
    setQuery("");
    setLevel("All");
    setCategory("All");
    setPage(0);
    setShowFavorites(false);
    setFlipped([]);
    setDeck(WORDS);
  };

  const sectionTitle =
    section === "home"
      ? "Dashboard"
      : section === "dictionary"
      ? "German Dictionary"
      : section === "cards"
      ? "Flashcards"
      : "Article Sprint";

  return (
    <main className="activity-shell">
      <aside className="a-sidebar">
        <button className="a-back-btn" onClick={() => router.push("/students")}>
          &larr; Back to Hub
        </button>

        <div className="a-brand">
          <div className="a-brand-mark">DE</div>
          <div className="a-brand-text">Activity</div>
        </div>

        <div className="a-side-label">Activity Space</div>
        <button
          className={`a-nav-link ${section === "home" ? "active" : ""}`}
          onClick={() => openSection("home")}
        >
          Dashboard
        </button>
        <button
          className={`a-nav-link ${section === "dictionary" ? "active" : ""}`}
          onClick={() => openSection("dictionary")}
        >
          German Dictionary
        </button>
        <button
          className={`a-nav-link ${section === "cards" ? "active" : ""}`}
          onClick={() => openSection("cards")}
        >
          Flashcards
        </button>
        <button
          className={`a-nav-link ${section === "sprint" ? "active" : ""}`}
          onClick={() => openSection("sprint")}
        >
          Article Sprint
        </button>

        <div className="a-sidebar-foot">
          <span className="a-level-badge">A1 – B1</span>
          <p>Daily drills, vocabulary lookup, and unlimited XP.</p>
        </div>
      </aside>

      <section className="a-main">
        <header className="a-topbar">
          <div>
            <span className="a-eyebrow">Activity Space</span>
            <div className="a-top-title">{sectionTitle}</div>
          </div>
          <div className="a-sync-pill">
            <span className="a-dot" /> Progress saved
          </div>
        </header>

        <div className="a-content">
          {section === "home" && (
            <>
              <div className="a-hero">
                <span className="a-eyebrow">Daily Activity</span>
                <h1>
                  Sharpen your German <span>every day.</span>
                </h1>
                <p>
                  Look up words in the dictionary, flip flashcards for active recall, and earn unlimited XP in Article Sprint.
                </p>
                <button className="a-primary-btn" onClick={() => openSection("sprint")}>
                  Play Article Sprint &rarr;
                </button>
              </div>

              <div className="a-stats-grid">
                <div className="a-stat-card">
                  <strong>{WORDS.length}</strong>
                  <span>Dictionary Words</span>
                </div>
                <div className="a-stat-card">
                  <strong>{known.length}</strong>
                  <span>Cards Mastered</span>
                </div>
                <div className="a-stat-card">
                  <strong>{favorites.length}</strong>
                  <span>Saved Favourites</span>
                </div>
                <div className="a-stat-card">
                  <strong>{sprintXp} XP</strong>
                  <span>Article Sprint XP</span>
                </div>
              </div>

              <div className="a-tool-grid">
                <button className="a-tool-card" onClick={() => openSection("dictionary")}>
                  <span className="a-eyebrow">Word Explorer</span>
                  <h3>German Dictionary</h3>
                  <p>Search German or English words, study grammar rules, and save favourites.</p>
                  <span className="a-card-link">Open Dictionary &rarr;</span>
                </button>

                <button className="a-tool-card" onClick={() => openSection("cards")}>
                  <span className="a-eyebrow">Active Recall</span>
                  <h3>Flashcards</h3>
                  <p>Flip German vocabulary cards, shuffle the deck, and mark mastered words.</p>
                  <span className="a-card-link">Start Flashcards &rarr;</span>
                </button>

                <button className="a-tool-card" onClick={() => openSection("sprint")}>
                  <span className="a-eyebrow">Der · Die · Das</span>
                  <h3>Article Sprint</h3>
                  <p>Build instant muscle memory for German noun genders with unlimited XP.</p>
                  <span className="a-card-link">Play Now &rarr;</span>
                </button>
              </div>
            </>
          )}

          {section === "dictionary" && (
            <>
              <div className="a-page-head">
                <span className="a-eyebrow">Word Explorer</span>
                <h1>German Dictionary</h1>
                <p>Search by German word or English meaning.</p>
              </div>

              <div className="a-filter-bar">
                <input
                  className="a-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search German or English..."
                />
                <select className="a-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  {LEVELS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <select className="a-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <button
                  className={`a-filter-btn ${showFavorites ? "active" : ""}`}
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  ♡ Favourites
                </button>
              </div>

              <div className="a-toolbar">
                <span>{filtered.length} entries found</span>
              </div>

              {filtered.length > 0 ? (
                <div className="a-dict-list">
                  {filtered.map((word) => (
                    <article className="a-dict-row" key={word.id}>
                      <div>
                        <div className="a-word-title">
                          {word.article && <span className="a-article">{word.article}</span>}
                          {word.german}
                        </div>
                        <div className="a-word-en">{word.english}</div>
                      </div>

                      <div className="a-tags">
                        <span className="a-tag level">{word.level}</span>
                        <span className="a-tag">{word.category}</span>
                      </div>

                      <button
                        className={`a-heart ${favorites.includes(word.id) ? "hearted" : ""}`}
                        onClick={() => toggleFavorite(word.id)}
                        aria-label="Toggle favourite"
                      >
                        {favorites.includes(word.id) ? "♥" : "♡"}
                      </button>

                      <details className="a-details">
                        <summary>Study details</summary>
                        <div className="a-detail-box">
                          <p><b>Grammar:</b> {word.grammar}</p>
                          {word.plural && <p><b>Plural:</b> {word.plural}</p>}
                          <p><b>Example:</b> {word.example}</p>
                          <p><b>English:</b> {word.exampleEnglish}</p>
                          <button
                            className="a-mini-btn"
                            onClick={() => {
                              setSection("cards");
                              setDeck(WORDS.filter((w) => w.id === word.id));
                              setPage(0);
                            }}
                          >
                            Review as Flashcard &rarr;
                          </button>
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="a-empty">No matching words found. Try another search or filter.</div>
              )}
            </>
          )}

          {section === "cards" && (
            <>
              <div className="a-page-head">
                <span className="a-eyebrow">Active Recall</span>
                <h1>Flashcards</h1>
                <p>Click any card to reveal its English meaning.</p>
              </div>

              <div className="a-filter-bar">
                <select
                  className="a-select"
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(0);
                    setFlipped([]);
                  }}
                >
                  {LEVELS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <select
                  className="a-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(0);
                    setFlipped([]);
                  }}
                >
                  {CATEGORIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <button
                  className={`a-filter-btn ${showFavorites ? "active" : ""}`}
                  onClick={() => {
                    setShowFavorites(!showFavorites);
                    setPage(0);
                  }}
                >
                  ♡ Favourites
                </button>
                <button className="a-filter-btn" onClick={shuffleCards}>
                  Shuffle Deck
                </button>
              </div>

              <div className="a-toolbar">
                <span>{cardWords.length} cards in deck</span>
                <span>{known.length} mastered</span>
              </div>

              {pageWords.length > 0 ? (
                <div className="a-flash-grid">
                  {pageWords.map((word) => {
                    const isFlipped = flipped.includes(word.id);
                    return (
                      <div className={`a-flash-card ${isFlipped ? "flipped" : ""}`} key={word.id}>
                        <button
                          className="a-flip-btn"
                          onClick={() =>
                            setFlipped((old) =>
                              old.includes(word.id) ? old.filter((id) => id !== word.id) : [...old, word.id]
                            )
                          }
                        >
                          <span className="a-flash-top">
                            <span>{word.level}</span>
                            <span>{word.category}</span>
                          </span>
                          <span className="a-flash-word">
                            {isFlipped ? (
                              word.english
                            ) : (
                              <>
                                {word.article && <small>{word.article}</small>}
                                {word.german}
                              </>
                            )}
                          </span>
                          <span className="a-flip-hint">
                            {isFlipped ? "Click for German" : "Click to reveal"}
                          </span>
                        </button>

                        <div className="a-flash-actions">
                          <button
                            onClick={() => toggleFavorite(word.id)}
                            className={favorites.includes(word.id) ? "hearted" : ""}
                          >
                            {favorites.includes(word.id) ? "♥ Saved" : "♡ Save"}
                          </button>
                          <button
                            onClick={() => toggleKnown(word.id)}
                            className={known.includes(word.id) ? "known" : ""}
                          >
                            {known.includes(word.id) ? "✓ Known" : "Mark Known"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="a-empty">No cards match these filters.</div>
              )}

              <div className="a-pagination">
                <button
                  disabled={page === 0}
                  onClick={() => {
                    setPage(page - 1);
                    setFlipped([]);
                  }}
                >
                  &larr; Previous
                </button>
                <span>
                  Page {page + 1} of {pageCount}
                </span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => {
                    setPage(page + 1);
                    setFlipped([]);
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </>
          )}

          {section === "sprint" && (
            <>
              <div className="a-page-head">
                <span className="a-eyebrow">Der · Die · Das</span>
                <h1>Article Sprint</h1>
                <p>Pick the right German article to build muscle memory. No exam tokens required.</p>
              </div>

              <div className="a-sprint-card">
                <div className="a-sprint-meta">
                  <span>
                    Word {sprintIndex + 1} of {SPRINT_WORDS.length}
                  </span>
                  <span className="a-sprint-xp">{sprintXp} XP</span>
                </div>

                <div className="a-sprint-prompt">
                  <p className="a-sprint-noun">___ {SPRINT_WORDS[sprintIndex].noun}</p>
                  <p className="a-sprint-en">{SPRINT_WORDS[sprintIndex].translation}</p>
                </div>

                <div className={`a-sprint-feedback ${sprintFeedback ? (sprintFeedback.ok ? "ok" : "err") : ""}`}>
                  {sprintFeedback?.text}
                </div>

                <div className="a-sprint-buttons">
                  {["der", "die", "das"].map((art) => (
                    <button
                      key={art}
                      className="a-sprint-btn"
                      onClick={() => handleArticleGuess(art)}
                    >
                      {art}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}