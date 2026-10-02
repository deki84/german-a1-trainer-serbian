let germanVoice: SpeechSynthesisVoice | null = null;
let pendingTimeout: number | undefined;

// Chrome-Fehler: Ohne Referenz räumt der Browser die Ausgabe zu früh weg,
// danach bleibt jedes weitere speak() stumm.
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Lokale Stimmen zuerst: zuverlässiger als Online-Stimmen
function findGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("de"));
  return voices.find((voice) => voice.localService) ?? voices[0] ?? null;
}

// Chrome lädt die Stimmen erst nach und nach
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    germanVoice = findGermanVoice();
  });
}

export function speakGerman(text: string, rate = 0.65): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  germanVoice ??= findGermanVoice();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = rate;
  if (germanVoice) utterance.voice = germanVoice;

  currentUtterance = utterance;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };

  // Noch wartenden Aufruf abbrechen, sonst sprechen beide
  window.clearTimeout(pendingTimeout);
  synth.cancel();
  synth.resume(); // Chrome hängt manchmal im Pause-Zustand

  // Chrome-Fehler: speak() direkt nach cancel() wird manchmal verschluckt
  pendingTimeout = window.setTimeout(() => synth.speak(utterance), 60);
}

export type SpeechPart = { text: string; lang: "de" | "sr" };

// Antwort für das Vorlesen vorbereiten: **deutsch** und serbisch trennen,
// Lautschrift in Klammern und Emojis weglassen (die sind nur zum Lesen da)
export function splitForSpeech(text: string): SpeechPart[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index): SpeechPart => ({
      lang: index % 2 === 1 ? "de" : "sr",
      text: part
        .replace(/\([^)]*\)/g, " ")
        .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, " ")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((part) => /\p{L}/u.test(part.text)); // nur Teile mit Buchstaben
}

// Viele Handys haben keine serbische Stimme, Kroatisch/Bosnisch klingen bei Latinica fast gleich
function findSerbianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const prefix of ["sr", "hr", "bs"]) {
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (voice) return voice;
  }
  return null;
}

// Alle Teile festhalten, sonst räumt Chrome sie zu früh weg (siehe currentUtterance)
let queue: SpeechSynthesisUtterance[] = [];

export function speakMixed(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  germanVoice ??= findGermanVoice();
  const serbianVoice = findSerbianVoice();

  queue = splitForSpeech(text).map((part) => {
    const utterance = new SpeechSynthesisUtterance(part.text);
    if (part.lang === "de") {
      utterance.lang = "de-DE";
      utterance.rate = 0.65;
      if (germanVoice) utterance.voice = germanVoice;
    } else {
      utterance.lang = serbianVoice?.lang ?? "sr-RS";
      utterance.rate = 0.95;
      if (serbianVoice) utterance.voice = serbianVoice;
    }
    return utterance;
  });

  window.clearTimeout(pendingTimeout);
  synth.cancel();
  synth.resume();
  pendingTimeout = window.setTimeout(
    () => queue.forEach((utterance) => synth.speak(utterance)),
    60,
  );
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.clearTimeout(pendingTimeout);
  window.speechSynthesis.cancel();
  queue = [];
}
