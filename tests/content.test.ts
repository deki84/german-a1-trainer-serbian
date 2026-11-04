import { afterEach, describe, expect, it, vi } from "vitest";
import { A2_LESSONS } from "@/data/a2/lessons";
import { A2_SENTENCES } from "@/data/a2/sentences";
import { LESSONS } from "@/data/lessons";
import { SENTENCES } from "@/data/sentences";

// Der Schalter wird beim Laden des Moduls gelesen, deshalb jedes Mal frisch importieren
async function loadContent(flag: string | undefined, b1Flag?: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ENABLE_A2", flag ?? "");
  vi.stubEnv("NEXT_PUBLIC_ENABLE_B1", b1Flag ?? "");
  return import("@/data/content");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Niveaus ohne Schalter (Standard)", () => {
  it("die App zeigt nur A1", async () => {
    const content = await loadContent(undefined);
    expect(content.A2_ENABLED).toBe(false);
    expect(content.VISIBLE_LESSONS).toEqual(LESSONS);
    expect(content.VISIBLE_SENTENCES).toEqual(SENTENCES);
    expect(content.lessonsOf("a2")).toEqual([]);
  });

  it("A2-Lektionen sind nicht abrufbar", async () => {
    const content = await loadContent(undefined);
    expect(content.getVisibleLesson(A2_LESSONS[0].id)).toBeUndefined();
    const last = LESSONS[LESSONS.length - 1];
    expect(content.getNextVisibleLesson(last.id)).toBeUndefined();
  });

  it("nur der Wert 'true' schaltet A2 ein", async () => {
    const content = await loadContent("1");
    expect(content.A2_ENABLED).toBe(false);
  });
});

describe("Niveaus mit eingeschaltetem Schalter", () => {
  it("A2 folgt nach A1, A1 bleibt unverändert vorn", async () => {
    const content = await loadContent("true");
    expect(content.A2_ENABLED).toBe(true);
    expect(content.VISIBLE_LESSONS).toHaveLength(LESSONS.length + A2_LESSONS.length);
    expect(content.VISIBLE_LESSONS.slice(0, LESSONS.length)).toEqual(LESSONS);
    expect(content.VISIBLE_SENTENCES).toHaveLength(SENTENCES.length + A2_SENTENCES.length);
  });

  it("nach der letzten A1-Lektion kommt die erste A2-Lektion", async () => {
    const content = await loadContent("true");
    const last = LESSONS[LESSONS.length - 1];
    expect(content.getNextVisibleLesson(last.id)?.id).toBe(A2_LESSONS[0].id);
    expect(content.getNextVisibleLesson(A2_LESSONS[A2_LESSONS.length - 1].id)).toBeUndefined();
  });

  it("A2-Lektionen sind abrufbar, und alle IDs und Wörter bleiben eindeutig", async () => {
    const content = await loadContent("true");
    expect(content.getVisibleLesson(A2_LESSONS[0].id)?.id).toBe(A2_LESSONS[0].id);
    const ids = content.VISIBLE_LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    const words = content.VISIBLE_LESSONS.flatMap((lesson) => lesson.words.map((word) => word.de));
    expect(new Set(words).size).toBe(words.length);
  });

  it("Rubriken werden pro Niveau getrennt", async () => {
    const content = await loadContent("true");
    const a1Ids = new Set(content.lessonsBySection("posao", "a1").map((lesson) => lesson.id));
    const a2Ids = content.lessonsBySection("posao", "a2").map((lesson) => lesson.id);
    expect(a2Ids.length).toBeGreaterThan(0);
    for (const id of a2Ids) expect(a1Ids.has(id)).toBe(false);
  });
});

describe("B1 hat einen eigenen Schalter", () => {
  it("ohne Schalter ist B1 aus, auch wenn A2 an ist", async () => {
    const content = await loadContent("true");
    expect(content.B1_ENABLED).toBe(false);
    expect(content.ENABLED_LEVELS).toEqual(["a1", "a2"]);
    expect(content.lessonsOf("b1")).toEqual([]);
  });

  it("nur der Wert 'true' schaltet B1 ein", async () => {
    expect((await loadContent(undefined, "1")).B1_ENABLED).toBe(false);
    const content = await loadContent("true", "true");
    expect(content.B1_ENABLED).toBe(true);
    expect(content.ENABLED_LEVELS).toEqual(["a1", "a2", "b1"]);
  });

  it("Standard: nur A1", async () => {
    const content = await loadContent(undefined);
    expect(content.ENABLED_LEVELS).toEqual(["a1"]);
  });
});
