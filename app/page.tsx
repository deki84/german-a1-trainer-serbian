import Link from "next/link";
import { LESSONS, SECTIONS, TOTAL_WORDS, getLessonsBySection } from "@/data/lessons";

/**
 * Startseite (Server Component).
 * Zeigt alle Rubriken mit ihren Lektionen, direkt aus data/lessons.ts.
 */
export default function HomePage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-10 md:max-w-3xl lg:max-w-5xl">
      <header className="text-center">
        <span className="text-6xl md:text-7xl" aria-hidden="true">
          👋
        </span>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">Zdravo!</h1>
        <p className="text-muted mt-2 text-lg md:text-xl">
          Zajedno učimo nemački. Jedna reč, pa jedno pitanje. Polako. 🙂
        </p>
        <p className="text-muted mt-1">
          {LESSONS.length} lekcija · {TOTAL_WORDS} reči
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.id} className="mt-10" aria-labelledby={`section-${section.id}`}>
          <h2 id={`section-${section.id}`} className="text-xl font-bold md:text-2xl">
            <span aria-hidden="true">{section.emoji}</span> {section.title}
          </h2>

          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {getLessonsBySection(section.id).map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/lesson/${lesson.id}`}
                  className="border-line bg-surface hover:border-river flex items-center gap-4 rounded-2xl border-2 p-4 transition-colors"
                >
                  <span className="w-12 flex-none text-center text-4xl" aria-hidden="true">
                    {lesson.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{lesson.title}</p>
                    <p className="text-muted truncate">
                      {lesson.subtitle} · {lesson.words.length} reči
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
