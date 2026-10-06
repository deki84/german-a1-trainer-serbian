import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { toLatin } from "@/lib/latin";
import { findRelevantWords, normalize } from "@/lib/retrieve";
import { buildTutorPrompt } from "@/lib/tutorPrompt";

describe("toLatin", () => {
  it("wandelt serbisches Kyrillisch um", () => {
    expect(toLatin("их мус гехен")).toBe("ih mus gehen");
    expect(toLatin("Љубав, Њива, Џеп, Ђак")).toBe("Ljubav, Njiva, Džep, Đak");
    expect(toLatin("шта, жена, ћао, чај")).toBe("šta, žena, ćao, čaj");
  });

  it("lässt Latinica, Deutsch und Emojis unverändert", () => {
    expect(toLatin("**Danke** (danke) 🙏 Šta je ü?")).toBe("**Danke** (danke) 🙏 Šta je ü?");
  });

  it("funktioniert auch Zeichen für Zeichen (Streaming)", () => {
    const text = "Здраво, како си?";
    expect([...text].map(toLatin).join("")).toBe(toLatin(text));
  });
});

describe("normalize", () => {
  it("ignoriert Häkchen und Großschreibung", () => {
    expect(normalize("Kaže")).toBe(normalize("kaze"));
    expect(normalize("Đak")).toBe("djak");
    expect(normalize("Straße")).toBe("strasse");
  });
});

describe("findRelevantWords", () => {
  const des = (question: string) => findRelevantWords(question, LESSONS).map((word) => word.de);

  it("findet Wörter über die serbische Übersetzung, auch gebeugt", () => {
    expect(des("kako se kaze toalet")).toContain("die Toilette");
    expect(des("hocu da kupim kartu za autobus")).toContain("der Bus");
  });

  it("versteht Abkürzungen wie VC und ignoriert Fragewörter", () => {
    expect(des("moram u vc")).toContain("die Toilette");
    expect(des("moram u vc")).not.toContain("der Abend");
    expect(des("sta da kazem kod lekara")[0]).toBe("der Arzt");
  });

  it("findet Wörter auch über das deutsche Wort", () => {
    expect(des("sta znaci Wasser")).toContain("das Wasser");
  });

  it("liefert höchstens 12 Wörter und nichts bei leerer Frage", () => {
    expect(findRelevantWords("a b", LESSONS)).toEqual([]);
    expect(
      findRelevantWords("kako da kazem da moram da idem kod lekara sutra ujutru", LESSONS).length,
    ).toBeLessThanOrEqual(12);
  });
});

describe("buildTutorPrompt", () => {
  it("enthält die geprüften Wörter mit Übersetzung und Aussprache", () => {
    const toilet = LESSONS.flatMap((lesson) => lesson.words).find(
      (word) => word.de === "die Toilette",
    );
    const prompt = buildTutorPrompt(toilet ? [toilet] : []);
    expect(prompt).toContain("die Toilette = toalet");
    expect(prompt).toContain("NIKADA ćirilicom");
  });
});
