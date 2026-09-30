import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";
import { LESSONS, getLesson } from "@/data/lessons";

/**
 * In Next.js 15+ ist params ein Promise und muss mit await gelesen werden.
 */
type LessonPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Sagt Next.js beim Build, welche Lektionsseiten es gibt.
 * Jede wird vorab als fertiges HTML erzeugt, das lädt am Handy blitzschnell.
 */
export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ id: lesson.id }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = getLesson(id);

  // Unbekannte ID in der URL → 404-Seite statt Absturz
  if (!lesson) notFound();

  const firstWord = lesson.words[0];

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-6 md:max-w-2xl">
      <Link
        href="/"
        className="border-line inline-flex h-12 items-center gap-2 rounded-full border-2 px-4 font-bold"
      >
        <span aria-hidden="true">⬅</span> Nazad
      </Link>

      <h1 className="mt-6 text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">{lesson.emoji}</span> {lesson.title}
      </h1>
      <p className="text-muted mt-1">{lesson.subtitle}</p>

      <LessonPlayer lesson={lesson} nextLesson={getLesson(lesson.id)} />
    </main>
  );
}
