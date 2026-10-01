const AUTOPLAY_KEY = "nemacki-autoplay-v1";
const CHANGE_EVENT = "settings-change";

export function getAutoplay(): boolean {
  try {
    return window.localStorage.getItem(AUTOPLAY_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setAutoplay(on: boolean): void {
  try {
    window.localStorage.setItem(AUTOPLAY_KEY, on ? "on" : "off");
  } catch {
    // ohne Speicher gilt die Einstellung nur bis zum Neuladen nicht
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeSettings(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}