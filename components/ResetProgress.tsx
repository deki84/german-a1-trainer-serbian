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
      className="text-muted min-h-12 cursor-pointer px-4 text-sm underline"
    >
      Obriši napredak
    </button>
  );
}
