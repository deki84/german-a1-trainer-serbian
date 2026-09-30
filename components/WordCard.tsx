import type { Word } from "@/lib/types";
import { ListenButton } from "@/components/ListenButton";

type WordCardProps = {
  word: Word;
};

/**
 * Zeigt genau EIN Wort: Emoji → Deutsch → Lautschrift → Serbisch.
 * Die Reihenfolge folgt dem Lernweg: erst Bild, dann Wort, dann Bedeutung.
 */
export function WordCard({ word }: WordCardProps) {
  return (
    <article className="border-river bg-surface rounded-3xl border-b-8 px-5 py-8 text-center md:px-10 md:py-12">
      <div className="text-8xl leading-none md:text-9xl" aria-hidden="true">
        {word.emoji}
      </div>

      <h2 lang="de" className="mt-4 text-4xl font-bold hyphens-auto md:text-6xl">
        {word.de}
      </h2>

      <p className="text-river mt-2 text-xl italic md:text-2xl">
        <span aria-hidden="true">🗣️</span> {word.say}
      </p>

      <p lang="sr" className="border-line mt-5 border-t-2 border-dashed pt-5 text-2xl md:text-3xl">
        {word.sr}
      </p>
      <ListenButton text={word.de} />
    </article>
  );
}
