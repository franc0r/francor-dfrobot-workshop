# Offline-Betrieb und Trockenlauf

**Stand:** 10.09.2026

## Die Offline-Frage — beantwortet

Auf der Messe ist Internet nicht sicher verfügbar. Ergebnis der Recherche: **Der Workshop
ist vollständig offline machbar.** Es braucht genau eine Internetverbindung, und zwar
vorher bei der Vorbereitung.

Zwei Fakten tragen das:

1. **MakeCode cacht sich selbst.** Der Editor ist eine Web-App, die sich beim ersten Laden
   vollständig im Browser ablegt. Danach startet er ohne Netz aus dem Cache. Gleicher
   Browser, Cache nicht löschen. Über „Installieren" als App ablegen macht den Cache stabiler.
2. **Die DFRobot-Erweiterung ist reines TypeScript** (Repo `pxt-DFRobot_MaqueenPlus_v20`
   enthält keine .cpp/.h-Dateien). Sie wird im Browser übersetzt und braucht **keinen
   Cloud-Compiler**. Erweiterungen mit C++-Anteil würden offline scheitern — diese nicht.

**Die eine Hürde:** Eine Erweiterung *nachzuladen* braucht Internet. Lösung: einmal online
ein leeres Projekt mit geladener Erweiterung anlegen, als Datei speichern, auf jeden
Arbeitsplatz kopieren und dort importieren.

### Geht offline / geht nicht
| geht | geht nicht |
|---|---|
| Editor öffnen, Blöcke bauen, übersetzen, flashen | Erweiterung neu nachladen |
| Bereits importierte Erweiterungen nutzen | Projekte über Link teilen |
| Projekte lokal speichern und laden | Editor-Sprache umstellen (vorher wählen) |
| Die Workshop-Seite samt Simulatoren (lokale Datei) | Beispiele aus der MakeCode-Galerie |

### Konsequenz für dieses Repo
- `dist/maqueen-grand-prix-offline.html` ist die Datei für die Arbeitsplätze: keine externen
  Aufrufe, Systemschriften. `build.py` und `test/smoke.cjs` erzwingen das.
- Der claude.ai-Link (Artefakt-Fassung) ist nur fürs Planen und Teilen.
- Rückfallebene: Station 2 der Seite braucht überhaupt nichts außer der Datei.

## Trockenlauf-Protokoll

Lebende Fassung: claude.ai-Artefakt mit Datenablage (Cowork-Projekt „Anfänger Robotik Workshop").
`tools/trockenlauf.html` ist nur eine Kopie zur Referenz.

**36 Tests in sieben Blöcken, ca. 90 Minuten**, sortiert nach „was am Messetag am
teuersten schiefgeht":

| Block | Thema | Dauer |
|---|---|---|
| A | Arbeitsplatz und Flashen | 15 Min |
| B | **Ohne Internet** — der entscheidende Block | 12 Min |
| C | Der Roboter fährt (Messwerte: cm/s, ms für 90°, Steckrichtung, Tempo-Schwelle) | 15 Min |
| D | Liniensensoren und Strecke (Rohwerte, Stufe, Kurvenradius, Stopp-Block) | 15 Min |
| E | Laserscanner — die offene Flanke | 15 Min |
| F | micro:bit-Station gegenprüfen (Würfel, Beschleunigungsgrenze 300) | 8 Min |
| G | Ausdauer und Ablauf (Akku über 90 Min, Aufbauzeit) | 10 Min |

Ergebnisse, die in `src/` zurückfließen müssen:
- Wortlaut der Maqueen-Blöcke (Motor, Stopp, Licht, Linienverfolgung, Laserscanner) → alle Stationen + Handbuch
- cm bei Tempo 120 / 1 s und ms für 90° → Station 3
- sichere Linienstufe, kleinster Kurvenradius → Station 4, Handbuch, Parcours-Bauplan
- Rohwerte weiß/schwarz und deren Richtung → Station 4 Tabelle und Quiz q3
- Steckrichtung micro:bit → Station 3
- Beschleunigungsgrenze 300 → Station 2 und micro:bit-Simulator (`app.js`, `mbTiltPaint`)
- Akkulaufzeit, Aufbauzeit → Handbuch

## Quellen
- https://makecode.microbit.org/offline (Caching, Erweiterungs-Workaround, C++-Einschränkung)
- https://support.microbit.org/support/solutions/articles/19000013750- (Editoren offline)
- https://github.com/DFRobot/pxt-DFRobot_MaqueenPlus_v20 (Extension ist TypeScript, de-Lokalisierung)
