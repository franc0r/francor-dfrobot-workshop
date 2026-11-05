# Grand Prix: Parcours, Aufgaben und Bibliothek — Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Station 6 wird zum Grand Prix mit Streckenskizze, Kreuzungsaufgaben und
Bibliothek „Grand Prix“; der Workshop wird 120 Minuten lang (105 Stationen + 15 Puffer),
Station 5 wird Pflicht.

**Architecture:** Die Seite bleibt, wie sie ist: Stationen als HTML-Fragmente, `build.py`
setzt sie zu einer Datei zusammen, `test/smoke.cjs` prüft die Offline-Datei mit
Playwright. Die Bibliothek ist eine `custom.ts`, die `vorlage.py` in die gemeinsame
MakeCode-Vorlage packt. Das Druckblatt ist eine eigene, nicht gebaute Datei unter `tools/`.

**Tech Stack:** HTML/CSS/Vanilla-JS, Python 3 (`build.py`, `vorlage.py`, `lzma`),
Node + Playwright (Smoketest), MakeCode Static TypeScript (`custom.ts`).

**Spec:** [docs/superpowers/specs/2026-11-04-grand-prix-parcours-design.md](../specs/2026-11-04-grand-prix-parcours-design.md)
mit Skizze [2026-11-04-grand-prix-parcours-skizze.html](../specs/2026-11-04-grand-prix-parcours-skizze.html).

## Global Constraints

- Branch `feature/grand-prix-parcours`; nicht nach `master` mergen (erst nach dem Trockenlauf).
- Nach jeder Aufgabe grün: `cd website && python3 build.py && npm test`.
- CLAUDE.md Regel 1: Offline-Datei ohne externe Verweise (Ausnahme MakeCode-Links). Kein Webfont, kein CDN.
- Regel 2: Bilder nur über `website/src/assets/`; die Skizze ist Inline-SVG.
- Regel 3: Blöcke als `.mcb` mit Kategoriefarbe. Neu: Grand Prix `#3C3C3C`, Klasse `.b-gp`.
- Regel 4: Deutsch, Klasse 7, Du/Ihr-Anrede, kurze Sätze. Betreuer-Wissen ins Handbuch.
- Regel 5 neu: 120 Minuten = 105 Stationsminuten + 15 Puffer. Stationen: 5, 13, 15, 14, 18, 10, 30.
- Regel 6: Neue Blocktexte gelten als vorläufig und kommen in die Prüfliste in `docs/02-offline-und-trockenlauf.md`.
- Kein Emoji auf der Seite; Symbole als Inline-SVG oder `PAT`-Bildchen.
- Zählfolge (fest bis zum Trockenlauf): 1 = K1 (Abzweig rechts + geradeaus), 2 = Stummel (Abzweig rechts + geradeaus), 3 = Tempo-Schild (Kreuzung +), 4 = Ziel (T).
- Laser-Blöcke wie in Station 5 (Modus Hindernisvermeidung, „Entfernungsmessung Vorne“), nicht Matrix-Punkt.

## Review Focus

1. **Dunkelmodus:** Matte und Band der Skizze bleiben weiß/schwarz, wenn das System dunkel ist. → Test in Task 4.
2. **Handybreite 360 px:** Station 6 erzeugt keinen waagerechten Scroll (Skizze und Tabellen). → Test in Task 4.
3. **Emoji/Tofu auf dem Pi:** In Station 6 und im Handbuch-Abschnitt steht kein Emoji. → Test in Task 4.
4. **Zählnummern verschieben sich nach dem Trockenlauf:** Jede Stelle, die eine Nummer nennt, steht in einer Liste in `microbit/stations/06-grand-prix/README.md`; die Skizze hat genau vier Nummern 1–4. → Test in Task 4, Liste in Task 7.
5. **Druckmaßstab:** Die Matte ist auf dem Blatt genau 100 × 200 mm. → Test in Task 6.

---

### Task 1: Bibliothek in die Vorlage

**Files:**
- Modify: `microbit/vorlage/vorlage.py`
- Modify: `microbit/vorlage/vorlage.mkcd` (neu erzeugt)
- Modify: `website/build.py` (`makecode_links` bzw. neue Funktion daneben)
- Modify: `microbit/vorlage/README.md`

**Interfaces:**
- Consumes: `microbit/bibliothek/custom.ts` (vorhanden; Namespace `grandPrix`, Blöcke `beiKreuzung(nr, aktion)`, `gezaehlt()`, `zuruecksetzen()`, Farbe `#3C3C3C`, `afterOnStart=true`).
- Produces: `vorlage.mkcd` enthält die Datei `custom.ts`; `build.py` bricht ab, wenn nicht.

- [ ] **Step 1: Prüfung in `build.py` schreiben.** `import json, lzma` ergänzen. Neue Funktion `check_vorlage(path: str) -> None`: Datei lesen, `lzma.decompress(data, format=lzma.FORMAT_ALONE)`, JSON laden, `json.loads(project["source"])` ergibt die Dateien. Abbruch per `SystemExit("Vorlage ohne Grand-Prix-Bibliothek (custom.ts) – python3 vorlage.py")`, wenn `custom.ts` fehlt, `namespace grandPrix` nicht darin steht oder `"custom.ts"` nicht in `pxt.json` → `files` steht. Aufruf in `makecode_links` vor dem Base64-Kodieren.
- [ ] **Step 2: Prüfen, dass es scheitert.** Run: `cd website && python3 build.py` → Expected: Abbruch mit „Vorlage ohne Grand-Prix-Bibliothek“.
- [ ] **Step 3: `vorlage.py` erweitern.** `custom.ts` aus `../bibliothek/custom.ts` (relativ zum Skript) lesen, in `files` aufnehmen und `"custom.ts"` in die `pxt.json`-Liste `files` hinter `main.ts` eintragen. Docstring um einen Satz ergänzen (Bibliothek „Grand Prix“ kommt aus `microbit/bibliothek/`). Danach `python3 microbit/vorlage/vorlage.py`.
- [ ] **Step 4: Prüfen, dass es läuft.** Run: `cd website && python3 build.py && npm test` → Expected: Build ohne Fehler, alle Smoketest-Punkte `ok` (der Link-Test vergleicht mit der neuen `vorlage.mkcd`).
- [ ] **Step 5: README der Vorlage ergänzen** (ein Absatz: was die Bibliothek kann, dass sie bewusst die Regeln nicht neu setzt, wo die Quelle liegt).
- [ ] **Step 6: Commit** `git add microbit website/build.py && git commit -m "Vorlage: Bibliothek Grand Prix eingebaut"`

### Task 2: 120 Minuten

**Files:**
- Modify: `website/build.py` (`check_times`)
- Modify: `website/src/app.js` (`STATIONS`, `TOTAL`, Kommentar „stellt wieder 90:00“)
- Modify: `website/src/topbar.html` (Anzeige `90:00`)
- Modify: `website/src/stations/06-grand-prix.html` (nur Eyebrow `30 Minuten`)
- Modify: `website/src/handbuch.html` (Zeitplan)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: Konstanten in `build.py`: `STATIONSMINUTEN = 105`, `PUFFER = 15` (Gesamt 120). Smoketest-Erwartung `sum === 105` und Timer `120:00`.

- [ ] **Step 1: Smoketest anpassen.** Kopfkommentar Punkt 3 auf „summieren auf 105 (+ 15 Puffer = 120)“. `check(sum === 105, 'Stationsminuten summieren auf 105 …')`. Neu nach dem Laden: `check(await page.$eval('#tval', e => e.textContent) === '120:00', 'Timer steht auf 120:00')`; nach „Neues Team“ dieselbe Prüfung mit Meldung `'"Neues Team" stellt 120:00'`.
- [ ] **Step 2: Prüfen, dass er scheitert.** Run: `cd website && python3 build.py && npm test` → Expected: FAIL bei Summe 105 und Timer.
- [ ] **Step 3: Umsetzen.** `check_times`: Summe muss `STATIONSMINUTEN` sein, Meldung nennt 105 und den Puffer. `STATIONS[6].m = "30 Min"`, Eyebrow Station 6 `30 Minuten`, `TOTAL = 120*60`, `topbar.html` `120:00`, Kommentar in `app.js` auf 120:00.
- [ ] **Step 4: Handbuch-Zeitplan.** Überschrift „Zeitplan · 120-Minuten-Slot“. Zeilen bis Station 5 bleiben (Station 5 Text siehe Task 3). Station 6: `1:15–1:45`, Text „Grand Prix. Strecke lesen, Kreuzungen einstellen, Lauf auf Zeit. Niemals streichen.“ (Rest der alten Zeile, soweit er noch stimmt). Neue letzte Zeile `1:45–2:00` **Puffer**: „Keine eigene Station. Dort einsetzen, wo es hakt – meist beim ersten Flashen (Station 1) oder im Grand Prix.“
- [ ] **Step 5: Prüfen.** Run: `cd website && python3 build.py && npm test` → Expected: alle `ok`.
- [ ] **Step 6: Commit** `git commit -am "Workshop auf 120 Minuten: Station 6 mit 30 Minuten, 15 Minuten Puffer"`

### Task 3: Station 5 wird Pflicht

**Files:**
- Modify: `website/src/stations/05-reflexe.html` (Eyebrow drittes Feld)
- Modify: `website/src/handbuch.html` (Zeitplanzeile Station 5, Abschnitt „Didaktik am Messestand“ Hinweis zu schnellen/langsamen Teams)
- Modify: `microbit/stations/05-reflexe/README.md`
- Modify: `website/test/smoke.cjs`

- [ ] **Step 1: Test.** `check(!(await page.$eval('.station[data-st="5"] .eyebrow', e => e.textContent)).includes('Bonus'), 'Station 5 ist keine Bonus-Station mehr')`.
- [ ] **Step 2: Prüfen, dass er scheitert** (`npm test` nach Build → FAIL).
- [ ] **Step 3: Umsetzen.** Eyebrow drittes Feld „Bonus“ → „Sensor“ (ein Wort wie bei den anderen Stationen). Die Staubsauger-Challenge (`data-bonus="staubsauger"`, Kasten „Bonus“ im Text) bleibt. Handbuch Zeile 1:05–1:15: „Bonus-Station: bei Zeitdruck überspringen …“ ersetzen durch „Pflicht – der Grand Prix braucht den Laser-Stopp.“; Hinweise, die Station 5 als streichbar nennen, anpassen. README: „Bonus, streichbar“ → „Pflicht; Station 6 baut darauf auf“.
- [ ] **Step 4: Prüfen** (`python3 build.py && npm test` → alle `ok`).
- [ ] **Step 5: Commit** `git commit -am "Station 5 ist Pflicht"`

### Task 4: Station 6 neu

**Files:**
- Modify: `website/src/stations/06-grand-prix.html` (Inhalt komplett neu, Kopf mit `data-st="6"`, Eyebrow `30 Minuten`, Fuß mit `data-next` bleiben)
- Modify: `website/src/styles.css` (`.b-gp`, Klassen der Skizze `#gpmap`)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Consumes: `.mcb`/`.mcstack`/`nestStack()` aus `app.js` (Einrückung `i1`/`i2` ist die Struktur), `.b-input`, `.b-basic`, `.b-mq`, `.b-music`, `.b-logic`, `.b-lidar`.
- Produces: `#gpmap` (Inline-SVG der Strecke, `viewBox="-3 -3 106 206"`, 1 Einheit = 1 cm, Klassen `<rect class="gp-mat">` für die Matte, `<text class="gp-k">` für die vier Nummern; die Kreise dahinter tragen eine andere Klasse), `.b-gp{background:#3C3C3C}`.

- [ ] **Step 1: Tests schreiben** (nach dem Station-3-Block in `smoke.cjs`, Station 6 vorher per `.stepbtn` öffnen):
  ```js
  check((await page.$eval('#gpmap', e => e.getBoundingClientRect().height)) > 120, 'Station 6: Streckenskizze wird gezeichnet');
  check(JSON.stringify(await page.$$eval('#gpmap .gp-k', l => l.map(e => e.textContent.trim()))) === '["1","2","3","4"]', 'Station 6: Skizze nummeriert 1–4');
  const gpText = await page.$eval('#gpmap', e => e.textContent);
  check(gpText.includes('Ziel') && gpText.includes('Pro-Ziel') && gpText.includes('Start'), 'Station 6: Start, Ziel und Pro-Ziel beschriftet');
  check(await page.$$eval('.station[data-st="6"] .mcb.b-gp', l => l.length >= 2 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(60, 60, 60)')), 'Station 6: Grand-Prix-Blöcke in Graphit');
  check(!/\p{Extended_Pictographic}/u.test(await page.$eval('.station[data-st="6"]', e => e.textContent)), 'Station 6: kein Emoji');
  ```
  Dazu Dunkelmodus und Handybreite in einem zweiten Kontext: `browser.newContext({ offline: true, colorScheme: 'dark', viewport: { width: 360, height: 800 } })`, `goto` wie im ersten Kontext, kurz warten, Station 6 per `.stepbtn[data-go="6"]` öffnen, dann
  `check(await p2.$eval('#gpmap .gp-mat', e => getComputedStyle(e).fill) === 'rgb(255, 255, 255)', 'Station 6: Matte bleibt im Dunkelmodus weiß')` und
  `check(await p2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Station 6: kein waagerechter Scroll bei 360 px')`.
- [ ] **Step 2: Prüfen, dass sie scheitern** (Build + `npm test` → FAIL bei allen neuen Station-6-Punkten).
- [ ] **Step 3: Skizze.** Geometrie aus `docs/superpowers/specs/2026-11-04-grand-prix-parcours-skizze.html` übernehmen (Pfade, Kisten, Tempo-Schild, Lücke, Nummern). Änderungen gegenüber der Vorlage: feste Hex-Farben für Matte (`#fff`) und Band (`#111`) wie bei den Maqueen-Figuren, Beschriftung über Tokens; kein Emoji (Zielflagge als kleines Schachbrett-SVG); Nummern als `<text class="gp-k">`; der Typ aus Sicht des Roboters steht **nicht** in der Skizze, das finden die Teams heraus (Martin, 05.11.2026); Ziel und Pro-Ziel als Wörter. Die gelbe Tempo-Zone bleibt.
- [ ] **Step 4: Seiteninhalt.** Reihenfolge und Inhalt aus dem Spec, Abschnitt „Aufgaben in Station 6“:
  - Einleitung (`goal`): Strecke lesen, Roboter einstellen, ins Ziel. Alle bekommen Gummibärchen, die Zeit wird nur gestoppt.
  - Kasten „Weiter im Projekt Linie“ (bisherigen Kasten anpassen) mit **Schritt 0**: `dauerhaft`-Blinkblock aus Station 4 löschen.
  - Block 01 „Strecke lesen“: Skizze + kurze Erklärung „Welche Kreuzung ist das für den Roboter? Er fährt – nicht ihr.“ (Rechts/links aus seiner Fahrtrichtung.) Dazu der Hinweis: „Für den Roboter sehen ① und ② gleich aus. Was muss nach ① anders sein?“
  - Block 02 „Euer Programm“: Schritte 1–3 als Stapel, Werte, die die Teams aus der Skizze finden sollen, als `???` (wie in Station 3):
    ```
    beim Start                                   (b-basic)
      i1 initialisiere Maqueen Plus V2           (b-mq)
    wenn Knopf A geklickt                        (b-input)
      i1 setze Kreuzungszähler zurück            (b-gp)
      i1 At Crossroads ???                       (b-mq)
      i1 At Left Turn and Straight Intersection Straight
      i1 At Right Turn and Straight Intersection ???
      i1 At T-junction ???
      i1 Line Following Settings Speed 2
      i1 Line patrolling ON
    wenn Kreuzung Nummer 1 erreicht              (b-gp)
      i1 At Right Turn and Straight Intersection ???
    wenn Kreuzung Nummer ??? erreicht            (b-gp)
      i1 spiele Melodie Entertainer im Hintergrund   (b-music; Block „spiele [Melodie …] [im Hintergrund]“, Liste Dadadum/Entertainer/Präludium/Ode/Nyan/…, am Gerät abgelesen 05.11.2026)
    ```
    `At Left Turn and Straight Intersection` ist mit `Straight` vorgegeben: Diese Kreuzung kommt auf der Strecke nicht vor, der Block schützt nur vor Fehlmessungen (ein Satz dazu auf der Seite). Danach Testzeile „Erster Lauf!“.
  - Block 03 „Ausbauen“: Tempo-Zone (`wenn Kreuzung Nummer ??? erreicht` → `Line Following Settings Speed 1`, `zeige Zahl 1`), Startampel (in Knopf A vor `Line patrolling ON`: `RGB Car Lights All color red`, `pausiere (ms) 1000`, `… yellow`, `pausiere (ms) 1000`, `… green`), Laser-Stopp in einem **neuen** `dauerhaft`-Block (der alte mit dem Blinken ist in Schritt 0 gelöscht worden, weil er die Laserabfrage bremst), Stapel wie in Station 5 (`Laser-Entfernungsmesser … Hindernisvermeidung initialisieren` in `beim Start`; im `dauerhaft`: `Hindernisvermeidungsdaten abrufen`, `wenn Hindernisvermeidungsmodus Entfernungsmessung Vorne (mm) < 200 dann` → `i2 Line patrolling OFF`).
  - Block 04 „Profi“: Pro-Ziel in Worten (am T warten, Laser prüfen, OFF, `PID Distance Control CW distance 20 cm Allow interruption` – drei Felder: Richtung, Strecke, Unterbrechung –, wieder ON, Kiste) und Blinker. Ein `<details>`-Tipp „Er macht nach dem Sprung, was er will?“ → „Was passiert mit euren Einstellungen, wenn ihr die Linienverfolgung ausschaltet?“ Keine fertige Lösung.
  - Block 05 „Das Rennen“: Start immer mit Knopf A auf Stufe 1–2, höher erst, wenn es klappt; Kiste erreicht = Lauf vorbei, Roboter zurück an den Start tragen, neuer Versuch; im Bogen keine „1“ auf dem Display = geblitzt, +3 s; alle bekommen Gummibärchen. Die alte Pokal-Zeile entfällt.
  - `note aha`, `trophy`, `stfoot` bleiben.
- [ ] **Step 5: CSS.** `.b-gp{background:#3C3C3C}` zu den anderen `.b-*`; Skizzenklassen neben `.mqfig`. In `styles.css` Zeile ≈ 128 `@media (max-width:900px){ .shell{grid-template-columns:1fr} }` auf `minmax(0,1fr)` ändern: Die Rail weitet sonst auf allen Stationen die Seite auf (gemessen 422–869 px bei 360 px Breite). Das Dreieck der Testzeilen (`<b>&#9654; Testen:</b>` in allen Stationen) wandert nach CSS (`.testline b::before{content:"\25B6\00a0"}`) und wird aus allen Stationen entfernt, sonst schlägt der Emoji-Test an (▶ ist `Extended_Pictographic`). Die Skizze wird auf schmalen Bildschirmen höchstens so breit wie der Inhalt (`max-width:100%`), auf breiten etwa 360 px, damit Skizze und Text nebeneinander passen.
- [ ] **Step 6: Prüfen** (`python3 build.py && npm test` → alle `ok`); dazu einmal `npm run serve` und Station 6 hell/dunkel ansehen.
- [ ] **Step 7: Commit** `git commit -am "Station 6: Grand Prix mit Streckenskizze und Kreuzungsaufgaben"`

### Task 5: Handbuch — Abschnitt Grand Prix

**Files:**
- Modify: `website/src/handbuch.html` (neuer `<section>` hinter „Am Vorabend“; Material-Abschnitt ergänzen)
- Modify: `website/test/smoke.cjs`

- [ ] **Step 1: Test.** Nach dem Öffnen des Handbuchs: `const hb = await page.$eval('#coach', e => e.textContent); const hbn = hb.replace(/\u00a0/g, ' '); check(['Zählfahrt', 'Minute 15', 'geblitzt', '10 cm', '30 cm'].every(w => hbn.includes(w)), 'Handbuch: Abschnitt Grand Prix vollständig')`.
- [ ] **Step 2: Prüfen, dass er scheitert.**
- [ ] **Step 3: Abschnitt „Grand Prix aufbauen und betreuen“** mit diesen Punkten (Inhalt aus dem Spec):
  - Aufbau: Strecke nach Klebeplan (`tools/grand-prix-druck.html`, Seite 2), Bauregel „keine Kiste, kein Bandende näher als 10 cm neben einer befahrenen Linie“, drei Kisten schwer oder festgeklebt, Papierschild „1“, 30 cm Freiraum um die Matte, Zuschauer nicht an die Kanten.
  - Zählfahrt beim Aufbau: Programm `dauerhaft → zeige Zahl (Kreuzungen gezählt)`, einmal abfahren, Nummern 1–4 prüfen.
  - Laufregeln: Start mit Knopf A, Kiste = Lauf vorbei → Roboter zurücktragen, Blitzer-Kriterium (keine „1“ im Bogen = +3 s), alle bekommen Gummibärchen.
  - Minute-15-Regel: kein erster Lauf bis Minute 15 → mit der Musterlösung Schritte 1–3 helfen (`microbit/stations/06-grand-prix/`).
  - Reset-Fallstrick: woran man ihn erkennt, welche Frage weiterhilft, dass er gewollt ist; zweite Stufe (fest `Right` in der Funktion, Stummel schlägt nach einem Halt zu).
  - Lösungstabelle der Zählfolge (Nummer, Stelle, Typ aus Sicht des Roboters, Regel).
  - Material-Abschnitt: Matte 100 × 200 cm, Isolierband 19 mm, drei Kisten, Schild, Gummibärchen.
  - Altlasten ersetzen: „Kurvenradius mindestens 15 cm – keine spitzen Ecken“ (Material), „Flipchart als Bestenliste“ (keine Rangliste mehr), „Parcours aufkleben und mit einem Roboter komplett abfahren“ (→ Zählfahrt). In „Ohne Internet arbeiten“ bei der Kategorien-Prüfung „Grand Prix“ ergänzen.
- [ ] **Step 4: Prüfen** (Build + `npm test` → alle `ok`).
- [ ] **Step 5: Commit** `git commit -am "Handbuch: Grand Prix aufbauen und betreuen"`

### Task 6: Druckblatt

**Files:**
- Create: `tools/grand-prix-druck.html`
- Create: `tools/grand-prix-druck-test.cjs` (nutzt Playwright aus `website/node_modules`)

**Interfaces:**
- Consumes: Geometrie aus `docs/superpowers/specs/2026-11-04-grand-prix-parcours-skizze.html` (dieselbe Zeichnung wie `#gpmap` in Task 4).

- [ ] **Step 1: Test schreiben.** `tools/grand-prix-druck-test.cjs`: lädt die Datei mit `require('../website/node_modules/playwright')`, Netzwerk aus wie in `smoke.cjs` (`browser.newContext({ offline: true })`), prüft
  - `document.querySelectorAll('.sheet').length === 2`
  - das Matten-Rechteck `rect.gp-mat` (im SVG) hat `getBoundingClientRect().width` ≈ `100 * 96 / 25.4` (±1 px) und Höhe ≈ `200 * 96 / 25.4`
  - `page.pdf({ format: 'A4' })` ergibt genau 2 Seiten (`(buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length === 2`)
  - keine `http`-Verweise im Quelltext.
  Exit-Code 1 bei Fehler, Ausgabe wie `smoke.cjs` (`ok`/`FAIL`).
- [ ] **Step 2: Prüfen, dass er scheitert.** Run: `node tools/grand-prix-druck-test.cjs` → FAIL (Datei fehlt).
- [ ] **Step 3: Blatt bauen.** Eine HTML-Datei ohne externe Verweise, `@page { size: A4 portrait; margin: 10mm }`, zwei `.sheet`-Seiten mit `break-after: page`:
  Das Blatt-SVG hat `viewBox="0 0 100 200"` und ist per CSS genau `100mm × 200mm` groß, ohne Rahmen (`border` gehört an ein umgebendes Element); Beschriftungen außerhalb der Matte stehen als HTML daneben.
  1. **Teamskizze:** Titel „Grand Prix – eure Strecke“, Matte 1:10 (100 × 200 mm via CSS-mm), Nummern 1–4, Start, Ziel, Pro-Ziel, Tempo-Zone; darunter eine leere Tabelle zum Ausfüllen: Nr. | Was ist das für den Roboter? | Was soll er tun?
  2. **Klebeplan (Betreuer):** dieselbe Zeichnung mit 10-cm-Gitter und cm-Maßen an jeder Linie, Kisten, Schild; Bauregeln; Zählfolge mit Lösung.
- [ ] **Step 4: Prüfen.** `node tools/grand-prix-druck-test.cjs` → alle `ok`; einmal im Browser drucken (Vorschau) und Maßstab mit Lineal prüfen.
- [ ] **Step 5: In `npm run check` aufnehmen.** `website/package.json`: `"check": "python3 build.py && node test/smoke.cjs && node ../tools/grand-prix-druck-test.cjs"`.
- [ ] **Step 6: Commit** `git add tools website/package.json && git commit -m "Druckblatt Grand Prix: Teamskizze und Klebeplan"`

### Task 7: Dokumentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `microbit/stations/06-grand-prix/README.md`
- Modify: `docs/02-offline-und-trockenlauf.md`
- Modify: `docs/01-konzept.md` (nur wo „90 Minuten“ bzw. Station 6 beschrieben ist)
- Modify: `README.md` (Repo-Wurzel, „90-Minuten“), `website/package.json` (`description`)

- [ ] **Step 1: CLAUDE.md.** Titelzeile „120-Minuten-Robotik-Workshop“; Regel 3 um „Grand Prix `#3C3C3C`“ (Bibliothek, `.b-gp`) ergänzen; Regel 5 „120 Minuten = 105 Stationsminuten + 15 Puffer“, `build.py` prüft die Stationssumme 105; Aufbau-Baum um `microbit/bibliothek/` (Bibliothek Grand Prix, kommt über `vorlage.py` in die Vorlage) und `tools/grand-prix-druck.html` ergänzen; Stationstabelle: Station 5 ohne „Bonus, streichbar“, Station 6 mit 30 Min und Kern „Strecke lesen, Kreuzungen einstellen, Tempo-Zone, Laser-Stopp, Lauf auf Zeit“; Abschnitt zur Linienverfolgung um die Fakten „`Line patrolling OFF` löscht die Kreuzungsregeln (Martin am Gerät, 03.11.2026)“ und „Kreuzungsblöcke `At Crossroads / T-junction / Left Turn and Straight / Right Turn and Straight Intersection` (Gruppe V3)“; Timer-Erwähnungen 120.
- [ ] **Step 2: README Station 6.** Was die Musterlösung tut (normal und Profi, in Worten), Zählfolge, Hinweis: `.hex`/`bloecke.png` nach dem Trockenlauf. **Liste aller Stellen mit Zählnummern**: Station 6 (Skizze `#gpmap`, Block „Kreuzung Nummer 1“), Handbuch-Lösungstabelle, `tools/grand-prix-druck.html` (beide Seiten), diese README.
- [ ] **Step 3: docs/02.** Block G: Akku über 120 Minuten plus Aufbau. Neuer Prüfpunkt Grand Prix mit den Punkten 0–10 aus „Offen für den Trockenlauf“ im Spec. Vorläufige Blocktexte ergänzen: die drei Grand-Prix-Blöcke, `PID Distance Control`, die vier Kreuzungsblöcke.
- [ ] **Step 4: Prüfen.** `grep -rn "90 Min\|90-Min\|90:00\|90 Minuten" CLAUDE.md README.md website/package.json website/src docs/01-konzept.md docs/02-offline-und-trockenlauf.md` → nur noch Treffer, die nichts mit der Workshopdauer zu tun haben (z. B. „90°“). Dann `cd website && python3 build.py && npm test` → alle `ok`.
- [ ] **Step 5: Commit** `git commit -am "Doku: 120 Minuten, Station 5 Pflicht, Grand Prix"`
