// Topic library for the B2 speaking exam.
// Each exam gets: one presentation topic for the student, a different one for Josh, and one debate topic.
// Add new topics by adding a line with a new unique id. Never reuse or renumber ids.

export type Topic = { id: string; de: string };

export const PRESENTATION_TOPICS: Topic[] = [
  { id: "p01", de: "Beschreiben Sie Ihre Heimatstadt." },
  { id: "p02", de: "Wie hat das Smartphone unser Leben verändert?" },
  { id: "p03", de: "Der Wert von Freundschaft in Ihrem Leben" },
  { id: "p04", de: "Reisen: Warum ist es wichtig, andere Länder kennenzulernen?" },
  { id: "p05", de: "Gesunde Ernährung im Alltag" },
  { id: "p06", de: "Mein Traumberuf und der Weg dorthin" },
  { id: "p07", de: "Die Rolle von Sport im Leben junger Menschen" },
  { id: "p08", de: "Leben in der Großstadt oder auf dem Land?" },
  { id: "p09", de: "Wie wichtig ist es, Fremdsprachen zu lernen?" },
  { id: "p10", de: "Umweltschutz im Alltag: Was kann jeder Einzelne tun?" },
  { id: "p11", de: "Ein Fest oder eine Tradition in Ihrem Land" },
  { id: "p12", de: "Welche Rolle spielt die Familie in Ihrer Kultur?" },
  { id: "p13", de: "Arbeiten im Homeoffice: Vor- und Nachteile" },
  { id: "p14", de: "Mein schönster Urlaub" },
  { id: "p15", de: "Die Bedeutung von Bildung für die Zukunft" },
  { id: "p16", de: "Wie verändert künstliche Intelligenz unser Leben?" },
  { id: "p17", de: "Ehrenamtliche Arbeit: Warum engagieren sich Menschen?" },
  { id: "p18", de: "Das Leben als Student im Ausland" },
  { id: "p19", de: "Öffentliche Verkehrsmittel in Ihrer Stadt" },
  { id: "p20", de: "Wie verbringen Sie Ihre Freizeit?" },
  { id: "p21", de: "Lesen in Zeiten von Internet und Social Media" },
  { id: "p22", de: "Ein Vorbild in meinem Leben" },
  { id: "p23", de: "Die Bedeutung von Musik im Alltag" },
  { id: "p24", de: "Wie stellen Sie sich Ihre ideale Wohnung vor?" },
  { id: "p25", de: "Der Einfluss von Werbung auf unsere Kaufentscheidungen" },
  { id: "p26", de: "Stress im Alltag und wie man damit umgeht" },
  { id: "p27", de: "Kochen und Essen in Ihrer Kultur" },
  { id: "p28", de: "Technik im Haushalt: Hilfe oder Abhängigkeit?" },
  { id: "p29", de: "Online einkaufen oder im Geschäft?" },
  { id: "p30", de: "Die Bedeutung von Pünktlichkeit" },
  { id: "p31", de: "Wie wichtig ist ein Studium für den Berufserfolg?" },
  { id: "p32", de: "Das Wetter und das Klima in Ihrer Heimat" },
  { id: "p33", de: "Lebenslanges Lernen" },
  { id: "p34", de: "Jugendliche und ihre Zukunftspläne" },
  { id: "p35", de: "Wie informieren Sie sich über aktuelle Ereignisse?" },
  { id: "p36", de: "Zeit für Familie und Freunde in einem vollen Alltag" },
  { id: "p37", de: "Kleidung und Mode: Wie wichtig ist das Aussehen?" },
  { id: "p38", de: "Tiere im Leben des Menschen" },
  { id: "p39", de: "Die Bedeutung von Schlaf und Erholung" },
  { id: "p40", de: "Ein Erlebnis, das mein Leben verändert hat" },
];

// Debate topics are yes/no questions. Josh argues for or against the proposal (picked at random).
export const DEBATE_TOPICS: Topic[] = [
  { id: "d01", de: "Sollten soziale Medien für Jugendliche begrenzt werden?" },
  { id: "d02", de: "Sollte Online-Lernen Schulen ersetzen?" },
  { id: "d03", de: "Sollte es in Städten ein Autoverbot geben?" },
  { id: "d04", de: "Sollte die Vier-Tage-Woche eingeführt werden?" },
  { id: "d05", de: "Sollten Schuluniformen Pflicht sein?" },
  { id: "d06", de: "Sollten Handys im Unterricht verboten werden?" },
  { id: "d07", de: "Sollte Fleisch teurer werden, um das Klima zu schützen?" },
  { id: "d08", de: "Sollte man Studiengebühren einführen?" },
  { id: "d09", de: "Sollte jeder junge Mensch ein Pflichtjahr für die Gesellschaft leisten?" },
  { id: "d10", de: "Sollten Plastiktüten komplett verboten werden?" },
  { id: "d11", de: "Sollte Homeoffice zum Normalfall werden?" },
  { id: "d12", de: "Sollten Hausaufgaben abgeschafft werden?" },
  { id: "d13", de: "Sollten Zoos geschlossen werden?" },
  { id: "d14", de: "Sollte der öffentliche Nahverkehr kostenlos sein?" },
  { id: "d15", de: "Sollte man schon mit 16 Jahren wählen dürfen?" },
  { id: "d16", de: "Sollten Kinder schon im Kindergarten Fremdsprachen lernen?" },
  { id: "d17", de: "Sollte Werbung für ungesunde Lebensmittel verboten werden?" },
  { id: "d18", de: "Sollte man nur noch bargeldlos bezahlen?" },
  { id: "d19", de: "Sollte Kunstunterricht in der Schule Pflicht bleiben?" },
  { id: "d20", de: "Sollten Inlandsflüge verboten werden?" },
  { id: "d21", de: "Sollte künstliche Intelligenz in Schulen eingesetzt werden?" },
  { id: "d22", de: "Sollten Computerspiele im Alltag von Jugendlichen eingeschränkt werden?" },
  { id: "d23", de: "Sollte es auf allen Autobahnen ein Tempolimit geben?" },
  { id: "d24", de: "Sollten Profisportler weniger verdienen?" },
  { id: "d25", de: "Sollten Universitäten nur noch online unterrichten?" },
  { id: "d26", de: "Sollte jeder Mensch einmal für ein Jahr im Ausland leben?" },
  { id: "d27", de: "Sollte die Schule später beginnen?" },
  { id: "d28", de: "Sollten Tiere in der Forschung eingesetzt werden dürfen?" },
  { id: "d29", de: "Sollten Städte mehr Grünflächen statt Parkplätze bauen?" },
  { id: "d30", de: "Sollte Trinkgeld im Restaurant verpflichtend sein?" },
];

export type TopicIds = { user: string; partner: string; debate: string };
export type Stance = "FOR" | "AGAINST";

export type ExamTopics = {
  user: string; // the student's presentation topic
  partner: string; // Josh's presentation topic
  debate: string; // debate question
  stance: Stance; // Josh's side in the debate
  ids: TopicIds;
};

export type SeenTopics = { presentation: string[]; debate: string[] };

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

// Topics the student has not had yet. When all were seen, the whole list is used again.
function unseen(all: Topic[], seen: string[]): Topic[] {
  const s = new Set(seen);
  const fresh = all.filter((t) => !s.has(t.id));
  return fresh.length > 0 ? fresh : all;
}

export function pickTopics(seen?: Partial<SeenTopics>): ExamTopics {
  const seenP = Array.isArray(seen?.presentation) ? seen!.presentation!.map(String).slice(-300) : [];
  const seenD = Array.isArray(seen?.debate) ? seen!.debate!.map(String).slice(-300) : [];

  const user = pick(unseen(PRESENTATION_TOPICS, seenP));
  // Josh's topic must differ from the student's; prefer one the student has not had yet
  const partnerPool = unseen(PRESENTATION_TOPICS, seenP).filter((t) => t.id !== user.id);
  const partner = pick(partnerPool.length > 0 ? partnerPool : PRESENTATION_TOPICS.filter((t) => t.id !== user.id));
  const debate = pick(unseen(DEBATE_TOPICS, seenD));
  const stance: Stance = Math.random() < 0.5 ? "FOR" : "AGAINST";

  return {
    user: user.de,
    partner: partner.de,
    debate: debate.de,
    stance,
    ids: { user: user.id, partner: partner.id, debate: debate.id },
  };
}

// Used when the page reconnects in the middle of an exam: keep the same topics.
export function resolveTopics(ids: unknown, stance: unknown): ExamTopics | null {
  const i = ids as Partial<TopicIds> | null;
  if (!i || typeof i !== "object") return null;
  const user = PRESENTATION_TOPICS.find((t) => t.id === i.user);
  const partner = PRESENTATION_TOPICS.find((t) => t.id === i.partner);
  const debate = DEBATE_TOPICS.find((t) => t.id === i.debate);
  if (!user || !partner || !debate || user.id === partner.id) return null;
  return {
    user: user.de,
    partner: partner.de,
    debate: debate.de,
    stance: stance === "AGAINST" ? "AGAINST" : "FOR",
    ids: { user: user.id, partner: partner.id, debate: debate.id },
  };
}