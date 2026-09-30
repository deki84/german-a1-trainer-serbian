
export type Word = {
  /** Deutsches Wort, Nomen immer mit Artikel, z. B. "das Wasser" */
  de: string;
  /** Serbische Übersetzung in Latinica, z. B. "voda" */
  sr: string;
  /** Aussprachehilfe mit serbischen Buchstaben, z. B. "das vaser" */
  say: string;
  /** Emoji als Bildhilfe, z. B. "💧" */
  emoji: string;
};

/** Eine Lektion ist ein Thema mit mehreren Wörtern. */
export type Lesson = {
  /** Kurze, URL-taugliche ID, z. B. "pozdravi" → /lesson/pozdravi */
  id: string;
  /** Titel auf Serbisch, z. B. "Pozdravi" */
  title: string;
  /** Kurze Beschreibung auf Serbisch, z. B. "Zdravo i hvala" */
  subtitle: string;
  /** Emoji für die Lektionsliste */
  emoji: string;
  words: Word[];
};