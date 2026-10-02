import { dateKey, reviewCard, type CardState, type SrsState } from "./srs";

const STORAGE_KEY = "nemacki-srs-v1";
const CHANGE_EVENT = "srs-change";
const EMPTY: SrsState = {};

function isCardState(value: unknown): value is CardState {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CardState).box === "number" &&
    typeof (value as CardState).due === "string"
  );
}

// Gespeicherte Daten können kaputt oder veraltet sein: nur gültige Einträge übernehmen
export function parseSrs(raw: string | null): SrsState {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return {};

    const state: SrsState = {};
    for (const [word, card] of Object.entries(data)) {
      if (isCardState(card)) state[word] = { box: card.box, due: card.due };
    }
    return state;
  } catch {
    return {};
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // z. B. privater Modus
  }
}

export function saveAnswer(word: string, correct: boolean): void {
  const state = parseSrs(readRaw());
  state[word] = reviewCard(state[word], correct, dateKey());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Speichern fehlgeschlagen: Lernen geht trotzdem weiter
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// --- Für useSyncExternalStore (siehe hooks/useSrs.ts) ---

let cachedRaw: string | null | undefined;
let cachedState: SrsState = EMPTY;

// Muss bei unveränderten Daten dasselbe Objekt liefern, sonst rendert React endlos neu
export function getSrsSnapshot(): SrsState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseSrs(raw);
  }
  return cachedState;
}

// Auf dem Server gibt es kein localStorage
export function getSrsServerSnapshot(): SrsState {
  return EMPTY;
}

export function subscribeSrs(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // Änderungen aus anderen Tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function clearSrs(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nichts zu tun
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
