import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, getNextLesson } from "@/data/lessons";

describe("getLesson", () => {
  it("findet eine vorhandene Lektion", () => {
    expect(getLesson("brojevi")?.title).toBe("Brojevi");
  });

  it("gibt undefined bei unbekannter ID zurück", () => {
    expect(getLesson("gibt-es-nicht")).toBeUndefined();
  });
});

describe("getNextLesson", () => {
  it("liefert die folgende Lektion", () => {
    expect(getNextLesson("pozdravi")?.id).toBe("brojevi");
  });

  it("gibt undefined bei der letzten Lektion zurück", () => {
    const lastId = LESSONS[LESSONS.length - 1].id;
    expect(getNextLesson(lastId)).toBeUndefined();
  });

  it("gibt undefined bei unbekannter ID zurück (nicht die erste Lektion!)", () => {
    expect(getNextLesson("gibt-es-nicht")).toBeUndefined();
  });
});

describe("Datenqualität", () => {
  it("jede Lektion hat eine eindeutige ID", () => {
    const ids = LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("IDs sind URL-tauglich (nur a-z, 0-9 und Bindestrich)", () => {
    for (const lesson of LESSONS) {
      expect(lesson.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("jede Lektion hat mindestens 2 Wörter (für die A/B-Frage)", () => {
    for (const lesson of LESSONS) {
      expect(lesson.words.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("kein Wort kommt doppelt vor", () => {
    const words = LESSONS.flatMap((lesson) => lesson.words.map((w) => w.de));
    expect(new Set(words).size).toBe(words.length);
  });

  it("keine zwei Wörter einer Lektion haben dieselbe Übersetzung", () => {
    for (const lesson of LESSONS) {
      const translations = lesson.words.map((w) => w.sr);
      expect(new Set(translations).size).toBe(translations.length);
    }
  });

  it("kein Feld ist leer", () => {
    for (const lesson of LESSONS) {
      for (const word of lesson.words) {
        expect(word.de.trim()).not.toBe("");
        expect(word.sr.trim()).not.toBe("");
        expect(word.say.trim()).not.toBe("");
        expect(word.emoji.trim()).not.toBe("");
      }
    }
  });
});
