import { ProgressCard } from "@/components/ProgressCard";
import { TodayButton } from "@/components/TodayButton";
import { LESSONS } from "@/data/lessons";
import { ResetProgress } from "@/components/ResetProgress";

// Nur die deutschen Wörter an den Browser geben, nicht die ganze Wortliste
const allWords = LESSONS.flatMap((lesson) => lesson.words.map((word) => word.de));

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl">
      <header className="text-center">
        <span className="text-6xl md:text-7xl" aria-hidden="true">
          👋
        </span>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">Zdravo!</h1>
        <p className="text-muted mt-2 text-lg md:text-xl">
          Zajedno učimo nemački. Jedna reč, pa jedno pitanje. Polako. 🙂
        </p>
      </header>

      <TodayButton allWords={allWords} />
      <ProgressCard allWords={allWords} />
      <div className="mt-12 text-center">
        <ResetProgress />
      </div>
    </main>
  );
}
