/**
 * Zentrale Typen der App.
 * Jede Komponente und jede Funktion nutzt diese Typen,
 * dadurch bleiben Daten und Oberfläche überall konsistent.
 */

/** Ein einzelnes Wort aus der Goethe-A1-Wortliste. */
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

/** Eine Rubrik auf der Startseite, z. B. "Hrana i piće" */
export type Section = {
  id: string;
  title: string;
  emoji: string;
};

/** Eine Lektion ist ein Päckchen von ca. 8 Wörtern innerhalb einer Rubrik. */
export type Lesson = {
  /** ID der Rubrik, zu der die Lektion gehört (siehe SECTIONS) */
  section: string;
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
