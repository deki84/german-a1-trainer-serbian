import { buildQuestion, shuffle, type RandomFn } from "./quiz";
import type { AnswerOption, GapSentence, Question, QuestionMode, Word } from "./types";

export const BLANK = "___";

// Der ganze Satz mit eingesetzter Lösung
export function fillBlank(text: string, answer: string): string {
  return text.replace(BLANK, answer);
}

export function findSentence(
  word: string,
  sentences: readonly GapSentence[],
  random: RandomFn = Math.random,
): GapSentence | undefined {
  const matches = sentences.filter((sentence) => sentence.word === word);
  return matches[Math.floor(random() * matches.length)];
}

export function buildGapQuestion(
  word: Word,
  sentence: GapSentence,
  random: RandomFn = Math.random,
): Question {
  const [first, second] = shuffle<AnswerOption>(
    [
      { text: sentence.answer, lang: "de", correct: true },
      { text: sentence.wrong, lang: "de", correct: false },
    ],
    random,
  );

  return {
    mode: "gap",
    word,
    options: [first as AnswerOption, second as AnswerOption],
    sentence: { text: sentence.text, sr: sentence.sr, answer: sentence.answer },
  };
}

// Baut die Frage zum Fragetyp. Hat ein Wort noch keinen Satz, wird aus "gap" die Hörfrage.
export function buildAnyQuestion(
  word: Word,
  pool: readonly Word[],
  mode: QuestionMode,
  sentences: readonly GapSentence[],
  random: RandomFn = Math.random,
): Question {
  if (mode !== "gap") return buildQuestion(word, pool, mode, random);

  const sentence = findSentence(word.de, sentences, random);
  if (sentence) return buildGapQuestion(word, sentence, random);
  return buildQuestion(word, pool, "listen", random);
}
