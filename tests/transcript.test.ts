import { describe, expect, it } from "vitest";
import { isLikelyHallucination } from "@/lib/transcript";

describe("isLikelyHallucination", () => {
  it("erkennt den typischen Untertitel-Satz", () => {
    expect(isLikelyHallucination("Hvala što pratite.")).toBe(true);
  });

  it("erkennt leeren Text", () => {
    expect(isLikelyHallucination("   ")).toBe(true);
  });

  it("lässt eine echte Frage durch", () => {
    expect(isLikelyHallucination("Kako da se predstavim?")).toBe(false);
  });

  it("verwirft Text, bei dem Whisper selbst unsicher ist", () => {
    expect(isLikelyHallucination("Nešto", [{ no_speech_prob: 0.9, avg_logprob: -1.5 }])).toBe(true);
  });

  it("behält Text bei sicherer Erkennung", () => {
    expect(
      isLikelyHallucination("Kako se kaže hvala?", [{ no_speech_prob: 0.05, avg_logprob: -0.3 }]),
    ).toBe(false);
  });
});
