import type { Lesson, Word } from "./types";

// "Kaže" und "kaze", "Würfel" und "wurfel" sollen gleich zählen
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss");
}

const ARTICLES = /^(der|die|das) /;

// Fragewörter und Füllwörter sagen nichts über das gesuchte Wort
const STOPWORDS = new Set([
  "sta", "kako", "kaze", "kazem", "kazes", "kazati", "znaci", "koji", "koja", "koje", "gde",
  "kada", "zasto", "moze", "mogu", "hocu", "treba", "nemacki", "nemackom", "rec", "reci",
]);

// Häufige Abkürzungen und Umgangssprache
const ALIASES: Record<string, string> = { vc: "toalet", wc: "toalet" };

function wordsOf(text: string): string[] {
  return normalize(text).split(/[^\p{L}]+/u).filter((token) => token.length >= 3);
}

// Serbisch wird gebeugt: "kartu", "karte" → Stamm "kart"
function stem(token: string): string {
  return token.length > 4 ? token.slice(0, token.length - 1) : token;
}

// Einfaches Retrieval: passende geprüfte Wörter zur Frage finden
export function findRelevantWords(question: string, lessons: readonly Lesson[], limit = 12): Word[] {
  // Abkürzungen nur in der Frage ersetzen, nicht in den Daten
  const tokens = normalize(question)
    .split(/[^\p{L}]+/u)
    .map((token) => ALIASES[token] ?? token)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    .map(stem);
  if (tokens.length === 0) return [];

  const scored: { word: Word; score: number }[] = [];
  for (const lesson of lessons) {
    for (const word of lesson.words) {
      const candidates = [...wordsOf(word.sr), ...wordsOf(word.de.replace(ARTICLES, ""))];
      // Längere Treffer sind genauer: "lekar" zählt mehr als "kod"
      const score = tokens
        .filter((token) => candidates.some((candidate) => candidate.startsWith(token)))
        .reduce((sum, token) => sum + token.length, 0);
      if (score > 0) scored.push({ word, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.word);
}