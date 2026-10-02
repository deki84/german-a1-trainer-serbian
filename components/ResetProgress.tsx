"use client";

import { resetProgress } from "@/lib/progressStorage";

export function ResetProgress() {
  function handleClick() {
    const confirmed = window.confirm(
      "Da li si siguran? Sav napredak će biti obrisan i počinješ ispočetka.",
    );
    if (confirmed) resetProgress();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Obriši napredak"
      title="Obriši napredak"
      className="hover:bg-gentle-soft -mt-2 -mr-2 flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-full text-xl opacity-60 hover:opacity-100"
    >
      <span aria-hidden="true">🗑️</span>
    </button>
  );
}
