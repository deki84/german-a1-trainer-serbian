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
