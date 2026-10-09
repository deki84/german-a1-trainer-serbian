import { ListenButton } from "@/components/ListenButton";
import { SENTENCES } from "@/data/sentences";
import { exampleFor } from "@/lib/gap";
import type { Word } from "@/lib/types";

export function WordCard({ word }: { word: Word }) {
  // Beispielsatz (oder null, wenn es für das Wort keinen gibt)
  const example = exampleFor(word.de, SENTENCES);

  return (
    <article className="border-river bg-surface rounded-3xl border-b-8 px-5 py-8 text-center md:px-10 md:py-12">
      <div className="text-8xl leading-none md:text-9xl" aria-hidden="true">
        {word.emoji}
      </div>

      <h2 lang="de" className="mt-4 text-4xl font-bold wrap-anywhere hyphens-auto md:text-6xl">
        {word.de}
      </h2>

      <p className="text-river mt-2 text-xl italic md:text-2xl">
        <span aria-hidden="true">🗣️</span> {word.say}
      </p>

      <p lang="sr" className="border-line mt-5 border-t-2 border-dashed pt-5 text-2xl md:text-3xl">
        {word.sr}
      </p>

      <ListenButton text={word.de} />

      {/* Beispiel eingeklappt: Progressive Disclosure, kein Extra-Aufwand beim Erstkontakt */}
      {example && (
        <details className="border-line mt-6 border-t-2 border-dashed pt-3">
          <summary className="text-river flex min-h-12 cursor-pointer list-none items-center justify-center gap-2 text-lg font-bold [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true">▾</span> Primer
          </summary>
          <div className="pt-3">
            <p lang="de" className="text-xl font-bold wrap-anywhere md:text-2xl">
              {example.text}
            </p>
            <p lang="sr" className="text-muted mt-1 text-lg">
              {example.sr}
            </p>
            <ListenButton text={example.text} label="Slušaj rečenicu" compact />
          </div>
        </details>
      )}
    </article>
  );
}
