// Whisper erfindet bei Stille, Rauschen oder unklarem Ton gern Sätze aus Untertiteln
// ("Hvala što pratite", "Titlovi: …"). Diese Prüfung fängt das ab, bevor der Text
// als Frage an den KI-Lehrer geschickt wird.

export type WhisperSegment = {
  no_speech_prob?: number;
  avg_logprob?: number;
};

// Typische erfundene Sätze (kleingeschrieben, ohne Satzzeichen vergleichen)
const HALLUCINATIONS = [
  "hvala što pratite",
  "hvala na pažnji",
  "hvala na gledanju",
  "hvala što gledate",
  "hvala vam što ste gledali",
  "titlovi",
  "prevod",
  "amara.org",
  "pretplatite se",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?…"'„“]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** true, wenn der erkannte Text sehr wahrscheinlich keine echte Sprache war */
export function isLikelyHallucination(text: string, segments: WhisperSegment[] = []): boolean {
  const clean = normalize(text);
  if (clean.length === 0) return true;
  if (HALLUCINATIONS.some((phrase) => clean.includes(phrase))) return true;

  // Whisper meldet selbst, wie sicher es ist, dass da gar keine Sprache war
  if (segments.length > 0) {
    const allUnsure = segments.every(
      (s) => (s.no_speech_prob ?? 0) > 0.6 && (s.avg_logprob ?? 0) < -1,
    );
    if (allUnsure) return true;
  }
  return false;
}
