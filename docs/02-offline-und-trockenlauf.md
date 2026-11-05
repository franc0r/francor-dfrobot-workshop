# Offline-Betrieb und Trockenlauf

**Stand:** 05.11.2026 (Block H Grand Prix und vorläufige Blocktexte ergänzt)

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

**36 Tests in sieben Blöcken (A–G), ca. 90 Minuten**, sortiert nach „was am Messetag am
teuersten schiefgeht". Dazu kommt Block H für den Grand Prix (unten), an der geklebten Strecke.
Block H steht noch nicht im Artefakt und muss dort nachgetragen werden:

| Block | Thema | Dauer |
|---|---|---|
| A | Arbeitsplatz und Flashen | 15 Min |
| B | **Ohne Internet** — der entscheidende Block | 12 Min |
| C | Der Roboter fährt (Messwerte: cm/s, ms für 90°, Steckrichtung, Tempo-Schwelle) | 15 Min |
| D | Liniensensoren und Strecke (Rohwerte, Stufe, Kurvenradius, Stopp-Block) | 15 Min |
| E | Laserscanner — die offene Flanke | 15 Min |
| F | micro:bit-Station gegenprüfen (Würfel, Logo oben/unten ab y = ±200) | 8 Min |
| G | Ausdauer und Ablauf (Akku über 120 Min Workshop plus Aufbau, Aufbauzeit) | 10 Min |
| H | Grand Prix: Strecke, Kreuzungen, Bibliothek (Liste unten) | ca. 40 Min |

Ergebnisse, die in `src/` zurückfließen müssen:
- Wortlaut der Maqueen-Blöcke (Motor, Stopp, Licht, Linienverfolgung, Laserscanner) → alle Stationen + Handbuch
- cm bei Tempo 120 / 1 s und ms für 90° → Station 3
- sichere Linienstufe, kleinster Kurvenradius → Station 4, Handbuch, Parcours-Bauplan
- Rohwerte weiß/schwarz und deren Richtung → Station 4 Tabelle und Quiz q3
- Steckrichtung micro:bit → Station 3
- Grenze für „Logo nach oben/unten“ (angenommen y = ±200) und deren Vorzeichen → Station 2
  (Tabelle, „wichtigster Satz“) und micro:bit-Simulator (`app.js`, `TILT`)
- Akkulaufzeit, Aufbauzeit → Handbuch
- Zählnummern 1–4, Höchststufe, Schild-Lage → alle Stellen aus der Liste in
  `microbit/stations/06-grand-prix/README.md` gemeinsam, danach `loesung.hex` und `bloecke.png`

## Block H: Grand Prix

Aus dem Entwurf (`docs/superpowers/specs/2026-11-04-grand-prix-parcours-design.md`,
„Offen für den Trockenlauf“). Strecke nach `tools/grand-prix-druck.html`, Seite 2, kleben.

**Ergebnisse an Martins Strecke, 05.11.2026** (vor dem Workshop am 06.11.2026):

- **0, 2, 3:** bestätigt. Die Zählfahrt zeigt 1, 2, 3, 4; `Straight` aus Kreuzung 1 wirkt
  ab der nächsten Kreuzung; `Line Following Settings Speed` wirkt sofort.
- **1:** bestätigt. Zählt eine Stelle nicht sauber, die Stelle auf der Matte etwas verschieben.
- **4:** Der Laser **sieht** die Stummel-Kiste beim Vorbeifahren. Martin baut deshalb ohne
  Kisten: Eine Barriere rund um die ganze Matte ersetzt sie, der Laser-Stopp hält an der Wand.
- **5:** offen. Für die Profi-Musterlösung egal (Pro-Ziel über den Laser, nicht über eine Nummer).
- **13:** Er bremst nach dem Sprung nicht zu früh. Er hält an der Wand, nicht an einer Kiste.

0. **Zählfahrt:** Ein Programm mit `dauerhaft → zeige Zahl (Kreuzungen gezählt)` fährt die
   Strecke einmal den Normalweg ab. Die Anzeige muss nacheinander 1, 2, 3, 4 zeigen. (Steht
   als fester Aufbauschritt im Handbuch.)
1. Wird jede Zählstelle genau einmal gezählt? Auch der Querstrich am Tempo-Schild mit nur
   ≈ 6 cm Armen und das T direkt unter der Oberkante des Bogens (5–7 cm Abstand)?
2. Wirkt `Straight`, gesetzt in `wenn Kreuzung Nummer 1 erreicht`, erst ab der nächsten
   Kreuzung und nicht schon an K1?
3. Wirkt `Line Following Settings Speed`, gesetzt während der Fahrt, sofort und ohne OFF/ON?
4. Taucht die Kiste am Stummel im Laserbild auf, wenn er geradeaus vorbeifährt?
5. Wird das Überfahren des T-Balkens mit `PID Distance Control` (Linienverfolgung aus) als
   Kreuzung gezählt? Das ändert die Nummer für die Profis.
6. Mit Stufe 1 hielt der Roboter einmal nicht sauber am T. Vermutlich lag es am
   Reset-Fallstrick (`Line patrolling OFF` löscht die Regeln), nicht am Tempo. Nachprüfen.
7. Zeiten für die Strecke auf Stufe 1–5 messen, damit die Höchststufe auf der Seite stimmt.
8. Wie lange bleibt Register 61 (`intersectionDetecting`) an einer Kreuzung ≠ 0, und wie lange
   blockiert eine Laser-Abfrage? Ist die Abfrage länger, verpasst die Zählschleife (alle
   20 ms) Treffer, und das `dauerhaft` braucht eine Pause.
9. Hält der Akku 120 Minuten plus Aufbau? (zusammen mit Block G)
10. Freiraum um die Matte: Der Laser sieht auch Füße und Taschen. Reichen die 30 cm aus dem
    Handbuch?
11. **Schild „1“:** Am 05.11.2026 verlegt, weil es vorher (x 40–46, y 68–74 cm) im Fahrweg
    der Linie x = 36 lag. Jetzt laut Klebeplan bei x 22–28, y 56–62 cm: links neben x = 36
    (8 cm bis zur Bandmitte, der Roboter reicht ≈ 5,5 cm zur Seite), 12 cm bis zur
    Startgeraden x = 10, 9,5 cm über der Stummel-Kiste. Am Trockenlauf prüfen: Fährt kein Rad
    darüber, und sieht der Laser es nicht als Hindernis? Wird es noch einmal verschoben, alle
    Skizzen, den Klebeplan und die Texte gemeinsam ändern.
12. **Druckblatt:** `tools/grand-prix-druck.html` mit 100 % drucken und mit dem Lineal
    nachmessen: Die Matte ist 10 × 20 cm. Das Blatt einmal auf Raspberry Pi OS öffnen und
    drucken (das Blatt wünscht sich Helvetica Neue oder Arial, auf dem Pi greift meist DejaVu
    Sans, die breiter läuft) — passt jede Seite noch auf ein Blatt?
13. **Laser nach dem Profi-Sprung:** Der Laser-Stopp darf nach dem Sprung mit `PID Distance
    Control` nicht sofort auslösen. Nach den 20 cm Sprung sind es noch ≈ 22 cm bis zur
    Pro-Ziel-Kiste, knapp über der Grenze von 200 mm. Prüfen, ob er erst wieder auf der Linie
    fährt, bevor er bremst.
14. **Rechter Rand:** Der Bogen reicht bis x ≈ 96. Mit ≈ 5,5 cm halber Breite ragt die
    Karosserie dort ≈ 1,5 cm über die Mattenkante. Prüfen: Liegt die Matte flach genug (keine
    Stufe, die ein Rad abwirft), und bleibt am Tisch genug Platz?
15. **PID-Sprung wartet nicht:** `PID Distance Control` kehrt auch mit `No interruptions
    allowed` sofort zurück (Martin am Gerät, 05.11.2026). Die Musterlösung wartet danach
    2000 ms; damit lief der Profi-Weg bis zum Pro-Ziel. Am Trockenlauf mit vollem und mit
    schwächerem Akku nachprüfen, ob 2000 ms reichen.

## Vorläufige Blocktexte (Grand Prix)

Regel 6 der CLAUDE.md: Diese Texte stehen so auf der Seite, im Handbuch, auf dem Druckblatt
und in `microbit/stations/06-grand-prix/README.md`, sind aber noch nicht am Gerät abgelesen.
Beim Trockenlauf mit MakeCode vergleichen und alle Stellen gemeinsam ändern.

- Bibliothek **Grand Prix** (`microbit/bibliothek/custom.ts`, Farbe `#3C3C3C`):
  `wenn Kreuzung Nummer 1 erreicht`, `Kreuzungen gezählt`, `setze Kreuzungszähler zurück`.
  Die Texte stehen in der `custom.ts`; zu prüfen ist, ob MakeCode sie so zeigt.
- Kreuzungsblöcke der Maqueen-Erweiterung, Ort: Kategorie Maqueen → **… mehr**, Gruppe
  **V3**: `At Crossroads`, `At T-junction`, `At Left Turn and Straight Intersection`,
  `At Right Turn and Straight Intersection`. Die Wörter im Auswahlfeld: `Straight`, `Left`,
  `Right`, `Stop`.
- `PID Distance Control` mit den Feldern `CW` (Richtung), Strecke in cm und
  `Allow interruption`.
- `RGB Car Lights All color` mit den Farben `yellow` und `green` (für die Startampel; `red`
  ist aus Station 4/5 bestätigt).

Schon am Gerät bestätigt (nicht mehr prüfen): `Line patrolling ON/OFF`,
`Line Following Settings Speed 1–5` (08.10.2026), `spiele [Melodie …] [im Hintergrund]`
(05.11.2026).

## Quellen
- https://makecode.microbit.org/offline (Caching, Erweiterungs-Workaround, C++-Einschränkung)
- https://support.microbit.org/support/solutions/articles/19000013750- (Editoren offline)
- https://github.com/DFRobot/pxt-DFRobot_MaqueenPlus_v20 (Extension ist TypeScript, de-Lokalisierung)
