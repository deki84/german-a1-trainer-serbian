# german-a1-trainer-serbian

Eine mobile Lern-App, mit der Serbisch sprechende Menschen **ohne Vorkenntnisse**
Deutsch auf Niveau A1 lernen, auch wenn sie nur wenig lesen und schreiben können.
Mit Audio, großen A/B-Fragen, Tagesziel und einem KI-Lehrer, der auf Serbisch erklärt.

**Kernidee:** Ein Wort sehen und hören → eine einfache Frage mit zwei Antworten
beantworten → Lob oder sanfte Korrektur → nächstes Wort. Offene Fragen stellt
der Lernende per Text oder Sprache an einen KI-Lehrer, der nur mit einfachen
Wörtern und immer mit Aussprachehilfe antwortet.

Für Nutzer heißt die App **„Nemački korak po korak“** („Deutsch Schritt für Schritt“).

Gelernt wird in einem **täglichen Training von 15–30 Minuten**, das nach den Ergebnissen
der Lernforschung aufgebaut ist: erst fällige Wörter wiederholen, dann wenige neue lernen,
alles mit Abfragen statt bloßem Anschauen (siehe [Lernmethode](#lernmethode)).

> **Status:** 🚧 Im Aufbau, wird von Grund auf neu entwickelt (siehe [Roadmap](#roadmap)).

## Warum dieses Projekt?

Die meisten Sprach-Apps setzen stillschweigend voraus, dass man sicher lesen kann,
und erklären auf Englisch. Für viele Menschen, die nach Deutschland kommen, passt
das nicht. Diese App ist für jemanden gebaut, der:

- **Serbisch** spricht und versteht,
- bei **Deutsch bei null** anfängt,
- **wenig liest und schreibt** (Alpha-/Basisbildungs-Niveau),
- hauptsächlich das **Handy** benutzt.

A1 Trainer (Deutsch – Serbisch): Eine Web-App zum Erlernen des grundlegenden A1-Wortschatzes für Deutschlerner mit serbischer Muttersprache. Inklusive KI-gestütztem Tutor für Grammatik und Beispielsätze.

## Architektur

```
Lernender (Handy)
│
▼
Next.js Frontend
│
├── Lernmodus (läuft komplett im Browser)
│     │
│     ├── Wortdaten (data/)          → verifizierte A1-Wortliste
│     ├── Quiz-Logik (lib/quiz.ts)   → A/B-Fragen, Sterne
│     ├── Web Speech API             → deutsches Wort vorlesen
│     └── localStorage               → Fortschritt, Lernzeit, Tagesziel
│
└── KI-Lehrer
      │ POST /api/chat
      ▼
      Next.js API Route
      │  • Eingabe validieren, Verlauf kürzen, Rate-Limit
      │  • System-Prompt + A1-Wortliste als Kontext
      ▼
      LLM-Aufruf (Groq, openai/gpt-oss-120b), Streaming
      │
      ▼
      Antwort Wort für Wort zurück an den Browser
      │  deutsche Wörter **fett** → antippbar zum Vorlesen
```

## Zentrale Design-Entscheidungen

### 1. Das Lernen selbst ist deterministisch, die KI ist nur Ergänzung

Wortkarten, Übersetzungen, Lautschrift und Quizfragen kommen **nie** aus dem LLM,
sondern aus einer geprüften Datenquelle. Ein Lernender, der die Antworten nicht
selbst kontrollieren kann, darf keine halluzinierte Übersetzung auswendig lernen.
Die KI beantwortet nur **zusätzliche, offene Fragen** („Wie sage ich das beim Arzt?“).

### 2. Alpha-first statt Text-first

- **Ein einziges Wort pro Schritt**, nie mehrere neue Dinge auf einmal
- **Emoji + Audio** tragen die Bedeutung, Text ist nur Unterstützung
- **Antwort A und B haben verschiedene Farben**, damit man sie ohne Lesen unterscheidet
- **Große Touch-Flächen** (≥ 48 px) in der Daumenzone, gut lesbare Schrift
- **Spracheingabe** im Chat, weil Schreiben für die Zielgruppe die größte Hürde ist

### 3. KI nur serverseitig und modellunabhängig

- Der API-Key existiert **nur** in der API-Route, nie im Browser (kein `NEXT_PUBLIC_`)
- Das Modell wird über `LLM_MODEL` gewählt, nicht im Code festgelegt.
  Groq tauscht Modelle regelmäßig aus (z. B. wurden alle Llama-Modelle für
  Free/Developer-Accounts 2026 abgeschaltet). Ein Modellwechsel ist so nur
  eine Konfigurationsänderung
- `temperature` bewusst niedrig (0.3) für konsistente, sachliche Erklärungen

### 4. Leitplanken für den KI-Lehrer

- Antworten **auf einfachem Serbisch (Latinica)**, maximal 4–5 kurze Sätze
- Jede deutsche Wortform **fett** plus Lautschrift und Emoji, z. B. **Tschüss** (čis) 👋
- Die komplette A1-Wortliste steht im System-Prompt: Das Modell soll bevorzugt
  diese Wörter verwenden und schwerere als „reč za kasnije“ markieren
- Themen: Deutsch und Alltag in Deutschland; bei Recht, Medizin, Geld nur
  einfache Hinweise plus Empfehlung, Fachleute zu fragen

## Lernmethode

Die App setzt die Lerntechniken um, die in der Forschung am besten belegt sind.
Sie sind bewusst einfach gehalten, damit sie auch für Lernende mit geringer
Lesekompetenz funktionieren.

### Was die Forschung sagt

| Befund                                                                                                                                                                                               | Quelle                                                                        | Umsetzung in der App                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Abfragen schlägt Wiederlesen.** Sich aktiv erinnern (Retrieval Practice) und verteiltes Üben sind die zwei wirksamsten Lerntechniken, altersunabhängig und für viele Lernstoffe.                   | Dunlosky et al. (2013), _Psychological Science in the Public Interest_        | Jedes neue Wort wird sofort abgefragt, nicht nur gezeigt.                                   |
| **Rückmeldung verstärkt das Abfragen.** Ohne Korrektur bringt Abfragen kaum Vorteile gegenüber Wiederlesen, mit Korrektur deutlich.                                                                  | Studien zu Retrieval Practice mit Feedback im Fremdsprachenlernen             | Nach jeder Antwort: Lob oder sanfte Korrektur mit der richtigen Antwort und Audio.          |
| **Verteilen schlägt Pauken.** Wiederholungen mit Abstand führen beim Fremdsprachenlernen zu deutlich besserem Behalten als alles an einem Tag.                                                       | Kim & Webb (2022), Meta-Analyse, _Language Learning_; Cepeda et al. (2006)    | Tägliche kurze Einheiten statt langer Sitzungen, Wiederholung nach festen Abständen.        |
| **Wachsende Abstände helfen leicht.** Immer größere Abstände zwischen Wiederholungen sind etwas besser als gleich bleibende. Der ideale Abstand wächst mit der Zeit, die man sich etwas merken will. | Nakata (2015), _Studies in Second Language Acquisition_; Cepeda et al. (2006) | Leitner-System mit Abständen von 1, 2, 4, 8, 16 und 32 Tagen.                               |
| **Abstand wichtiger als Paketgröße.** Ob man in Päckchen von 4 oder 20 Wörtern lernt, macht wenig aus; die Abstände zwischen den Wiederholungen machen viel aus.                                     | Nakata & Webb (2016), _Studies in Second Language Acquisition_                | Kleine Lektionen (ca. 8 Wörter) zur Übersicht, entscheidend ist aber der Wiederholungsplan. |
| **Wiedererkennen vor aktivem Erinnern.** Auswahlfragen sind der leichtere Einstieg; aktives Abrufen baut stärkeres, produktives Wissen auf.                                                          | Forschung zu Abfrageformaten beim Vokabellernen                               | Schwierigkeit steigt pro Wort: Bedeutung erkennen → Wort erkennen → nur hören → Lückentext. |
| **Lückentexte allein sind schwach.** In einer Meta-Analyse zu Vokabelübungen zeigten Lückentexte nur kleine, unsichere Effekte, Karteikarten deutlich größere.                                       | Webb et al. (2020), Meta-Analyse, _The Modern Language Journal_               | Lückentext nur als späte Stufe für Wörter, die schon sitzen.                                |
| **Bei geringer Lesekompetenz: erst mündlich.** Lesen und Schreiben bauen auf mündlichen Fähigkeiten auf; die Erstsprache zur Erklärung hilft.                                                        | LESLLA-Forschung (Literacy Education and Second Language Learning for Adults) | Audio bei jedem Wort, Emojis, Erklärungen auf Serbisch, eine Stufe „nur hören“.             |

### Das tägliche Training (15–30 Minuten)

```
1. Wiederholen   (5–15 min)   Fällige Wörter aus allen Lektionen, gemischt
                              ↓
2. Neue Wörter   (5–10 min)   5–10 neue Wörter: Wortkarte → sofort abfragen
                              → am Ende der Einheit noch einmal abfragen
                              ↓
3. Abschluss                  Sterne, 🔥 Serie, "Vidimo se sutra!"
```

- **Wiederholen kommt zuerst.** Wenn viele Wörter fällig sind, gibt es an diesem Tag
  weniger neue. So wächst der Berg an Wiederholungen nie über den Kopf.
- **Neue Wörter pro Tag** hängen vom Tagesziel ab: 15 min → 5 neue, 20 min → 7 neue,
  30 min → 10 neue.
- **Gemischt statt nach Lektion:** Beim Wiederholen kommen Wörter aus verschiedenen
  Themen durcheinander. Das ist anstrengender, aber gerade deshalb wirksam.

### Das Leitner-System

Jedes Wort liegt in einer von sechs „Boxen“. Die Box bestimmt, wann es wiederkommt
und wie es abgefragt wird:

| Box | Wiederholung nach | Abfrage                                             |
| --- | ----------------- | --------------------------------------------------- |
| 1   | 1 Tag             | Wortkarte mit Bild und Audio → „Šta znači …?“ (A/B) |
| 2   | 2 Tagen           | „Kako se kaže …?“ (Serbisch → Deutsch, A/B)         |
| 3   | 4 Tagen           | Nur hören: Audio → Bedeutung wählen                 |
| 4   | 8 Tagen           | Lückentext im Satz                                  |
| 5   | 16 Tagen          | gemischt                                            |
| 6   | 32 Tagen          | gemischt, danach gilt das Wort als gelernt ✅       |

**Richtig** → eine Box weiter. **Falsch** → zurück in Box 1, mit sanfter Korrektur.

### Ehrliche Grenzen

- Die meisten Studien wurden mit Studierenden durchgeführt, die gut lesen können.
  Zu Lernenden mit geringer Lesekompetenz gibt es deutlich weniger Forschung.
- Die App trainiert **Wortschatz und Hörverstehen**. Für die Prüfung Start Deutsch 1
  braucht es zusätzlich Sprechen, einfache Sätze und Formulare. Das Goethe-Institut
  empfiehlt dafür selbst einen Sprachkurs. Die App ist eine Ergänzung, kein Ersatz.

## Setup

```bash
pnpm install
cp .env.example .env.local
# Groq API Key eintragen - kostenlos auf https://console.groq.com
pnpm run dev
```

Dann `http://localhost:3000` öffnen. Auf dem Handy im selben WLAN testen:

```bash
pnpm run dev -H 0.0.0.0    # dann http://<deine-IP>:3000 öffnen
```

### Umgebungsvariablen

| Variable       | Pflicht    | Beschreibung                                                                                                            |
| -------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GROQ_API_KEY` | ab Phase 7 | Key von console.groq.com. **Nie committen, nie `NEXT_PUBLIC_` davor!**                                                  |
| `LLM_MODEL`    | nein       | Modell-ID bei Groq, Standard `openai/gpt-oss-120b`. Aktive Modelle: [Groq Models](https://console.groq.com/docs/models) |

### Scripts

| Befehl               | Zweck                              |
| -------------------- | ---------------------------------- |
| `pnpm run dev`       | Entwicklungsserver                 |
| `pnpm run build`     | Produktions-Build                  |
| `pnpm run lint`      | ESLint                             |
| `pnpm run test`      | Vitest                             |
| `pnpm run typecheck` | TypeScript prüfen (`tsc --noEmit`) |

## Authentifizierung

Die App läuft öffentlich auf Vercel; ohne Schutz könnte jeder Besucher über den
KI-Lehrer das API-Kontingent verbrauchen. Deshalb:

- **Lernmodus** ist ohne Login nutzbar (alles läuft im Browser, keine Kosten)
- **KI-Lehrer** nur mit Login über Clerk (E-Mail/Passwort, Google)
- Zusätzlich ein einfaches **Rate-Limit** pro Nutzer in der API-Route

## Beispiel-Interaktionen

| Aktion                              | Was passiert                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Lektion „Pozdravi“ öffnen           | Wortkarte **Hallo** 👋 (halo) = Zdravo, wird automatisch vorgelesen    |
| Auf „Dalje“ tippen                  | A/B-Frage: „Šta znači ‚Hallo‘? A) Zdravo B) Hvala“                     |
| Falsche Antwort tippen              | Sanfte Korrektur „Skoro! 🙂“, richtige Antwort markiert, neuer Versuch |
| Lektion abschließen                 | Sterne, Wortübersicht, nächste Lektion vorgeschlagen                   |
| Chat: „Kako se kaže hvala?“         | KI antwortet mit **Danke** (danke) 🙏, Wort antippbar zum Anhören      |
| Chat: 🎤 „Šta da kažem kod lekara?“ | Spracheingabe auf Serbisch → einfache Sätze für den Arztbesuch         |
| Chat: „Ko je pobedio na utakmici?“  | Kurze Antwort, dann zurück zum Deutschlernen (Themen-Leitplanke)       |

## Projektstruktur

```
├── app/
│   ├── layout.tsx              # Schrift, Metadaten, Viewport
│   ├── page.tsx                # Startseite: 25 Rubriken zum Aufklappen, später Tagesziel und Chat
│   ├── today/page.tsx          # Tägliches Training (Wiederholen + neue Wörter)
│   ├── lesson/[id]/page.tsx    # Lektion (statisch generiert)
│   ├── chat/page.tsx           # KI-Lehrer
│   ├── api/chat/route.ts       # Orchestriert LLM-Aufruf + Streaming
│   └── manifest.ts             # PWA: "Zum Startbildschirm hinzufügen"
├── components/                 # WordCard, QuestionCard, LessonPlayer, ChatWindow, …
├── hooks/                      # useProgress, useStudyTimer, useSpeechInput, …
├── lib/
│   ├── quiz.ts                 # A/B-Fragen bauen, mischen, Sterne berechnen
│   ├── srs.ts                  # Leitner-System: Boxen, Fälligkeit, Tagesplan
│   ├── studyTime.ts            # Lernzeit, Serie, Schätzung bis A1
│   ├── speech.ts               # Vorlesen (Web Speech API)
│   ├── tutorPrompt.ts          # System-Prompt des KI-Lehrers
│   └── types.ts                # Word, Section, Lesson, …
├── data/                       # Wortschatz: 794 Wörter, 99 Lektionen, 25 Rubriken
├── tests/                      # Vitest
└── .env.example                # Zeigt benötigte Umgebungsvariablen
```

## Roadmap

Jede Phase endet mit etwas, das **funktioniert und deployed ist**.
Definition of Done: läuft am Handy, responsive (375 / 768 / 1280 px), hell und dunkel,
`lint` + `typecheck` + `test` grün, auf Vercel live.

- [x] **Phase 0: Setup:** `create-next-app`, Git, Prettier, Aufräumen, „Zdravo! 👋“ auf Vercel
- [x] **Phase 1: Datenmodell:** Typen, komplette Wortliste (794 Wörter, 25 Rubriken), Tests gegen Duplikate
- [x] **Phase 2: Wortkarte:** Lektionsseite, Rubriken zum Aufklappen, großes Wort, Emoji, Lautschrift, 🔊 Vorlesen
- [x] **Phase 3: Abfragen:** `shuffle` + `buildQuestion` mit Tests; drei Fragetypen: Bedeutung erkennen, Wort erkennen, nur hören; Lob und Korrektur
- [x] **Phase 4: Lektionsablauf:** State Machine `learn → quiz → finish`, Fortschrittspunkte, Sterne
- [x] **Phase 5: Leitner-System:** `lib/srs.ts` mit Tests (Boxen, Fälligkeit), Speichern in `localStorage` ohne Hydration-Fehler
- [x] **Phase 6: Tägliches Training:** `/today` mit Wiederholen + neuen Wörtern, Tagesziel 15min, 🔥 Serie
- [x] **Phase 7: KI-Lehrer:** Groq-Route mit Streaming, Chat-UI, antippbare Wörter, 🎤, Clerk
- [ ] **Phase 8: Lückentext & Feinschliff:** Beispielsätze, Lückentext als Box-4-Abfrage, PWA, Barrierefreiheits-Check, Test mit echtem Lernenden

## Nächste Ausbaustufen

Bewusst nicht im ersten Wurf, aber als konkrete nächste Schritte durchdacht:

- **Adaptiver Wiederholungsplan** (z. B. FSRS) statt fester Leitner-Abstände,
  berechnet aus den echten Antworten des Lernenden
- **Sprechen üben:** Wort nachsprechen, Spracherkennung prüft die Aussprache
- **Spracheingabe über Groq Whisper** statt Browser-Spracherkennung, die auf
  iOS und Firefox unzuverlässig ist
- **Accounts + Datenbank** (z. B. Supabase), damit Fortschritt geräteübergreifend
  gespeichert wird und mehrere Lernende möglich sind
- **Umschalter Latinica ↔ Kyrillisch** für Lernende, die Kyrillisch gewohnt sind
- **Weitere Ausgangssprachen** (Türkisch, Arabisch, …), da nur die Datenschicht wechselt

## Stolperfallen

| Problem                                     | Lösung                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Hydration-Fehler durch `localStorage`       | Erst in `useEffect` lesen                                                                                 |
| Hydration-Fehler durch `Math.random()`      | Zufall nur in Event-Handlern erzeugen                                                                     |
| `params.id` in Next 15+                     | `const { id } = await params`                                                                             |
| Datum per `toISOString()`                   | Ist UTC → Serie bricht nachts ab. Lokales Datum selbst bauen                                              |
| Intervalle ohne Cleanup                     | `clearInterval` im `useEffect`-Return, sonst zählt Zeit doppelt                                           |
| Kaputte č, ć, š beim Streaming              | `decoder.decode(value, { stream: true })`                                                                 |
| KI-Antworten als HTML rendern               | Kein `dangerouslySetInnerHTML`, `**fett**` selbst parsen                                                  |
| Sprachausgabe am Handy stumm                | Nur über HTTPS zuverlässig → Vercel                                                                       |
| Modell plötzlich weg (404)                  | Groq-Deprecations beobachten, Modell nur über `LLM_MODEL` setzen                                          |
| Editor zeigt Fehler, `pnpm typecheck` nicht | VS-Code-Cache veraltet → „TypeScript: Restart TS Server“. Im Zweifel hat das Terminal recht               |
| 🔊 bleibt nach dem ersten Vorlesen stumm    | Chrome-Fehler: Referenz auf die Ausgabe halten, vor `speak()` `cancel()` + `resume()` und kurz warten     |
| Flaggen-Emojis wie 🇷🇸 zeigen nur „RS“       | Windows unterstützt keine Flaggen-Emojis → nicht für wichtige Informationen verwenden                     |
| `<summary>` zeigt doppelte Pfeile           | Browser-Marker ausblenden: `list-none` und `[&::-webkit-details-marker]:hidden` (Safari)                  |
| `Cannot find module '@/…'`                  | Datei liegt im falschen Ordner (VS Code fasst Ordner zu `a\b` zusammen) → Pfad mit `Get-ChildItem` prüfen |

## Tech Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Vitest ·
Groq SDK (openai/gpt-oss-120b) · Web Speech API · Clerk · Vercel
