import { describe, expect, it } from "vitest";
import { A2_LESSONS } from "@/data/a2/lessons";
import { A2_SENTENCES } from "@/data/a2/sentences";
import { LESSONS } from "@/data/lessons";
import { BLANK } from "@/lib/gap";
import { normalize } from "@/lib/retrieve";

const a2Words = A2_LESSONS.flatMap((lesson) => lesson.words);
const bare = (text: string) => text.replace(/^(der|die|das) /, "").toLowerCase();

describe("A2-Daten (Entwurf)", () => {
  it("Lektions-IDs sind eindeutig und kollidieren nicht mit A1", () => {
    const ids = A2_LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    const a1Ids = new Set(LESSONS.map((lesson) => lesson.id));
    for (const id of ids) expect(a1Ids.has(id), id).toBe(false);
  });

  it("kein A2-Wort steckt schon in A1 und keins kommt doppelt vor", () => {
    const a1 = new Set(LESSONS.flatMap((lesson) => lesson.words.map((word) => bare(word.de))));
    const seen = new Set<string>();
    for (const word of a2Words) {
      expect(a1.has(bare(word.de)), word.de).toBe(false);
      expect(seen.has(word.de), word.de).toBe(false);
      seen.add(word.de);
    }
  });

  it("jedes Wort hat Übersetzung, Aussprache und Emoji", () => {
    for (const word of a2Words) {
      expect(word.sr.trim(), word.de).not.toBe("");
      expect(word.say.trim(), word.de).not.toBe("");
      expect(word.emoji.trim(), word.de).not.toBe("");
    }
  });

  it("jede Lektion hat 4 bis 12 Wörter", () => {
    for (const lesson of A2_LESSONS) {
      expect(lesson.words.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.words.length, lesson.id).toBeLessThanOrEqual(12);
    }
  });
});

describe("A2-Sätze (Entwurf)", () => {
  it("jeder Satz hat genau eine Lücke und nichts ist leer", () => {
    for (const sentence of A2_SENTENCES) {
      expect(sentence.text.split(BLANK), sentence.word).toHaveLength(2);
      expect(sentence.answer.trim()).not.toBe("");
      expect(sentence.wrong.trim()).not.toBe("");
      expect(sentence.sr.trim()).not.toBe("");
      expect(normalize(sentence.answer)).not.toBe(normalize(sentence.wrong));
    }
  });

  it("jeder Satz gehört zu einem A2-Wort, und jedes A2-Wort hat einen Satz", () => {
    const words = new Set(a2Words.map((word) => word.de));
    for (const sentence of A2_SENTENCES) expect(words.has(sentence.word), sentence.word).toBe(true);
    const covered = new Set(A2_SENTENCES.map((sentence) => sentence.word));
    for (const word of words) expect(covered.has(word), word).toBe(true);
  });

  it("die Lösung beginnt wie das Lernwort", () => {
    const start = (text: string) => normalize(text.replace(/^(der|die|das) /, "")).slice(0, 3);
    for (const sentence of A2_SENTENCES) {
      expect(start(sentence.answer), sentence.word).toBe(start(sentence.word));
    }
  });
});
