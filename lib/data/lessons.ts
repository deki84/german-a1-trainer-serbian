import type { Lesson } from "@/lib/types";

/**
 * Wortschatz der App, ausschließlich aus der Goethe-A1-Wortliste.
 * Reihenfolge = Lernreihenfolge: die einfachsten Themen zuerst.
 */
export const LESSONS: Lesson[] = [
  {
    id: "pozdravi",
    title: "Pozdravi",
    subtitle: "Zdravo i hvala",
    emoji: "👋",
    words: [
      { de: "Hallo", sr: "Zdravo", say: "halo", emoji: "👋" },
      { de: "Tschüss", sr: "Ćao (na rastanku)", say: "čis", emoji: "🙋" },
      { de: "Guten Morgen", sr: "Dobro jutro", say: "guten morgen", emoji: "🌅" },
      { de: "Auf Wiedersehen", sr: "Doviđenja", say: "auf vider-zejen", emoji: "🚪" },
      { de: "danke", sr: "hvala", say: "danke", emoji: "🙏" },
      { de: "bitte", sr: "molim", say: "bite", emoji: "🤲" },
      { de: "ja", sr: "da", say: "ja", emoji: "✅" },
      { de: "nein", sr: "ne", say: "najn", emoji: "❌" },
    ],
  },
  {
    id: "brojevi",
    title: "Brojevi",
    subtitle: "Od 1 do 10",
    emoji: "🔢",
    words: [
      { de: "eins", sr: "jedan (1)", say: "ajns", emoji: "1️⃣" },
      { de: "zwei", sr: "dva (2)", say: "cvaj", emoji: "2️⃣" },
      { de: "drei", sr: "tri (3)", say: "draj", emoji: "3️⃣" },
      { de: "vier", sr: "četiri (4)", say: "fir", emoji: "4️⃣" },
      { de: "fünf", sr: "pet (5)", say: "finf", emoji: "5️⃣" },
      { de: "sechs", sr: "šest (6)", say: "zeks", emoji: "6️⃣" },
      { de: "sieben", sr: "sedam (7)", say: "ziben", emoji: "7️⃣" },
      { de: "acht", sr: "osam (8)", say: "aht", emoji: "8️⃣" },
      { de: "neun", sr: "devet (9)", say: "nojn", emoji: "9️⃣" },
      { de: "zehn", sr: "deset (10)", say: "cejn", emoji: "🔟" },
    ],
  },
  {
    id: "porodica",
    title: "Porodica",
    subtitle: "Mama, tata, deca",
    emoji: "👨‍👩‍👧",
    words: [
      { de: "die Familie", sr: "porodica", say: "di familije", emoji: "👨‍👩‍👧‍👦" },
      { de: "die Mutter", sr: "majka", say: "di muter", emoji: "👩" },
      { de: "der Vater", sr: "otac", say: "der fater", emoji: "👨" },
      { de: "das Kind", sr: "dete", say: "das kind", emoji: "🧒" },
      { de: "der Sohn", sr: "sin", say: "der zon", emoji: "👦" },
      { de: "die Tochter", sr: "ćerka", say: "di tohter", emoji: "👧" },
      { de: "der Bruder", sr: "brat", say: "der bruder", emoji: "🧑" },
      { de: "die Schwester", sr: "sestra", say: "di švester", emoji: "👩‍🦰" },
    ],
  },
];

/**
 * Findet eine Lektion anhand ihrer ID.
 * Gibt undefined zurück, wenn es keine Lektion mit dieser ID gibt
 * (z. B. bei einem Tippfehler in der URL).
 */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

/**
 * Liefert die Lektion, die nach der angegebenen kommt.
 * Gibt undefined zurück bei der letzten Lektion oder einer unbekannten ID.
 */
export function getNextLesson(id: string): Lesson | undefined {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1) return undefined;
  return LESSONS[index + 1];
}