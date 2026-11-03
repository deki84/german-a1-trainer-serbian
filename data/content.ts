import { A2_LESSONS } from "@/data/a2/lessons";
import { A2_SENTENCES } from "@/data/a2/sentences";
import { LESSONS } from "@/data/lessons";
import { SENTENCES } from "@/data/sentences";
import type { GapSentence, Lesson } from "@/lib/types";

/**
 * Hier laufen die Niveaus zusammen.
 *
 * A2 ist nur sichtbar, wenn NEXT_PUBLIC_ENABLE_A2=true gesetzt ist
 * (zum Beispiel in der Vercel-Vorschau). Ohne den Schalter bleibt die App genau wie A1.
 * Der Schalter wird beim Build eingebaut: nach dem Ändern muss neu gebaut werden.
 */
export type Level = "a1" | "a2";

export const A2_ENABLED = process.env.NEXT_PUBLIC_ENABLE_A2 === "true";

/** Lernreihenfolge: erst alle A1-Lektionen, danach A2 (A2 nur mit eingeschaltetem Schalter) */
export const VISIBLE_LESSONS: Lesson[] = A2_ENABLED ? [...LESSONS, ...A2_LESSONS] : LESSONS;

export const VISIBLE_SENTENCES: GapSentence[] = A2_ENABLED
  ? [...SENTENCES, ...A2_SENTENCES]
  : SENTENCES;

/** Lektionen eines Niveaus. A2 ist ohne Schalter leer. */
export function lessonsOf(level: Level): Lesson[] {
  if (level === "a1") return LESSONS;
  return A2_ENABLED ? A2_LESSONS : [];
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
