// Serbisch-kyrillisch (und russische Sonderzeichen) → Latinica. Jedes Zeichen einzeln,
// deshalb funktioniert es auch beim Streaming mitten in einem Wort.
const MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ђ: "đ",
  е: "e",
  ж: "ž",
  з: "z",
  и: "i",
  ј: "j",
  к: "k",
  л: "l",
  љ: "lj",
  м: "m",
  н: "n",
  њ: "nj",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ћ: "ć",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "č",
  џ: "dž",
  ш: "š",
  й: "j",
  я: "ja",
  ю: "ju",
  ё: "jo",
  э: "e",
  ы: "i",
  щ: "šč",
  ь: "",
  ъ: "",
};

export function toLatin(text: string): string {
  let result = "";
  for (const char of text) {
    const lower = char.toLowerCase();
    const latin = MAP[lower];
    if (latin === undefined) {
      result += char;
    } else if (char === lower) {
      result += latin;
    } else {
      // Großbuchstabe: Љ → Lj, Ш → Š
      result += latin.charAt(0).toUpperCase() + latin.slice(1);
    }
  }
  return result;
}
