/**
 * Liest einen deutschen Text laut vor (Web Speech API).
 * Läuft komplett im Browser, keine Kosten, kein API-Key.
 *
 * Nur im Browser aufrufen, z. B. in einem onClick-Handler.
 */
export function speakGerman(text: string): void {
  // Schutz: auf dem Server oder in alten Browsern gibt es keine Sprachausgabe
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 0.8; // etwas langsamer für Anfänger

  // Wenn vorhanden, ausdrücklich eine deutsche Stimme wählen
  const germanVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith("de"));
  if (germanVoice) utterance.voice = germanVoice;

  // Laufende Ausgabe stoppen, damit sich bei schnellem Tippen nichts überlagert
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}