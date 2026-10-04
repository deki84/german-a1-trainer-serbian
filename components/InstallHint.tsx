"use client";

import { useSyncExternalStore } from "react";
import { useStore } from "@/hooks/useStore";
import { isIosDevice } from "@/lib/pwa";
import { createStore } from "@/lib/store";

const dismissedStore = createStore("nemacki-install-hint-v1", (raw) => raw === "true");
const noopSubscribe = () => () => {};

// Nur auf dem iPhone im Browser: Hinweis, wie man die App auf den Startbildschirm legt
function needsHint(): boolean {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isIosDevice(navigator.userAgent, navigator.maxTouchPoints) && !standalone;
}

export function InstallHint() {
  // Auf dem Server false, im Browser die echte Prüfung (kein Hydration-Fehler)
  const show = useSyncExternalStore(noopSubscribe, needsHint, () => false);
  const dismissed = useStore(dismissedStore);

  if (!show || dismissed) return null;

  return (
    <section className="border-mustard bg-mustard-soft mt-6 rounded-3xl border-2 p-6">
      <p className="text-xl font-bold">Stavi aplikaciju na početni ekran 📲</p>
      <ol className="mt-3 list-decimal space-y-1 pl-6 text-lg">
        <li>Pritisni dugme „Podeli“ (kvadrat sa strelicom) dole u Safariju.</li>
        <li>Izaberi „Dodaj na početni ekran“.</li>
      </ol>
      <p className="mt-3">Uradi to pre nego što počneš da učiš, da napredak ostane u aplikaciji.</p>
      <button
        type="button"
        onClick={() => dismissedStore.set(true)}
        className="border-mustard bg-bg mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border-2 font-bold"
      >
        Razumem
      </button>
    </section>
  );
}
