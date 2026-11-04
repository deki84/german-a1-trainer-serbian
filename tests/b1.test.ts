import { describe, expect, it } from "vitest";
import { A2_LESSONS } from "@/data/a2/lessons";
import { B1_LESSONS } from "@/data/b1/lessons";
import { B1_SENTENCES } from "@/data/b1/sentences";
import { LESSONS, SECTIONS } from "@/data/lessons";
import { BLANK } from "@/lib/gap";
import { normalize } from "@/lib/retrieve";

const b1Words = B1_LESSONS.flatMap((lesson) => lesson.words);
const bare = (text: string) => text.replace(/^(der|die|das) /, "").toLowerCase();

describe("B1-Daten (Entwurf)", () => {
  it("Lektions-IDs sind eindeutig, beginnen mit b1- und kollidieren nicht mit A1 oder A2", () => {
    const ids = B1_LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    const others = new Set([...LESSONS, ...A2_LESSONS].map((lesson) => lesson.id));
    for (const id of ids) {
      expect(id.startsWith("b1-"), id).toBe(true);
      expect(others.has(id), id).toBe(false);
    }
  });

  it("jede Lektion gehört zu einer bekannten Rubrik", () => {
    const sections = new Set(SECTIONS.map((section) => section.id));
    for (const lesson of B1_LESSONS) expect(sections.has(lesson.section), lesson.id).toBe(true);
  });

  it("kein B1-Wort steckt schon in A1 oder A2 und keins kommt doppelt vor", () => {
    const known = new Set(
      [...LESSONS, ...A2_LESSONS].flatMap((lesson) => lesson.words.map((word) => bare(word.de))),
    );
    const seen = new Set<string>();
    for (const word of b1Words) {
      expect(known.has(bare(word.de)), word.de).toBe(false);
      expect(seen.has(word.de), word.de).toBe(false);
      seen.add(word.de);
    }
  });

  it("jedes Wort hat Übersetzung, Aussprache und Emoji, Nomen haben einen Artikel", () => {
    for (const word of b1Words) {
      expect(word.sr.trim(), word.de).not.toBe("");
      expect(word.say.trim(), word.de).not.toBe("");
      expect(word.emoji.trim(), word.de).not.toBe("");
      expect(/^(der|die|das) \S/.test(word.de) || /^[a-zäöü]/.test(word.de), word.de).toBe(true);
    }
  });

  it("jede Lektion hat 4 bis 12 Wörter", () => {
    for (const lesson of B1_LESSONS) {
      expect(lesson.words.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.words.length, lesson.id).toBeLessThanOrEqual(12);
    }
  });
});

describe("B1-Sätze (Entwurf)", () => {
  it("jeder Satz hat genau eine Lücke und nichts ist leer", () => {
    for (const sentence of B1_SENTENCES) {
      expect(sentence.text.split(BLANK), sentence.word).toHaveLength(2);
      expect(sentence.answer.trim()).not.toBe("");
      expect(sentence.wrong.trim()).not.toBe("");
      expect(sentence.sr.trim()).not.toBe("");
      expect(normalize(sentence.answer)).not.toBe(normalize(sentence.wrong));
    }
  });

  it("jeder Satz gehört zu einem B1-Wort, und jedes B1-Wort hat genau einen Satz", () => {
    const words = new Set(b1Words.map((word) => word.de));
    for (const sentence of B1_SENTENCES) expect(words.has(sentence.word), sentence.word).toBe(true);
    const counts = new Map<string, number>();
    for (const sentence of B1_SENTENCES)
      counts.set(sentence.word, (counts.get(sentence.word) ?? 0) + 1);
    for (const word of words) expect(counts.get(word), word).toBe(1);
  });

  it("die Lösung beginnt wie das Lernwort", () => {
    const start = (text: string) => normalize(text.replace(/^(der|die|das) /, "")).slice(0, 3);
    for (const sentence of B1_SENTENCES) {
      expect(start(sentence.answer), sentence.word).toBe(start(sentence.word));
    }
  });
});
