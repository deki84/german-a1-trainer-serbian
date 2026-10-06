import type { QuestionMode } from "./types";

// Wiederholung nach X Tagen, Index 0 = Box 1
export const INTERVALS = [1, 2, 4, 8, 16, 32] as const;
export const MAX_BOX = INTERVALS.length;

export type CardState = {
  box: number;
  due: string; // "YYYY-MM-DD"
};

// Schlüssel ist das deutsche Wort, z. B. "das Wasser"
export type SrsState = Record<string, CardState>;

// Lokales Datum. Nicht toISOString(): das ist UTC, nach Mitternacht wäre es noch "gestern"
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y ?? 0, (m ?? 1) - 1, (d ?? 1) + days));
}

// Richtig: eine Box weiter. Falsch: zurück in Box 1.
export function reviewCard(
  card: CardState | undefined,
  correct: boolean,
  today: string,
): CardState {
  const box = correct ? Math.min((card?.box ?? 0) + 1, MAX_BOX) : 1;
  return { box, due: addDays(today, INTERVALS[box - 1] ?? 1) };
}

// "YYYY-MM-DD" lässt sich als Text vergleichen, weil die Reihenfolge stimmt
export function isDue(card: CardState, today: string): boolean {
  return card.due <= today;
}

export function getDueWords(state: SrsState, today: string): string[] {
  return Object.entries(state)
    .filter(([, card]) => isDue(card, today))
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([word]) => word);
}

export function isLearned(card: CardState | undefined): boolean {
  return card?.box === MAX_BOX;
}

// Box 1–3 wie bisher, ab Box 4 Lückentext (Box 5 gemischt: wieder Serbisch → Deutsch)
export function modeForBox(box: number): QuestionMode {
  if (box <= 1) return "meaning";
  if (box === 2) return "translate";
  if (box === 3) return "listen";
  if (box === 5) return "translate";
  return "gap";
}

// Ab dieser Box zählt ein Wort auf der Startseite als "naučeno"
export const KNOWN_FROM_BOX = 3;

export function countProgress(state: SrsState, allWords: readonly string[]) {
  let practiced = 0;
  let known = 0;
  for (const word of allWords) {
    const card = state[word];
    if (!card) continue;
    practiced++;
    if (card.box >= KNOWN_FROM_BOX) known++;
  }
  return { practiced, known, total: allWords.length };
}

const MILESTONES = [10, 25, 50, 100, 200, 400];

// Nächstes Zwischenziel: kleine, erreichbare Schritte statt "0 von 794"
export function nextMilestone(known: number, total: number): number {
  return MILESTONES.find((goal) => goal > known && goal < total) ?? total;
}

// Für die Fortschrittskarte: wie weit sind die geübten Wörter?
export function countStages(state: SrsState, allWords: readonly string[]) {
  const stages = { learning: 0, known: 0, mastered: 0 };
  for (const word of allWords) {
    const box = state[word]?.box;
    if (box === undefined) continue;
    if (box >= MAX_BOX) stages.mastered++;
    else if (box >= KNOWN_FROM_BOX) stages.known++;
    else stages.learning++;
  }
  return stages;
}
