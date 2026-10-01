"use client";

import { useSrs } from "@/hooks/useSrs";

export function LessonBadge({ words }: { words: string[] }) {
  const srs = useSrs();
  const practiced = words.filter((word) => srs[word]).length;

  if (practiced === 0) return null;
  if (practiced === words.length) {
    return (
      <span className="ml-auto flex-none text-2xl" role="img" aria-label="urađeno">
        ✅
      </span>
    );
  }
  return (
    <span className="text-muted ml-auto flex-none text-sm">
      {practiced}/{words.length}
    </span>
  );
}