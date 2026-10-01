import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { PRAISE, buildQuestion, calculateStars, pickPraise, shuffle } from "@/lib/quiz";
import type { QuestionMode, Word } from "@/lib/types";

/** "Zufall", der immer denselben Wert liefert. Macht Tests vorhersagbar. */
const fixed = (value: number) => () => value;

const MODES: QuestionMode[] = ["meaning", "translate", "listen"];

const hallo: Word = { de: "Hallo", sr: "Zdravo", say: "halo", emoji: "👋" };
const danke: Word = { de: "danke", sr: "hvala", say: "danke", emoji: "🙏" };
const bitte: Word = { de: "bitte", sr: "molim", say: "bite", emoji: "🤲" };
const pool = [hallo, danke, bitte];

describe("shuffle", () => {
  it("verändert die ursprüngliche Liste nicht", () => {
    const original = [1, 2, 3, 4];
    shuffle(original);
    expect(original).toEqual([1, 2, 3, 4]);
  });

  it("enthält danach genau dieselben Elemente", () => {
    const result = shuffle([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("mischt mit festem Zufall immer gleich (Fisher-Yates)", () => {
    // random = 0 → jedes Element tauscht mit dem ersten: [1,2,3] → [3,2,1] → [2,3,1]
    expect(shuffle([1, 2, 3], fixed(0))).toEqual([2, 3, 1]);
  });

  it("funktioniert mit leerer Liste", () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe("buildQuestion", () => {
  it("hat genau zwei Antworten, davon genau eine richtig", () => {
    for (const mode of MODES) {
      const question = buildQuestion(hallo, pool, mode);
      expect(question.options).toHaveLength(2);
      expect(question.options.filter((option) => option.correct)).toHaveLength(1);
    }
  });

  it("'meaning': Antworten auf Serbisch, richtige ist die Übersetzung", () => {
    const question = buildQuestion(hallo, pool, "meaning");
    const correct = question.options.find((option) => option.correct);
    expect(correct?.text).toBe("Zdravo");
    expect(question.options.every((option) => option.lang === "sr")).toBe(true);
  });

  it("'translate': Antworten auf Deutsch, richtige ist das deutsche Wort", () => {
    const question = buildQuestion(hallo, pool, "translate");
    const correct = question.options.find((option) => option.correct);
    expect(correct?.text).toBe("Hallo");
    expect(question.options.every((option) => option.lang === "de")).toBe(true);
  });

  it("'listen': Antworten auf Serbisch wie bei 'meaning'", () => {
    const question = buildQuestion(hallo, pool, "listen");
    expect(question.options.find((option) => option.correct)?.text).toBe("Zdravo");
  });

  it("die falsche Antwort ist nie das gefragte Wort selbst", () => {
    for (let i = 0; i < 50; i++) {
      const question = buildQuestion(hallo, pool, "meaning");
      const wrong = question.options.find((option) => !option.correct);
      expect(wrong?.text).not.toBe("Zdravo");
    }
  });

  it("wirft einen Fehler, wenn es keine falsche Antwort gibt", () => {
    expect(() => buildQuestion(hallo, [hallo], "meaning")).toThrow();
  });

  it("die richtige Antwort steht mal bei A, mal bei B", () => {
    const positions = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const question = buildQuestion(hallo, pool, "meaning");
      positions.add(question.options.findIndex((option) => option.correct));
    }
    expect(positions).toEqual(new Set([0, 1]));
  });
});

describe("pickPraise", () => {
  it("liefert immer einen der Lobsprüche", () => {
    for (const value of [0, 0.5, 0.99]) {
      expect(PRAISE).toContain(pickPraise(fixed(value)));
    }
  });
});

describe("echte Daten", () => {
  it("jedes Wort jeder Lektion ergibt in jedem Modus zwei verschiedene Antworten", () => {
    for (const lesson of LESSONS) {
      for (const word of lesson.words) {
        for (const mode of MODES) {
          const [a, b] = buildQuestion(word, lesson.words, mode).options;
          expect(a.text).not.toBe(b.text);
        }
      }
    }
  });
});
describe("calculateStars", () => {
  it("3 Sterne ab 90 % beim ersten Versuch", () => {
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(8, 8)).toBe(3);
  });

  it("2 Sterne ab 60 %", () => {
    expect(calculateStars(6, 10)).toBe(2);
    expect(calculateStars(8, 10)).toBe(2);
  });

  it("1 Stern darunter, nie 0", () => {
    expect(calculateStars(5, 10)).toBe(1);
    expect(calculateStars(0, 10)).toBe(1);
  });

  it("stürzt bei 0 Wörtern nicht ab", () => {
    expect(calculateStars(0, 0)).toBe(1);
  });
});
