import { shuffle, type RandomFn } from "./quiz";
import { getDueWords, modeForBox, type SrsState } from "./srs";
import type { Lesson, QuestionMode, Word } from "./types";

export type DailyGoal = 15;
export const DAILY_GOAL: DailyGoal = 15;

export const NEW_WORDS: Record<DailyGoal, number> = { 15: 5 };
export const MAX_REVIEWS: Record<DailyGoal, number> = { 15: 30 };

export type SessionItem = {
  word: Word;
  pool: Word[]; // Lektion des Wortes, für die falsche Antwort
  mode: QuestionMode;
  kind: "review" | "new" | "recheck"; // recheck: neues Wort am Ende nochmal, wird nicht gespeichert
};

// Viele Wiederholungen fällig → weniger neue Wörter, damit der Berg nicht wächst
export function newWordCount(reviewCount: number, goal: DailyGoal): number {
  const max = MAX_REVIEWS[goal];
  if (reviewCount >= max) return 0;
  if (reviewCount >= max / 2) return Math.ceil(NEW_WORDS[goal] / 2);
  return NEW_WORDS[goal];
}

export function buildDailySession(
  srs: SrsState,
  lessons: readonly Lesson[],
  today: string,
  goal: DailyGoal,
  newAlreadyToday = 0,
  random: RandomFn = Math.random,
): SessionItem[] {
  const lookup = new Map<string, { word: Word; pool: Word[] }>();
  for (const lesson of lessons) {
    for (const word of lesson.words) lookup.set(word.de, { word, pool: lesson.words });
  }

  const reviews: SessionItem[] = [];
  for (const de of getDueWords(srs, today).slice(0, MAX_REVIEWS[goal])) {
    const entry = lookup.get(de);
    const card = srs[de];
    if (entry && card) reviews.push({ ...entry, mode: modeForBox(card.box), kind: "review" });
  }

  // Neue Wörter in Lernreihenfolge: erst die ersten Lektionen
  const newItems: SessionItem[] = [];
  const limit = Math.max(0, newWordCount(reviews.length, goal) - newAlreadyToday);
  for (const { word, pool } of lookup.values()) {
    if (newItems.length >= limit) break;
    if (!srs[word.de]) newItems.push({ word, pool, mode: "meaning", kind: "new" });
  }

  const rechecks = newItems.map((item): SessionItem => ({
    ...item,
    mode: "translate",
    kind: "recheck",
  }));

  return [...shuffle(reviews, random), ...newItems, ...shuffle(rechecks, random)];
}

// Für die Startseite: wie viel ist heute dran, ohne die ganze Liste zu bauen
export function countToday(
  srs: SrsState,
  allWords: readonly string[],
  today: string,
  goal: DailyGoal,
  newAlreadyToday = 0,
): { reviews: number; fresh: number } {
  const known = new Set(allWords);
  const reviews = Math.min(
    getDueWords(srs, today).filter((word) => known.has(word)).length,
    MAX_REVIEWS[goal],
  );
  const unseen = allWords.filter((word) => !srs[word]).length;
  const fresh = Math.min(unseen, Math.max(0, newWordCount(reviews, goal) - newAlreadyToday));
  return { reviews, fresh };
}
