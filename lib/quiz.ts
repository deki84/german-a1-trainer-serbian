import type { AnswerOption, Question, QuestionMode, Word } from "./types";

export const PRAISE = ["Odlično! 🎉", "Bravo! 👏", "Super! ⭐", "Tačno! 💪", "Svaka čast! 🌟"];

// Als Parameter, damit Tests einen festen "Zufall" übergeben können
export type RandomFn = () => number;

// Fisher-Yates: mischt gleichmäßig, anders als sort(() => Math.random() - 0.5)
export function shuffle<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = temp;
  }
  return copy;
}

export function pickPraise(random: RandomFn = Math.random): string {
  return PRAISE[Math.floor(random() * PRAISE.length)] ?? "Bravo! 👏";
}

export function buildQuestion(
  word: Word,
  pool: readonly Word[],
  mode: QuestionMode,
  random: RandomFn = Math.random,
): Question {
  const candidates = pool.filter((candidate) => candidate.de !== word.de);
  const distractor = candidates[Math.floor(random() * candidates.length)];
  if (!distractor) {
    throw new Error(`Keine falsche Antwort für "${word.de}" gefunden.`);
  }

  const toOption = (w: Word, correct: boolean): AnswerOption =>
    mode === "translate"
      ? { text: w.de, lang: "de", correct }
      : { text: w.sr, lang: "sr", correct };

  const [first, second] = shuffle([toOption(word, true), toOption(distractor, false)], random);

  return { mode, word, options: [first as AnswerOption, second as AnswerOption] };
}
