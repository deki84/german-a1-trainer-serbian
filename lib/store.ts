export type Store<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (onChange: () => void) => () => void;
  getServer: () => T;
};

// Ein Wert in localStorage, passend für useSyncExternalStore (siehe hooks/useStore.ts)
export function createStore<T>(key: string, parse: (raw: string | null) => T): Store<T> {
  const changeEvent = `store-change:${key}`;
  const fallback = parse(null);
  let cachedRaw: string | null | undefined;
  let cached: T = fallback;

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return {
    // Bei unveränderten Daten dasselbe Objekt liefern, sonst rendert React endlos neu
    get() {
      const raw = readRaw();
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cached = parse(raw);
      }
      return cached;
    },
    set(value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Speichern fehlgeschlagen: App läuft trotzdem weiter
      }
      window.dispatchEvent(new Event(changeEvent));
    },
    subscribe(onChange) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) onChange(); // Änderung aus einem anderen Tab
      };
      window.addEventListener(changeEvent, onChange);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(changeEvent, onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    getServer: () => fallback,
  };
}
