import { A2_LESSONS } from "@/data/a2/lessons";
import { A2_SENTENCES } from "@/data/a2/sentences";
import { B1_LESSONS } from "@/data/b1/lessons";
import { B1_SENTENCES } from "@/data/b1/sentences";
import { LESSONS } from "@/data/lessons";
import { SENTENCES } from "@/data/sentences";
import type { GapSentence, Lesson } from "@/lib/types";

/**
 * Hier laufen die Niveaus zusammen.
 *
 * A2 und B1 sind nur sichtbar, wenn NEXT_PUBLIC_ENABLE_A2=true bzw. NEXT_PUBLIC_ENABLE_B1=true
 * gesetzt ist (zum Beispiel in der Vercel-Vorschau). Ohne Schalter bleibt die App genau wie A1.
 * Die Schalter werden beim Build eingebaut: nach dem Ändern muss neu gebaut werden.
 */
export type Level = "a1" | "a2" | "b1";

export const A2_ENABLED = process.env.NEXT_PUBLIC_ENABLE_A2 === "true";
export const B1_ENABLED = process.env.NEXT_PUBLIC_ENABLE_B1 === "true";

/** Eingeschaltete Niveaus in Lernreihenfolge (A1 ist immer dabei) */
export const ENABLED_LEVELS: Level[] = [
  "a1",
  ...(A2_ENABLED ? (["a2"] as const) : []),
  ...(B1_ENABLED ? (["b1"] as const) : []),
];

/** Lernreihenfolge: erst alle A1-Lektionen, dann A2, dann B1 (je nach Schalter) */
export const VISIBLE_LESSONS: Lesson[] = [
  ...LESSONS,
  ...(A2_ENABLED ? A2_LESSONS : []),
  ...(B1_ENABLED ? B1_LESSONS : []),
];

export const VISIBLE_SENTENCES: GapSentence[] = [
  ...SENTENCES,
  ...(A2_ENABLED ? A2_SENTENCES : []),
  ...(B1_ENABLED ? B1_SENTENCES : []),
];

/** Lektionen eines Niveaus. Ein ausgeschaltetes Niveau ist leer. */
export function lessonsOf(level: Level): Lesson[] {
  if (level === "a1") return LESSONS;
  if (level === "a2") return A2_ENABLED ? A2_LESSONS : [];
  return B1_ENABLED ? B1_LESSONS : [];
}

export function getVisibleLesson(id: string): Lesson | undefined {
  return VISIBLE_LESSONS.find((lesson) => lesson.id === id);
}

/** Nächste Lektion in der Lernreihenfolge (nach der letzten A1-Lektion kommt die erste A2-Lektion) */
export function getNextVisibleLesson(id: string): Lesson | undefined {
  const index = VISIBLE_LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1) return undefined;
  return VISIBLE_LESSONS[index + 1];
}

/** Lektionen einer Rubrik für ein Niveau, in Lernreihenfolge */
export function lessonsBySection(sectionId: string, level: Level): Lesson[] {
  return lessonsOf(level).filter((lesson) => lesson.section === sectionId);
}
