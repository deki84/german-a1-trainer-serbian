"use client";

import { useSrs } from "@/hooks/useSrs";
import { countProgress } from "@/lib/srs";

export function ProgressCard({ allWords }: { allWords: string[] }) {
  const srs = useSrs();
  const { practiced, known, total } = countProgress(srs, allWords);
  const percent = total === 0 ? 0 : Math.round((known / total) * 100);

  return (
    <section className="border-line bg-surface mt-6 rounded-3xl border-2 p-6 md:p-8">
      <p className="text-xl font-bold md:text-2xl">
        Naučio si {known} od {total} reči
      </p>
      <div
        className="bg-line mt-4 h-4 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Napredak"
      >
        {/* min-w: auch bei wenigen Prozent soll man etwas sehen */}
        <div
          className="bg-good h-full min-w-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-muted mt-3">
        {percent} % · {practiced} reči si već vežbao
      </p>
    </section>
  );
}
