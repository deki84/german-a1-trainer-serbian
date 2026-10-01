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
export function reviewCard(card: CardState | undefined, correct: boolean, today: string): CardState {
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

export function modeForBox(box: number): QuestionMode {
  if (box <= 1) return "meaning";
  if (box === 2) return "translate";
  return "listen";
}