"use client";

import { speakGerman } from "@/lib/speech";

type ListenButtonProps = {
  text: string;
  label?: string;
  /** Weniger Abstand nach oben, z. B. in einem Kasten */
  compact?: boolean;
};

export function ListenButton({ text, label = "Slušaj", compact = false }: ListenButtonProps) {
  return (
    <button
      type="button"
      onClick={() => speakGerman(text)}
      className={`bg-river-soft focus-visible:outline-river inline-flex h-14 cursor-pointer items-center gap-3 rounded-full px-6 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${
        compact ? "mt-3" : "mt-6"
      }`}
    >
      <span className="text-2xl" aria-hidden="true">
        🔊
      </span>
      {label}
    </button>
  );
}
