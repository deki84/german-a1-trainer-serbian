# german-a1-trainer-serbian

Eine mobile Lern-App, mit der Serbisch sprechende Menschen **ohne Vorkenntnisse**
Deutsch auf Niveau A1 lernen, auch wenn sie nur wenig lesen und schreiben können.
Mit Audio, großen A/B-Fragen, Tagesziel und einem KI-Lehrer, der auf Serbisch erklärt.

**Kernidee:** Ein Wort sehen und hören → eine einfache Frage mit zwei Antworten
beantworten → Lob oder sanfte Korrektur → nächstes Wort. Offene Fragen stellt
der Lernende per Text oder Sprache an einen KI-Lehrer, der nur mit einfachen
Wörtern und immer mit Aussprachehilfe antwortet.

Für Nutzer heißt die App **„Nemački korak po korak“** („Deutsch Schritt für Schritt“).

> **Status:** 🚧 Im Aufbau, wird von Grund auf neu entwickelt (siehe [Roadmap](#roadmap)).

## Warum dieses Projekt?

Die meisten Sprach-Apps setzen stillschweigend voraus, dass man sicher lesen kann,
und erklären auf Englisch. Für viele Menschen, die nach Deutschland kommen, passt
das nicht. Diese App ist für jemanden gebaut, der:

- **Serbisch** spricht und versteht,
- bei **Deutsch bei null** anfängt,
- **wenig liest und schreibt** (Alpha-/Basisbildungs-Niveau),
- hauptsächlich das **Handy** benutzt.

Der Wortschatz stammt ausschließlich aus der offiziellen **Goethe-Institut
A1-Wortliste („Start Deutsch 1“)**, also genau aus den Wörtern, die für die
erste Deutschprüfung (z. B. beim Ehegattennachzug) verlangt werden.
Das Projekt ist unabhängig und nicht mit dem Goethe-Institut verbunden.

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

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `GROQ_API_KEY` | ab Phase 7 | Key von console.groq.com. **Nie committen, nie `NEXT_PUBLIC_` davor!** |
| `LLM_MODEL` | nein | Modell-ID bei Groq, Standard `openai/gpt-oss-120b`. Aktive Modelle: [Groq Models](https://console.groq.com/docs/models) |

### Scripts

| Befehl | Zweck |
|---|---|
| `pnpm run dev` | Entwicklungsserver |
| `pnpm run build` | Produktions-Build |
| `pnpm run lint` | ESLint |
| `pnpm run test` | Vitest |
| `pnpm run typecheck` | TypeScript prüfen (`tsc --noEmit`) |

## Authentifizierung

Die App läuft öffentlich auf Vercel; ohne Schutz könnte jeder Besucher über den
KI-Lehrer das API-Kontingent verbrauchen. Deshalb:

- **Lernmodus** ist ohne Login nutzbar (alles läuft im Browser, keine Kosten)
- **KI-Lehrer** nur mit Login über Clerk (E-Mail/Passwort, Google)
- Zusätzlich ein einfaches **Rate-Limit** pro Nutzer in der API-Route

## Beispiel-Interaktionen

| Aktion | Was passiert |
|---|---|
| Lektion „Pozdravi“ öffnen | Wortkarte **Hallo** 👋 (halo) = Zdravo, wird automatisch vorgelesen |
| Auf „Dalje“ tippen | A/B-Frage: „Šta znači ‚Hallo‘? A) Zdravo B) Hvala“ |
| Falsche Antwort tippen | Sanfte Korrektur „Skoro! 🙂“, richtige Antwort markiert, neuer Versuch |
| Lektion abschließen | Sterne, Wortübersicht, nächste Lektion vorgeschlagen |
| Chat: „Kako se kaže hvala?“ | KI antwortet mit **Danke** (danke) 🙏, Wort antippbar zum Anhören |
| Chat: 🎤 „Šta da kažem kod lekara?“ | Spracheingabe auf Serbisch → einfache Sätze für den Arztbesuch |
| Chat: „Ko je pobedio na utakmici?“ | Kurze Antwort, dann zurück zum Deutschlernen (Themen-Leitplanke) |

## Projektstruktur

```
├── app/
│   ├── layout.tsx              # Schrift, Metadaten, Viewport
│   ├── page.tsx                # Startseite: Tagesziel, Chat-Knopf, Lektionen
│   ├── lesson/[id]/page.tsx    # Lektion (statisch generiert)
│   ├── chat/page.tsx           # KI-Lehrer
│   ├── api/chat/route.ts       # Orchestriert LLM-Aufruf + Streaming
│   └── manifest.ts             # PWA: "Zum Startbildschirm hinzufügen"
├── components/                 # WordCard, QuestionCard, LessonPlayer, ChatWindow, …
├── hooks/                      # useProgress, useStudyTimer, useSpeechInput, …
├── lib/
│   ├── quiz.ts                 # A/B-Fragen bauen, mischen, Sterne berechnen
│   ├── studyTime.ts            # Lernzeit, Serie, Schätzung bis A1
│   ├── speech.ts               # Vorlesen (Web Speech API)
│   ├── tutorPrompt.ts          # System-Prompt des KI-Lehrers
│   └── types.ts                # Word, Lesson, Progress, ChatMessage
├── data/                       # Wortschatz aus der Goethe-A1-Liste
├── tests/                      # Vitest
└── .env.example                # Zeigt benötigte Umgebungsvariablen
```

## Roadmap

Jede Phase endet mit etwas, das **funktioniert und deployed ist**.
Definition of Done: läuft am Handy, `lint` + `typecheck` + `test` grün, auf Vercel live.

- [ ] **Phase 0: Setup:** `create-next-app`, Git, Prettier, Aufräumen, „Zdravo! 👋“ auf Vercel
- [ ] **Phase 1: Datenmodell:** Typen `Word`/`Lesson`, erste 3 Lektionen, Tests gegen Duplikate
- [ ] **Phase 2: Wortkarte:** großes Wort, Emoji, Lautschrift, 🔊 Vorlesen
- [ ] **Phase 3: A/B-Frage:** `shuffle` + `buildQuestion` mit Tests, Lob und Korrektur
- [ ] **Phase 4: Lektionsablauf:** `/lesson/[id]`, State Machine `learn → quiz → finish`
- [ ] **Phase 5: Fortschritt:** `localStorage` ohne Hydration-Fehler, ✅ und ▶️ auf der Startseite
- [ ] **Phase 6: Tagesziel:** aktive Lernzeit messen, Ring, 🔥 Serie, Schätzung bis A1
- [ ] **Phase 7: KI-Lehrer:** Groq-Route mit Streaming, Chat-UI, antippbare Wörter, 🎤, Clerk
- [ ] **Phase 8: Vollständig:** komplette Wortliste (~790 Wörter), PWA, Barrierefreiheits-Check, Test mit echtem Lernenden

## Nächste Ausbaustufen

Bewusst nicht im ersten Wurf, aber als konkrete nächste Schritte durchdacht:

- **Spaced Repetition (Leitner-System):** falsch beantwortete Wörter kommen
  häufiger wieder, bekannte seltener. Größter Lerneffekt pro Minute
- **Spracheingabe über Groq Whisper** statt Browser-Spracherkennung, die auf
  iOS und Firefox unzuverlässig ist
- **Accounts + Datenbank** (z. B. Supabase), damit Fortschritt geräteübergreifend
  gespeichert wird und mehrere Lernende möglich sind
- **Umschalter Latinica ↔ Kyrillisch** für Lernende, die Kyrillisch gewohnt sind
- **Beispielsätze** aus der Wortliste als zweite Übungsstufe
- **Weitere Ausgangssprachen** (Türkisch, Arabisch, …), da nur die Datenschicht wechselt

## Stolperfallen

| Problem | Lösung |
|---|---|
| Hydration-Fehler durch `localStorage` | Erst in `useEffect` lesen |
| Hydration-Fehler durch `Math.random()` | Zufall nur in Event-Handlern erzeugen |
| `params.id` in Next 15+ | `const { id } = await params` |
| Datum per `toISOString()` | Ist UTC → Serie bricht nachts ab. Lokales Datum selbst bauen |
| Intervalle ohne Cleanup | `clearInterval` im `useEffect`-Return, sonst zählt Zeit doppelt |
| Kaputte č, ć, š beim Streaming | `decoder.decode(value, { stream: true })` |
| KI-Antworten als HTML rendern | Kein `dangerouslySetInnerHTML`, `**fett**` selbst parsen |
| Sprachausgabe am Handy stumm | Nur über HTTPS zuverlässig → Vercel |
| Modell plötzlich weg (404) | Groq-Deprecations beobachten, Modell nur über `LLM_MODEL` setzen |

## Tech Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Vitest ·
Groq SDK (openai/gpt-oss-120b) · Web Speech API · Clerk · Vercel
