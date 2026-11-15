# Workshop auf die FRANCOR-Erweiterung umstellen – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vorlage, Stationen 3–5, Handbuch, Musterlösungen, Druckblatt und Tests von DFRobot-Maqueen + Matrix-LiDAR + Bibliothek „Grand Prix“ auf die eigene Erweiterung `franc0r/pxt-francor-maqueen` v0.1.4 umstellen.

**Architecture:** Die Vorlage verweist per `github:franc0r/pxt-francor-maqueen#v0.1.4` auf die Erweiterung (nicht eingebettet); `custom.ts` entfällt. Auf der Seite werden nur Blocktexte und die Sätze dazu getauscht, nach dem freigegebenen Wortlaut unten. `build.py` prüft die Vorlage neu und verbietet alte Blocktexte in der fertigen Datei.

**Tech Stack:** Python 3 (`build.py`, `vorlage.py`, `unittest`), Node + Playwright (`test/*.cjs`), MakeCode-JavaScript (`loesung*.js`), optional `npx pxt build` für `.hex`.

**Spec:** Auftrag von Martin vom 15.11.2026 (in der Sitzung) plus die freigegebenen Tabellen (a), (b), (c) unten. Hintergrund: `docs/superpowers/specs/2026-11-11-francor-maqueen-extension-design.md`, Erweiterung unter `/Users/martin/Projekte/francor/Schulprogramm_AG/pxt-francor-maqueen` (maßgeblich für Blocktexte: `_locales/de/francor-maqueen-strings.json`; Vorlage für Lösungen: `geraetetest/08-stationen.ts`).

## Global Constraints

- Zweig `feature/maqueen-francor-extension`. Nicht pushen, mergen, taggen. Kleine Commits auf dem Zweig sind erlaubt. Commit-Nachricht endet mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Regeln aus `CLAUDE.md` gelten (Offline-only, eine Datei, nur Blöcke, Deutsch Klasse 7, 80 + 10 Minuten).
- **Wortlaut:** Sätze für Schüler und Betreuende nur aus den Tabellen (b) und (c) unten, wörtlich. Braucht eine Aufgabe einen Satz, der dort nicht steht: nicht erfinden, sondern im Bericht unter „Fehlender Wortlaut“ melden und die Stelle unverändert lassen.
- `TEXTBUDGET`, `GESPRAECHSFAKTOR`, `min` in Drehbüchern und `STATIONS` nicht ändern.
- Keine Prüfung streichen oder abschwächen. Wird eine Prüfung geändert, dann ersetzt durch eine gleich starke oder stärkere; im Bericht nennen.
- `website/dist/` nie von Hand ändern; nur über `python3 build.py`. Die neu gebaute `dist/maqueen-grand-prix-offline.html` (und die beiden anderen) gehören in den Commit.
- Jede Aufgabe endet mit grünem `cd website && npm run check`.
- Stationen 0–2, `tools/trockenlauf.html`, `docs/` (außer diesem Plan), `CLAUDE.md`, Stückliste („DFRobot“ als Hersteller) nicht anfassen. `CLAUDE.md` und `docs/02-…` zieht der Koordinator erst nach dem Gerätedurchlauf nach.
- Erweiterungsversion: `v0.1.4`, als eine Konstante `FRANCOR_MAQUEEN` in `microbit/vorlage/vorlage.py`.
- Kein Extra „Linienlage“ (Martin, 15.11.2026).

## Review Focus

- MakeCode öffnet die Vorlage mit Kategorien Maqueen und LiDAR, alles deutsch, ohne Warnung – nur am Gerät prüfbar (Halt nach Aufgabe 1).
- Offline nach einmal Laden: Knopf öffnet die Vorlage und sie kompiliert – nur am Gerät prüfbar (Halt nach Aufgabe 1).
- Ein alter Blocktext bleibt irgendwo in `dist` stehen (auch in JS-Kommentaren der Drehbücher, die in `app.js` landen) → abgefangen durch `check_alte_blocktexte` (Aufgabe 5).
- `nestStack`-Struktur: Nach dem Wegfall von `Hindernisvermeidungsdaten abrufen` hat `dauerhaft` genau einen Block (`wenn`) mit zwei Kindern → Smoketest Station 4 und 5.
- Teamskizze verrät Kreuzungstypen in den neuen deutschen Wörtern → Regex im Druckblatt-Test (Aufgabe 4).

---

## Wortlaut (freigegeben von Martin, 15.11.2026)

### (a) Blöcke: alter HTML-Text → neuer HTML-Text

Gilt in allen Karten (`website/src/karten/0[345]-*.html`). Klassen wie angegeben.

| Alt (wie in den Karten) | Neu |
|---|---|
| `initialisiere Maqueen Plus V2` | `starte Maqueen` |
| `RGB Car Lights <b>All</b> color <b>red</b>` | `Scheinwerfer <b>beide</b> Farbe <b>rot</b>` |
| `RGB Car Lights <b>All</b> color <b>yellow</b>` | `Scheinwerfer <b>beide</b> Farbe <b>gelb</b>` |
| `RGB Car Lights <b>All</b> color <b>green</b>` | `Scheinwerfer <b>beide</b> Farbe <b>grün</b>` |
| `Line Following Settings Speed <b>N</b>` | `Linien-Tempo <b>N</b>` |
| `Line patrolling <b>ON</b>` | `Linienverfolgung <b>an</b>` |
| `Line patrolling <b>OFF</b>` | `Linienverfolgung <b>aus</b>` |
| `<div class="mcb b-lidar i1">Laser-Entfernungsmesser I2C-Adresse <b>0x33</b> Matrix-Modus <b>Hindernisvermeidung</b> initialisieren</div>` | `<div class="mcb b-lidar i1">LiDAR einschalten</div>` |
| `<div class="mcb b-lidar i1">Hindernisvermeidungsdaten abrufen</div>` | Zeile löschen |
| `<span class="mcr b-lidar">Hindernisvermeidungsmodus Entfernungsmessung <b>Vorne</b> (mm)</span>` | `<span class="mcr b-lidar">Abstand <b>vorne</b> (mm)</span>` |
| `At Crossroads <b>???</b>` | `an Kreuzung <b>???</b>` |
| `At Left Turn and Straight Intersection <b>Straight</b>` | `an Abzweig links <b>geradeaus</b>` |
| `At Right Turn and Straight Intersection <b>???</b>` | `an Abzweig rechts <b>???</b>` |
| `At T-junction <b>???</b>` | `an T-Kreuzung <b>???</b>` |
| `class="mcb b-gp` (alle Vorkommen) | `class="mcb b-mq` (Texte `setze Kreuzungszähler zurück`, `wenn Kreuzung Nummer … erreicht` bleiben) |
| `<div class="mcb b-mq">PID Distance Control <b>CW</b> distance <b>20</b> cm <b>Allow interruption</b></div>` | `<div class="mcb b-mq">fahre <b>20</b> cm <b>vorwärts</b> <b>warte bis fertig</b></div>` |

Auswahlwerte in Fließtext: `Straight` → `geradeaus`, `Left` → `links`, `Right` → `rechts`, `Stop` → `halt`.

### (b) Sätze für Schüler

Schreibweise wie im Quelltext. In den Drehbüchern stehen sie als JS-Strings (doppelte Anführungszeichen, `\"` innen).

**Station 3** (`drehbuch/03-fahrschule.js`, `karten/03-fahrschule.html`)

| # | Alt | Neu |
|---|---|---|
| 3.1 | `Klickt auf den Knopf: ein neues Projekt mit den Roboter-Blöcken, Kategorie <b>Maqueen Plus V2</b>.` | `Klickt auf den Knopf: ein neues Projekt mit den Roboter-Blöcken, Kategorie <b>Maqueen</b>.` |
| 3.2 | Chip `Wo ist die Kategorie Maqueen Plus V2?` | `Wo ist die Kategorie Maqueen?` |
| 3.3 | `<kbd>initialisiere Maqueen Plus V2</kbd> steht in der Vorlage oben in <kbd>beim Start</kbd>: nicht löschen.` | `<kbd>starte Maqueen</kbd> steht in der Vorlage oben in <kbd>beim Start</kbd>: nicht löschen.` |
| 3.4 | `… Die Blöcke liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.` | `… Die Blöcke liegen in der Kategorie <b>Maqueen</b>, Gruppe <b>V3</b>.` (Satzanfang „Der Linienfolger steckt fertig …“ bleibt) |
| 3.5 | `Sie sind auf Englisch: <b>Line patrolling</b> heißt „Linie abfahren“, <b>Speed</b> Stufe, <b>RGB Car Lights</b> sind die Lichter.` | `Die <b>Scheinwerfer</b> sind die zwei Lichter vorn: eure Startampel.` |
| 3.6 | Chips `Wo ist … mehr?` / `Wo ist RGB Car Lights?` | `Wo ist Linien-Tempo?` / `Wo ist Scheinwerfer?` (die anderen beiden Chips bleiben, Reihenfolge bleibt) |
| 3.7 | k3-klemmt `<b>Verlässt die Linie in Kurven?</b> <b>Speed</b> kleiner.` | `<b>Verlässt die Linie in Kurven?</b> <b>Linien-Tempo</b> kleiner.` |

**Station 4** (`drehbuch/04-reflexe.js`, `karten/04-reflexe.html`)

| # | Alt | Neu |
|---|---|---|
| 4.1 | `ein kleines Lidar` / Chip `Was ist ein Lidar?` | `ein kleines LiDAR` / `Was ist ein LiDAR?` |
| 4.2 | `Seine lila Blöcke liegen in der Kategorie <b>Matrix LiDAR Entfernung</b>: einmal einschalten in <kbd>beim Start</kbd>, in <kbd>dauerhaft</kbd> erst Messwerte abholen, dann den Abstand nach vorn abfragen.` | `Seine Blöcke liegen in der Kategorie <b>LiDAR</b>. <kbd>LiDAR einschalten</kbd> kommt in <kbd>beim Start</kbd>, dann misst er von selbst immer weiter. In <kbd>dauerhaft</kbd> fragt ihr nur noch den Abstand nach vorn ab.` |
| 4.3 | Chips `Wo ist Matrix LiDAR Entfernung?` / `Was heißt 0x33?` | `Wo ist die Kategorie LiDAR?` / `Misst er von selbst weiter?` |
| 4.4 | k4-laser `mccap`: `Laser einschalten und Messwerte abholen` | `LiDAR einschalten` |
| 4.5 | k4-bauen Schritt 3 Text: `Den lila Block <kbd>Hindernisvermeidungsmodus Entfernungsmessung Links (mm)</kbd> auf die <b>linke 0</b> ziehen, <b>Links</b> auf <b>Vorne</b> umstellen, rechts <b>200</b> eintippen.` | `Aus <b>LiDAR</b> den Block <kbd>Abstand vorne (mm)</kbd> auf die <b>linke 0</b> ziehen, rechts <b>200</b> eintippen.` |
| 4.6 | k4-klemmt `<b>Er bremst nie?</b> Steht <b>Hindernisvermeidungsdaten abrufen</b> in <kbd>dauerhaft</kbd> ganz oben? Ohne neue Messwerte bleibt der Vergleich immer gleich. Steht der Abstandsblock auf <b>Vorne</b>?` | `<b>Er bremst nie?</b> Steht <b>LiDAR einschalten</b> in <kbd>beim Start</kbd>? Steht der Abstandsblock auf <b>vorne</b>? Nach dem Einschalten braucht der LiDAR 2 bis 3 Sekunden, bis er misst.` |
| 4.7 | k4-klemmt `Richtig so: <b>Line patrolling OFF</b> bleibt aus, bis ihr Knopf A drückt.` | `Richtig so: <b>Linienverfolgung aus</b> bleibt aus, bis ihr Knopf A drückt.` |

**Station 5** (`drehbuch/05-grand-prix.js`, `karten/05-grand-prix.html`)

| # | Alt | Neu |
|---|---|---|
| 5.1 | `Vier Arten von Kreuzungen, die Blöcke sind auf Englisch:` | `Vier Arten von Kreuzungen:` |
| 5.2 | `… Für jede Art wählt ihr: <b>Straight</b> (geradeaus), <b>Left</b>, <b>Right</b> oder <b>Stop</b>.` | `… Für jede Art wählt ihr: <b>geradeaus</b>, <b>links</b>, <b>rechts</b> oder <b>halt</b>.` (Satzanfang bleibt) |
| 5.3 | Chips `Was ist der Unterschied zwischen Crossroads und T-junction?` / `Was heißt Intersection?` | `Was ist der Unterschied zwischen Kreuzung und T-Kreuzung?` / `Was ist ein Abzweig?` |
| 5.4 | k5-typen, die vier `<span>`: `<b>Crossroads</b> Kreuzung: links, rechts, geradeaus` / `<b>Left Turn and Straight Intersection</b> Abzweig links oder geradeaus` / `<b>Right Turn and Straight Intersection</b> Abzweig rechts oder geradeaus` / `<b>T-junction</b> T: nur links oder rechts` | `<b>Kreuzung</b>: links, rechts, geradeaus` / `<b>Abzweig links</b>: links oder geradeaus` / `<b>Abzweig rechts</b>: rechts oder geradeaus` / `<b>T-Kreuzung</b>: nur links oder rechts` |
| 5.5 | `… Sie liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.` | `… Sie liegen in der Kategorie <b>Maqueen</b>, Gruppe <b>V3</b>.` |
| 5.6 | `<b>An Kreuzung <span class=\"gpnum\">1</span> umstellen:</b> Die grauen Blöcke liegen in <b>Grand Prix</b>. <kbd>wenn Kreuzung Nummer 1 erreicht</kbd> läuft einmal, wenn er dort ankommt.` | `<b>An Kreuzung <span class=\"gpnum\">1</span> umstellen:</b> <kbd>wenn Kreuzung Nummer 1 erreicht</kbd> liegt in derselben Gruppe. Es läuft einmal, wenn er dort ankommt.` |
| 5.7 | Chip `Wo ist die Kategorie Grand Prix?` | `Wo ist wenn Kreuzung Nummer?` |
| 5.8 | k5-kreuzungen `mccap`: `Grand Prix &ndash; neu: graue Blöcke, Kreuzungsblöcke, Speed 2. Der Rest steht schon in Linie` | `Grand Prix &ndash; neu: Kreuzungszähler, Kreuzungsregeln, Linien-Tempo 2. Der Rest steht schon in Linie` |
| 5.9 | `… erst mit <b>Speed 1 oder 2</b>. …` | `… erst mit <b>Linien-Tempo 1 oder 2</b>. …` |
| 5.10 | k5-plan Schritt 3: `<b>Line patrolling OFF</b>, dann mit <b>PID Distance Control</b> 20&nbsp;cm über die Lücke springen.` | `<b>Linienverfolgung aus</b>, dann mit <b>fahre 20 cm vorwärts warte bis fertig</b> über die Lücke springen.` |
| 5.11 | k5-plan Schritt 4: `<b>2 Sekunden warten</b>: Der Sprung-Block wartet nicht selbst.` | `<li>` löschen |
| 5.12 | k5-plan Schritt 5: `<b>Line patrolling ON</b>, bis zur Kiste am Pro-Ziel.` | `<b>Linienverfolgung an</b>, bis zur Kiste am Pro-Ziel.` |
| 5.13 | Chip `Wo ist PID Distance Control?` | `Wo ist fahre 20 cm?` |
| 5.14 | k5-klemmt `Gelten eure Regeln vor <b>Line patrolling ON</b>?` / `<b>Er verlässt die Linie in Kurven?</b> Speed 1 oder 2.` | `Gelten eure Regeln vor <b>Linienverfolgung an</b>?` / `<b>Er verlässt die Linie in Kurven?</b> Linien-Tempo 1 oder 2.` |

### (c) Handbuch (`website/src/handbuch.html`)

| # | Stelle | Neu |
|---|---|---|
| H1 | Zeitplan 0:42–0:50 | `<em>Line patrolling OFF</em>` → `<em>Linienverfolgung aus</em>` |
| H2 | Tabelle „Lösung: die Zählfolge“, Spalte Regel | 1: `<em>an Abzweig rechts</em> <b>rechts</b> in Knopf A; in <em>wenn Kreuzung Nummer 1 erreicht</em> auf <b>geradeaus</b> umstellen` · 2: `steht schon auf <b>geradeaus</b> &rarr; geradeaus vorbei` · 3: `<em>an Kreuzung</em> <b>geradeaus</b>; in <em>wenn Kreuzung Nummer 3 erreicht</em>: <em>Linien-Tempo</em> <b>1</b> und <em>zeige Zahl 1</em>` · 4: `<em>an T-Kreuzung</em> <b>halt</b>; in <em>wenn Kreuzung Nummer 4 erreicht</em> die Siegesmelodie` |
| H3 | Absatz unter der Tabelle | `<em>At Left Turn and Straight Intersection</em> steht auf <b>Straight</b>` → `<em>an Abzweig links</em> steht auf <b>geradeaus</b>`; `vor <em>Line patrolling ON</em>` → `vor <em>Linienverfolgung an</em>`; `An 1 <b>Straight</b>` → `An 1 <b>geradeaus</b>`; `Kreuzung auf <b>Stop</b>` → `Kreuzung auf <b>halt</b>` |
| H4 | Laufregeln | `Zuerst Speed 1 oder 2` → `Zuerst Linien-Tempo 1 oder 2` |
| H5 | „Der Reset-Fallstrick“ | `<em>Line patrolling OFF</em>` → `<em>Linienverfolgung aus</em>`; `Nach <em>ON</em>` → `Nach <em>an</em>`; `nur <em>ON</em> schaltet` → `nur <em>an</em> schaltet`; `vor jedem <em>ON</em>` → `vor jedem <em>an</em>`; `Die Grand-Prix-Blöcke nehmen ihnen das absichtlich nicht ab.` → `Die Erweiterung nimmt ihnen das absichtlich nicht ab.`; `fest <b>Right</b>` → `fest <b>rechts</b>` |
| H6 | „Ohne Internet arbeiten“, 2. Absatz | `Zweitens ist die DFRobot-Erweiterung in TypeScript geschrieben` → `Zweitens ist unsere Erweiterung <b>FRANCOR Maqueen</b> in TypeScript geschrieben` (Rest des Satzes bleibt) |
| H7 | Vorbereitung, Punkt 1 | `Diese Seite öffnen, in Station 3 auf <b>Neues Roboter-Projekt starten</b> klicken. Die Vorlage steckt im Link selbst (<kbd>microbit/vorlage/vorlage.mkcd</kbd>): Sie verweist auf unsere Erweiterung <b>pxt-francor-maqueen</b>, Version <b>v0.1.4</b>, auf GitHub. In <em>beim Start</em> steht nur <em>starte Maqueen</em>. Beim ersten Öffnen lädt MakeCode die Erweiterung in den Cache – danach öffnet der Knopf die Vorlage auch ohne Netz` |
| H8 | Vorbereitung, Punkt 2 | `Prüfen: Links stehen die Kategorien <b>Maqueen</b> (hellgrün) und <b>LiDAR</b>, alle Blöcke auf Deutsch. Fehlen sie, war der Platz beim Klick offline` |
| H9 | Vorbereitung, neuer Punkt direkt nach H8 | `<b>Neue Version der Erweiterung:</b> Vorlage und Offline-Datei neu bauen, dann jeden Platz noch einmal mit Netz über den Knopf öffnen. Auch ein Platz, der früher schon vorbereitet war, muss dafür noch einmal ran.` |
| H10 | Störung „Laser bremst nicht vor der Hand (Station 4/5)“, rechte Zelle | `Steht <em>LiDAR einschalten</em> in <em>beim Start</em>? Steht der Abstandsblock auf <b>vorne</b>? In den ersten 2–3&nbsp;s nach dem Einschalten misst der LiDAR noch nicht (Abstand 9999, zählt nie als Hindernis).` |
| H11 | Störungen „Roboter reagiert gar nicht“, „micro:bit zeigt blinkendes X“ | `<em>initialisiere Maqueen Plus V2</em>` → `<em>starte Maqueen</em>` |
| H12 | Störung „Abstandswerte sind Unsinn“ → ganze Zeile | `<tr><td>Abstand bleibt 9999</td><td>In den ersten 2–3&nbsp;s nach <em>LiDAR einschalten</em> normal. Bleibt er: Kabel prüfen, Schalter am Sensor wie ab Werk (Adresse 0x33); Linse verschmutzt oder verdeckt</td></tr>` |
| H13 | „Blocknamen vorab prüfen“, ganzer `<p>` | `Die Blöcke kommen aus unserer Erweiterung <b>FRANCOR Maqueen</b> (GitHub <kbd>franc0r/pxt-francor-maqueen</kbd>, v0.1.4): Kategorie <b>Maqueen</b> (hellgrün, Gruppen V3, Linie, Lichter, V2) und <b>LiDAR</b> für den 8×8-Laserscanner. Steht MakeCode auf Deutsch, sind alle Blöcke deutsch. Die Kreuzungsblöcke und <em>wenn Kreuzung Nummer … erreicht</em> sind am Gerät noch nicht ganz geprüft. Die Hilfe-Seiten der Blöcke (Rechtsklick → Hilfe) brauchen Internet; die Stationen verlassen sich nicht darauf.` |

Druckblatt `tools/grand-prix-druck.html`, Tabelle Zeilen 1–4 (Spalte Regel), sinngemäß wie H2 in dessen Kurzform: `<span class="k">an Abzweig rechts</span> <b>rechts</b>; bei Kreuzung 1 auf <b>geradeaus</b> umstellen` · `steht schon auf <b>geradeaus</b>` · `<span class="k">an Kreuzung</span> <b>geradeaus</b>; bei Kreuzung 3 <span class="k">Linien-Tempo</span> <b>1</b> und <span class="k">zeige Zahl</span> …` (Rest der Zelle bleibt) · `<span class="k">an T-Kreuzung</span> <b>halt</b>; bei Kreuzung 4 Siegesmelodie`.

Betreuer-READMEs unter `microbit/` sind keine Schülertexte: dort sachlich auf die neuen Blocknamen aus (a) umschreiben, keine neuen Behauptungen über Gerätetests außer den unten genannten.

---

### Task 1: Vorlage auf die Erweiterung umstellen (dann HALT für Martin)

**Files:**
- Modify: `microbit/vorlage/vorlage.py`, `microbit/vorlage/vorlage.mkcd` (neu erzeugt), `microbit/vorlage/README.md`, `microbit/README.md:8`
- Modify: `website/build.py:86-109` (`BIBLIOTHEK` weg, `check_vorlage` neu)
- Modify: `website/src/handbuch.html` (H6, H7, H8, H9, H13)
- Modify: `website/package.json` (`check` ruft zusätzlich die Python-Tests)
- Create: `website/test/build_test.py`
- Delete: `microbit/bibliothek/custom.ts` (Ordner `microbit/bibliothek/` verschwindet)
- Rebuild: `website/dist/*`

**Interfaces:**
- Produces: `vorlage.py`-Konstante `FRANCOR_MAQUEEN = "github:franc0r/pxt-francor-maqueen#v0.1.4"`; `build.py`: `VORLAGE_ERWEITERUNG = "github:franc0r/pxt-francor-maqueen#v0.1.4"` und `check_vorlage(path: str) -> None` (wirft `SystemExit`); `website/test/build_test.py` (unittest, importiert `build` aus `website/`), wird in Task 5 erweitert.

- [ ] **Step 1: Failing test.** `website/test/build_test.py` mit `unittest`. Hilfsfunktion `mkcd(files: dict) -> Pfad` schreibt eine `.mkcd` in ein `tempfile`-Verzeichnis im selben Format wie `vorlage.py` (LZMA alone, `{"meta":…, "source": json.dumps(files)}`). Tests:
  - `test_gute_vorlage`: `pxt.json` mit `dependencies` = `{"core":"*","radio":"*","microphone":"*","francor-maqueen":"github:franc0r/pxt-francor-maqueen#v0.1.4"}`, `files` = `["main.blocks","main.ts","README.md"]`, `main.ts` = `"francorMaqueen.start()\n"` → kein Fehler.
  - `test_falsche_version`: `#v0.1.3` → `SystemExit`.
  - `test_dfrobot_verboten`: zusätzlich `"maqueenPlusV2": "github:dfrobot/…"` → `SystemExit`.
  - `test_custom_ts_verboten`: `custom.ts` in `files` oder als Datei → `SystemExit`.
  - `test_ohne_erweiterung`: ohne `francor-maqueen` → `SystemExit`.
  - `test_echte_vorlage`: `build.check_vorlage(build.VORLAGE)` → kein Fehler.
- [ ] **Step 2:** `cd website && python3 -m unittest discover -s test -p '*_test.py' -v` → schlägt fehl (die alte `check_vorlage` verlangt `custom.ts`).
- [ ] **Step 3: `check_vorlage` neu.** Bricht ab, wenn: eine Abhängigkeit in `pxt.json` `dfrobot` enthält (Groß-/Kleinschreibung egal); `custom.ts` in `files` oder in `pxt.json["files"]` steht; keine Abhängigkeit genau `VORLAGE_ERWEITERUNG` ist. Fehlermeldungen deutsch, mit Hinweis `python3 vorlage.py`. `BIBLIOTHEK` entfernen. Docstring anpassen.
- [ ] **Step 4: `vorlage.py`.** `MAQUEEN`/`CUSTOM` ersetzen durch `FRANCOR_MAQUEEN`. Abhängigkeiten wie im Test oben. `files` ohne `custom.ts`. `main.blocks`: `beim Start` mit genau einem Block `<block type="francor_start"></block>` (blockId aus `start.ts` der Erweiterung). `main.ts`: `francorMaqueen.start()\n`. Docstring neu (Verweis, nicht eingebettet; LiDAR ist Teil derselben Erweiterung). `python3 microbit/vorlage/vorlage.py` ausführen.
- [ ] **Step 5:** Unittests grün.
- [ ] **Step 6: Aufräumen.** `git rm -r microbit/bibliothek`. `microbit/vorlage/README.md` neu: Verweis auf `github:franc0r/pxt-francor-maqueen#v0.1.4`, Konstante in `vorlage.py`; `beim Start` nur `starte Maqueen` (blinkendes X / Haken wie bisher); Kreuzungszähler steckt jetzt in der Erweiterung (Kategorie Maqueen, Gruppe V3); neue Version = `vorlage.py` anpassen, Vorlage und Offline-Datei neu bauen, jeden Platz einmal mit Netz öffnen. `microbit/README.md:8` → `Startprojekt, das auf unsere Erweiterung FRANCOR Maqueen verweist — das, was die Schüler öffnen`. Handbuch H6, H7, H8, H9, H13 einsetzen.
- [ ] **Step 7:** `website/package.json` `check`: vor `python3 build.py` einfügen `python3 -m unittest discover -s test -p '*_test.py' && `. Dann `cd website && npm run check` → grün (der Smoketest vergleicht den Link mit der neuen `vorlage.mkcd`).
- [ ] **Step 8:** Dekodierte Vorlage zur Kontrolle ausgeben (pxt.json, main.blocks, main.ts) und in den Bericht übernehmen.
- [ ] **Step 9: Commit** `Vorlage verweist auf pxt-francor-maqueen v0.1.4; custom.ts entfällt`.
- [ ] **HALT:** Koordinator gibt Martin die Prüfliste (Kategorien Maqueen und LiDAR, alles deutsch, kein Warnhinweis; Netz aus, Chrome neu starten, Knopf öffnet, kompiliert). Weiter erst nach seinem Ja.

### Task 2: Station 3 (Fahrschule)

**Files:**
- Modify: `website/src/drehbuch/03-fahrschule.js` (Kopfkommentar, 3.1–3.6), `website/src/karten/03-fahrschule.html` (k3-bloecke nach (a), 3.7)
- Modify: `website/src/handbuch.html` (H11)
- Modify: `microbit/stations/03-fahrschule/loesung.js`, `microbit/stations/03-fahrschule/README.md`
- Test: `website/test/smoke.cjs` (Block Station 3)

**Interfaces:** Consumes Task 1 (Vorlage). Produces nichts für andere Tasks.

- [ ] **Step 1: Failing test.** In `smoke.cjs`, Station 3, nach `const txt3 = …`: `check(/starte Maqueen/.test(txt3) && /Linienverfolgung an/.test(txt3) && /Scheinwerfer beide Farbe rot/.test(txt3.replace(/\s+/g, ' ')) && /Linien-Tempo 1/.test(txt3.replace(/\s+/g, ' ')), 'Station 3: neue Blocktexte (starte Maqueen, Scheinwerfer, Linien-Tempo, Linienverfolgung)')` und `check(!/Line patrolling|RGB Car Lights|initialisiere Maqueen|Line Following|… mehr|auf Englisch/.test(txt3), 'Station 3: keine alten Blocktexte')`. Meldungstext der Klammerprüfung (`'Station 3: Ampel + Line patrolling als Klammer'`) auf `'Station 3: Ampel + Linienverfolgung als Klammer'`, ebenso der Kommentar darüber; die Zahlen (`beim Start:1`, `wenn Knopf A geklickt:7`, `wenn Knopf B geklickt:1`) bleiben. Die doppelte Zeile „kein Motorblock“ einmal löschen ist erlaubt (Dublette, keine Abschwächung).
- [ ] **Step 2:** `cd website && python3 build.py && node test/smoke.cjs` → die neuen Prüfungen schlagen fehl.
- [ ] **Step 3:** Wortlaut 3.1–3.7 und (a) einsetzen, H11. Kopfkommentar im Drehbuch: `Line patrolling ON` → `Linienverfolgung an`, `OFF` → `aus`.
- [ ] **Step 4: Musterlösung.** `loesung.js` = Abschnitt „Station 3“ aus `geraetetest/08-stationen.ts` (ohne Kommentarzeichen). README: `beim Start` nur `starte Maqueen`; Knopf A: Startampel (`Scheinwerfer beide Farbe` rot, 1 s, gelb, 1 s, grün), `Linien-Tempo 1`, `Linienverfolgung an`; Knopf B: `Linienverfolgung aus`. Hinweis: neue Blöcke am Gerät noch nicht als Station gefahren (Gerätetest 08 offen).
- [ ] **Step 5:** `cd website && npm run check` → grün.
- [ ] **Step 6: Commit** `Station 3 auf FRANCOR-Blöcke`.

### Task 3: Station 4 (Reflexe)

**Files:**
- Modify: `website/src/drehbuch/04-reflexe.js` (4.1–4.3), `website/src/karten/04-reflexe.html` (k4-laser, k4-bedingung nach (a); 4.4–4.7)
- Modify: `website/src/handbuch.html` (H1, H10, H12)
- Modify: `microbit/stations/04-reflexe/loesung.js`, `microbit/stations/04-reflexe/README.md`
- Test: `website/test/smoke.cjs` (Block Station 4)

**Interfaces:** Consumes Task 2 (Station-3-Blöcke stehen in k4-bedingung nicht, nur `beim Start`).

- [ ] **Step 1: Failing test.** Station 4: `k4.includes('dauerhaft:2')` → `k4.includes('dauerhaft:1')` (das `wenn` mit zwei Kindern bleibt geprüft). Neu: `const txt4 = await page.$eval('#chat', e => e.textContent.replace(/\s+/g, ' '));` `check(/LiDAR einschalten/.test(txt4) && /Abstand vorne \(mm\)/.test(txt4) && /Linienverfolgung aus/.test(txt4), 'Station 4: neue Blocktexte')`, `check(!/Hindernisvermeidung|abrufen|0x33|Matrix LiDAR|Line patrolling|RGB Car Lights|initialisiere Maqueen/.test(txt4), 'Station 4: keine alten Blocktexte, kein Daten-Abholen')`. Die Prüfung „Laserblöcke lila“ (`rgb(91, 63, 232)`) bleibt unverändert.
- [ ] **Step 2:** Build + Smoke → schlägt fehl.
- [ ] **Step 3:** (a) in k4-laser und k4-bedingung (k4-laser danach: `beim Start` → `starte Maqueen`, `LiDAR einschalten`; kein `dauerhaft`). 4.1–4.7, H1, H10, H12 einsetzen.
- [ ] **Step 4: Musterlösung.** `loesung.js` = Abschnitt „Station 4“ aus `08-stationen.ts`. README: `beim Start` `starte Maqueen`, `LiDAR einschalten` (misst danach im Hintergrund; die ersten 2–3 s Abstand 9999, zählt nie als Hindernis); `dauerhaft`: wenn `Abstand vorne (mm) < 200`, dann `Linienverfolgung aus` und `Scheinwerfer beide Farbe rot`. „Kein `ansonsten`, keine Variable“ bleibt.
- [ ] **Step 5:** `npm run check` → grün.
- [ ] **Step 6: Commit** `Station 4 auf FRANCOR-Blöcke`.

### Task 4: Station 5 (Grand Prix, normal und Profi), Druckblatt, `.b-gp`

**Files:**
- Modify: `website/src/drehbuch/05-grand-prix.js` (5.1–5.3, 5.5–5.7, 5.9, 5.13), `website/src/karten/05-grand-prix.html` (k5-typen 5.4, k5-kreuzungen, k5-melodie, k5-tempo, k5-plan nach (a); 5.8, 5.10–5.12, 5.14)
- Modify: `website/src/handbuch.html` (H2, H3, H4, H5)
- Modify: `website/src/styles.css:280` (`.b-gp` löschen)
- Modify: `tools/grand-prix-druck.html:279-282`, `tools/grand-prix-druck-test.cjs:61`
- Modify: `microbit/stations/05-grand-prix/loesung.js`, `loesung-profi.js`, `README.md`
- Test: `website/test/smoke.cjs` (Station-5-Block)

- [ ] **Step 1: Failing tests.**
  - Smoke: Graphit-Prüfung ersetzen durch `check(await page.$$eval('#chat .mcb.b-gp', l => l.length) === 0 && await page.$$eval('#chat .mcb', l => l.filter(e => /Kreuzungszähler|wenn Kreuzung Nummer/.test(e.textContent)).length >= 2 && l.filter(e => /Kreuzungszähler|wenn Kreuzung Nummer/.test(e.textContent)).every(e => e.classList.contains('b-mq') && getComputedStyle(e).backgroundColor === 'rgb(15, 188, 17)')), 'Station 5: Zählerblöcke in Maqueen-Hellgrün, kein .b-gp')`.
  - Smoke: `k5.includes('dauerhaft:2')` → `k5.includes('dauerhaft:1')`; `wenn Knopf A geklickt:12` bleibt. Meldungstext `Line patrolling ON` → `Linienverfolgung an`.
  - Smoke neu: Text der Karte k5-kreuzungen (whitespace normalisiert) enthält `an Kreuzung`, `an Abzweig links geradeaus`, `an Abzweig rechts`, `an T-Kreuzung`, `Linien-Tempo 2`, `LiDAR einschalten`; und `txt5` plus `#chat`-Text enthält keins von `/At Crossroads|T-junction|Turn and Straight|\bStraight\b|PID Distance|Line patrolling|RGB Car Lights|Line Following|graue Blöcke|Kategorie Grand Prix/`. Nach dem Öffnen des Extras Pro-Ziel: `#chat` enthält `fahre 20 cm vorwärts warte bis fertig` und nicht `2 Sekunden warten`.
  - Druck-Test Zeile 61: Regex → `/T-junction|Crossroads|Turn and Straight|T-Kreuzung|Abzweig (links|rechts)|an Kreuzung|Kreuzung \(\+\)/`. Zusätzlich neu: `const plan = await page.$$eval('.sheet', l => l[1].textContent);` `check(!/At Crossroads|T-junction|Turn and Straight|\bSpeed\b|\bStraight\b|\bRight\b|\bStop\b/.test(plan) && /an T-Kreuzung/.test(plan), 'Klebeplan nennt die deutschen Blocktexte')`.
- [ ] **Step 2:** Build + Smoke + `node ../tools/grand-prix-druck-test.cjs` → neue Prüfungen schlagen fehl (die alte Teamskizze-Prüfung bleibt grün).
- [ ] **Step 3:** (a) in allen Station-5-Karten; 5.1–5.14; H2–H5; `.b-gp`-Zeile in `styles.css` löschen; Druckblatt-Zeilen. Kopfkommentar im Drehbuch prüfen.
- [ ] **Step 4: Musterlösungen.** `loesung.js` = „Station 5: Grand Prix, normal“ aus `08-stationen.ts`; `loesung-profi.js` = Profi-Abschnitt (entkommentiert, der Kommentar „warte bis fertig ersetzt …“ darf weg). README: Bibliothek-Sätze durch „Kreuzungszähler steckt in der Erweiterung (Kategorie Maqueen, Gruppe V3)“ ersetzen; Tabelle und Beschreibung mit den Texten aus (a)/H2; Profi: `fahre 20 cm vorwärts warte bis fertig` wartet selbst (Gerätetest 05 bestanden), die 2000-ms-Pause und ihre Begründung fallen weg; Hinweis, dass der Profi-Sprung mit dem neuen Block am Gerät noch offen ist (Gerätetest 08). Absatz „Ob das Überfahren des T-Balkens mit PID …“ → „… mit `fahre 20 cm` …“. Kreuzungsblöcke bleiben vorläufig.
- [ ] **Step 5:** `npm run check` → grün.
- [ ] **Step 6: Commit** `Station 5, Druckblatt und Lösungen auf FRANCOR-Blöcke; .b-gp entfällt`.

### Task 5: Sperre gegen alte Blocktexte, letzter Abgleich

**Files:**
- Modify: `website/build.py` (`ALTE_BLOCKTEXTE`, `check_alte_blocktexte`, Aufruf in `assemble`)
- Modify: `website/test/build_test.py`
- Modify: `microbit/stations/README.md` (falls dort noch `website/src/stations/` steht: auf `drehbuch/` + `karten/` korrigieren – reine Pfadkorrektur)
- Rebuild: `website/dist/*`

**Interfaces:** Consumes `build_test.py` aus Task 1. Produces `check_alte_blocktexte(html: str, target: str) -> None`.

- [ ] **Step 1: Failing test.** `test_alte_blocktexte`: für jedes Wort in `build.ALTE_BLOCKTEXTE` wirft `check_alte_blocktexte("… " + wort + " …", "offline")` `SystemExit`; `check_alte_blocktexte("Linienverfolgung an, Adresse 0x33, DFRobot", "offline")` wirft nicht.
- [ ] **Step 2:** Unittest → schlägt fehl (Funktion fehlt).
- [ ] **Step 3:** `ALTE_BLOCKTEXTE = ("Line patrolling", "Line Following", "RGB Car Lights", "initialisiere Maqueen", "Hindernisvermeidung", "At Crossroads", "T-junction", "Turn and Straight", "PID Distance", "Matrix LiDAR", "Maqueen Plus V2", "b-gp", "grandPrix", "maqueenPlusV2")`. `check_alte_blocktexte` bricht mit `"%s-Build enthält alte Blocktexte: %s"` und den gefundenen Wörtern ab. In `assemble` für jedes Ziel auf die fertige Seite anwenden. Achtung: `Maqueen Plus V3` und „Vorgänger Plus V2“ (Stückliste) sind erlaubt.
- [ ] **Step 4:** `npm run check` → grün. Findet die Sperre noch Reste (auch in Kommentaren), diese nach (a)/(b)/(c) beheben; passt kein freigegebener Wortlaut, nicht ändern, sondern melden.
- [ ] **Step 5:** `grep -rnE "Line patrolling|RGB Car|initialisiere Maqueen|Hindernisvermeidung|At Crossroads|T-junction|PID Distance|Matrix LiDAR|custom\.ts|grandPrix|maqueenPlusV2|b-gp" website/src website/test website/build.py microbit tools/grand-prix-druck*` → nur noch die Einträge in `ALTE_BLOCKTEXTE`, im Test und in Prüf-Regexen. Ergebnis in den Bericht.
- [ ] **Step 6: Commit** `build.py sperrt alte Blocktexte`.

### Task 6: `.hex` der Musterlösungen (nur wenn baubar)

**Files:**
- Create (falls baubar): `microbit/stations/03-fahrschule/loesung.hex`, `04-reflexe/loesung.hex`, `05-grand-prix/loesung.hex`, `05-grand-prix/loesung-profi.hex`
- Modify: die drei Stations-READMEs (Zeile „`.hex` aus v0.1.4 gebaut, am Gerät ungeprüft“)

- [ ] **Step 1:** Im Scratchpad je Lösung ein pxt-Projekt (`pxt.json` mit `"core":"*","radio":"*","microphone":"*","francor-maqueen":"file:<Pfad zur Erweiterung>"`, `main.ts` = `loesung*.js`). Die Erweiterung vorher sicher auf Tag `v0.1.4` (`git -C … diff v0.1.4 -- '*.ts' pxt.json` leer, sonst `git worktree add <scratch> v0.1.4` und den nehmen). Bauen mit dem `pxt` aus `pxt-francor-maqueen/node_modules` (`npx pxt build` im Projektordner, ggf. `PXT_FORCE_LOCAL=1`).
- [ ] **Step 2:** Geht es, `built/binary.hex` je Lösung kopieren. Geht es nicht: nichts anlegen, Fehlermeldung in den Bericht. Kein Workaround mit fremden Paketen.
- [ ] **Step 3:** `npm run check` → grün (prüft u. a., dass nichts Externes in `dist` ist). Commit `Musterlösungen als .hex (am Gerät ungeprüft)`.

### Nach den Tasks (Koordinator, nicht Subagenten)

1. Ein Review-Subagent auf **Fable 5.2** (`model: "fable"`) über `git diff master...HEAD` gegen `CLAUDE.md`; Funde in Kritisch / Wichtig / Klein an Martin.
2. Nacharbeit nach Martins Auswahl (Sonnet), Prüfung durch einen Sonnet-Subagenten.
3. Gerätedurchlauf mit Martin (Gerätetest 08 und 03 komplett).
4. Erst danach: `CLAUDE.md` (Regel 3 und 6, Aufbau, Stationstabelle, Technische Fakten, Offen) und `docs/02-offline-und-trockenlauf.md` (Block H Punkt 15, „Vorläufige Blocktexte (Grand Prix)“).
