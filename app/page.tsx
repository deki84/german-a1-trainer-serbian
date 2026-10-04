import { ProgressCard } from "@/components/ProgressCard";

import { TodayButton } from "@/components/TodayButton";
import { LESSONS } from "@/data/lessons";
import { InstallHint } from "@/components/InstallHint";

const allWords = LESSONS.flatMap((lesson) => lesson.words.map((word) => word.de));

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-6 py-8 md:max-w-2xl md:py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Zdravo! <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-muted mt-1 text-lg">Jedna reč, pa jedno pitanje.</p>
        </div>
      </header>

      <TodayButton allWords={allWords} />
      <ProgressCard allWords={allWords} />
      <InstallHint />
    </main>
  );
}
