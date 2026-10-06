import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { SENTENCES } from "@/data/sentences";
import { BLANK, buildAnyQuestion, buildGapQuestion, fillBlank, findSentence } from "@/lib/gap";
import { normalize } from "@/lib/retrieve";
import type { GapSentence, Word } from "@/lib/types";

const wohnen: Word = { de: "wohnen", sr: "stanovati", say: "vonen", emoji: "🏠" };
const gehen: Word = { de: "gehen", sr: "ići", say: "geen", emoji: "🚶" };
const sample: GapSentence = {
  word: "wohnen",
  text: "Ich ___ in München.",
  answer: "wohne",
  wrong: "wohnt",
  sr: "Stanujem u Minhenu.",
};
const fixed = (value: number) => () => value;

describe("Lückensätze (Datenqualität)", () => {
  it("jeder Satz hat genau eine Lücke", () => {
    for (const sentence of SENTENCES) {
      expect(sentence.text.split(BLANK)).toHaveLength(2);
    }
  });

  it("richtige und falsche Antwort sind verschieden, nichts ist leer", () => {
    for (const sentence of SENTENCES) {
      expect(sentence.answer.trim()).not.toBe("");
      expect(sentence.wrong.trim()).not.toBe("");
      expect(sentence.sr.trim()).not.toBe("");
      expect(normalize(sentence.answer)).not.toBe(normalize(sentence.wrong));
    }
  });

  it("jeder Satz gehört zu einem Wort aus der Wortliste", () => {
    const words = new Set(LESSONS.flatMap((lesson) => lesson.words.map((word) => word.de)));
    for (const sentence of SENTENCES) {
      expect(words.has(sentence.word), sentence.word).toBe(true);
    }
  });

  it("die Lösung beginnt wie das Lernwort (nur 'sein' ist unregelmäßig)", () => {
    for (const sentence of SENTENCES) {
      if (sentence.word === "sein") continue;
      const start = (text: string) => normalize(text.replace(/^(der|die|das) /, "")).slice(0, 3);
      expect(start(sentence.answer), sentence.word).toBe(start(sentence.word));
    }
  });

  it("kein Satz kommt doppelt vor", () => {
    const texts = SENTENCES.map((sentence) => `${sentence.word}|${sentence.text}`);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe("fillBlank", () => {
  it("setzt die Lösung in die Lücke", () => {
    expect(fillBlank("Ich ___ in München.", "wohne")).toBe("Ich wohne in München.");
  });
});

describe("findSentence", () => {
  it("findet einen Satz zum Wort", () => {
    expect(findSentence("wohnen", [sample])).toEqual(sample);
  });

  it("liefert undefined, wenn es keinen Satz gibt", () => {
    expect(findSentence("gehen", [sample])).toBeUndefined();
    expect(findSentence("gehen", [])).toBeUndefined();
  });
});

describe("buildGapQuestion", () => {
  it("hat zwei Antworten, genau eine ist richtig", () => {
    const question = buildGapQuestion(wohnen, sample);
    expect(question.mode).toBe("gap");
    expect(question.options).toHaveLength(2);
    expect(
      question.options.filter((option) => option.correct).map((option) => option.text),
    ).toEqual(["wohne"]);
    expect(question.sentence).toEqual({ text: sample.text, sr: sample.sr, answer: "wohne" });
  });

  it("die richtige Antwort steht mal bei A, mal bei B", () => {
    const positions = new Set<number>();
    for (let i = 0; i < 50; i++) {
      positions.add(buildGapQuestion(wohnen, sample).options.findIndex((option) => option.correct));
    }
    expect(positions).toEqual(new Set([0, 1]));
  });

  it("mit festem Zufall immer gleich", () => {
    expect(buildGapQuestion(wohnen, sample, fixed(0))).toEqual(
      buildGapQuestion(wohnen, sample, fixed(0)),
    );
  });
});

describe("buildAnyQuestion", () => {
  const pool = [wohnen, gehen];

  it("'gap' mit Satz ergibt einen Lückentext", () => {
    expect(buildAnyQuestion(wohnen, pool, "gap", [sample]).mode).toBe("gap");
  });

  it("'gap' ohne Satz wird zur Hörfrage", () => {
    const question = buildAnyQuestion(gehen, pool, "gap", [sample]);
    expect(question.mode).toBe("listen");
    expect(question.sentence).toBeUndefined();
  });

  it("andere Fragetypen bleiben unverändert", () => {
    expect(buildAnyQuestion(wohnen, pool, "meaning", [sample]).mode).toBe("meaning");
    expect(buildAnyQuestion(wohnen, pool, "translate", [sample]).mode).toBe("translate");
  });
});
