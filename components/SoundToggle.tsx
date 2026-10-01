"use client";

import { useAutoplay } from "@/hooks/useAutoplay";
import { setAutoplay } from "@/lib/settings";

export function SoundToggle() {
  const autoplay = useAutoplay();

  return (
    <button
      type="button"
      onClick={() => setAutoplay(!autoplay)}
      aria-pressed={autoplay}
      className="border-line bg-surface inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-bold"
    >
      <span aria-hidden="true">{autoplay ? "🔊" : "🔇"}</span>
      {autoplay ? "Zvuk: uključen" : "Zvuk: isključen"}
    </button>
  );
}