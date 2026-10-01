"use client";

import Link from "next/link";
import { useSrs } from "@/hooks/useSrs";

export type LessonSummary = {
  id: string;
  title: string;
  emoji: string;
  words: string[];
};

export function ContinueButton({ lessons }: { lessons: LessonSummary[] }) {
  const srs = useSrs();

  const next = lessons.find((lesson) => lesson.words.some((word) => !srs[word]));
  const started = lessons.some((lesson) => lesson.words.some((word) => srs[word]));

  if (!next) {
    return <p className="mt-8 text-center text-xl font-bold">Sve lekcije su urađene! 🎉</p>;
  }

  return (
    <Link
      href={`/lesson/${next.id}`}
      className="bg-river text-bg mt-8 flex min-h-20 items-center justify-center gap-3 rounded-2xl px-4 text-center text-xl font-bold md:text-2xl"
    >
      <span aria-hidden="true">▶️</span>
      {started ? "Nastavi" : "Počni"}: {next.emoji} {next.title}
    </Link>
  );
}