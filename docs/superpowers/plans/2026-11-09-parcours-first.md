# Parcours first – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Workshop-Seite auf sechs Stationen umbauen, in denen ab dem Roboter nur noch vorkommt, was das Grand-Prix-Programm braucht, beide Simulatoren entfernen und den Text je Station auf ein geprüftes Budget kürzen.

**Architecture:** Statische Seite aus `website/src/*` (eine HTML-Datei je Station, ein `app.js`, ein `styles.css`), die `build.py` zu einer Offline-Datei zusammensetzt und `test/smoke.cjs` mit Playwright prüft. Der Umbau ist reine Inhalts- und Strukturarbeit: Dateien zusammenlegen und umnummerieren, Code der Simulatoren löschen, Texte kürzen, eine neue Prüfung in `build.py`, Musterlösungen und Handbuch nachziehen.

**Tech Stack:** HTML/CSS/Vanilla JS, Python 3 (`build.py`), Node + Playwright (`npm test`), MakeCode-JavaScript in `microbit/stations/*/loesung*.js`.

**Spec:** `docs/superpowers/specs/2026-11-09-parcours-first-design.md`

## Global Constraints

- Regel 1 (offline): kein externer Verweis; MakeCode-Links nur als `href="makecode:neu"` / `href="makecode:vorlage"` im Quelltext.
- Regel 3: Blöcke nur als `.mcb`-Nachbildungen mit Kategoriefarbe; Grundlagen `b-basic`, Eingabe `b-input`, Musik `b-music`, Logik `b-logic`, Variablen `b-var`, Maqueen `b-mq`, Matrix LiDAR `b-lidar`, Grand Prix `b-gp`. Einrückung `i1`/`i2` ist die Struktur (`nestStack()`).
- Regel 4: Deutsch, Klasse 7, Du-Anrede an Schüler, Betreuer-Erklärungen nur ins Handbuch.
- Regel 5: Stationsminuten summieren auf 105, Puffer 15. Eyebrow-Minuten = `STATIONS`-Array in `app.js` = Zeitplan im Handbuch. Neue Verteilung: **5 / 15 / 15 / 20 / 10 / 40**.
- Dateinamen `website/src/stations/NN-name.html` mit `data-st="N"` in Reihenfolge 0–5; gleiche Nummer und Name für `microbit/stations/NN-name/`.
- Textbudget je Station (Tags entfernen, alle Wörter zählen): **200 / 350 / 550 / 500 / 300 / 800**.
- Roboter-Stationen (3–5) zeigen nur Blöcke aus `microbit/stations/05-grand-prix/loesung.js` bzw. `loesung-profi.js`.
- Blocktexte wie heute auf der Seite (bestätigt oder vorläufig laut `CLAUDE.md`); neu und vorläufig: `zeige Zahl (Beschleunigung (mg) y)` in Station 2.
- Arbeitsablauf nach jeder Aufgabe: `cd website && python3 build.py && npm test` grün. Commits in `master` nur, wenn Martin es sagt; die Commit-Schritte unten setzen das voraus.

## Review Focus

1. **Alter Fortschritt im Browser.** `localStorage` `mgp-v1` eines Arbeitsplatzes kann `cur: 6` und `done: [0..6]` aus der Siebener-Fassung enthalten. Erwartung: Seite lädt ohne JS-Fehler, zeigt Station 0 oder die letzte gültige Station, Abzeichenleiste zeigt höchstens 6. Test in Aufgabe 2.
2. **Reihenfolge der Dateien.** `build.py` sortiert `stations/*.html` alphabetisch und prüft `data-st`. Eine vergessene alte Datei (`04-augen.html`) lässt den Build abbrechen. Test: Aufgabe 2 löscht und prüft Build.
3. **Textbudget trifft `&nbsp;` und Entities.** `10&nbsp;cm` zählt nach dem Tag-Entfernen als ein Wort, `&ndash;` als eins. Das ist gewollt; die Zählung in Aufgabe 6 dokumentiert es im Kommentar und der Test prüft mit einer bekannten Zahl.
4. **Not-Aus und Laser-Stopp in beiden Richtungen.** Seite (Station 3, 4, 5) und Musterlösungen (`03-fahrschule`, `04-reflexe`, `05-grand-prix`) müssen dieselben Blöcke zeigen. Test in Aufgabe 8: `grep` auf `Patrolling.OFF` und `CarLightColors.Red` in allen drei Lösungen.
5. **Handbuch-Zeitplan driftet.** `build.py` prüft den Handbuch-Zeitplan nicht. Test in Aufgabe 7: Smoke-Test prüft, dass das Handbuch die sechs Zeitfenster `0:00–0:05`, `0:05–0:20`, `0:20–0:35`, `0:35–0:55`, `0:55–1:05`, `1:05–1:45` und `1:45–2:00` enthält.

---

### Task 1: Beide Simulatoren entfernen

**Files:**
- Modify: `website/src/app.js` (Abschnitt `/* === SIMULATOR === */` ab Zeile 242 bis vor `/* === micro:bit SIMULATOR === */`; im micro:bit-Abschnitt alles außer `PAT`, `nestStack()`, `mcLevel()`, `ledIcon()`; Zustand `S.levels`, `S.mb`; Boot-Zeilen `buildPalette(); buildLevSel(); mbInit(); setLevel(0);` und der `resize`/`matchMedia`-Handler, der `draw` ruft)
- Modify: `website/src/styles.css` (Block `/* simulator */` Zeile 459–552 inkl. Feuerwerk, Block `/* --- micro:bit board --- */` ab Zeile 628 bis Dateiende des Abschnitts, Zeile 260 „schmale Simulator-Spalte“, Zeile 350/367 nur falls sie `.sim` betreffen)
- Modify: `website/src/stations/02-microbit-allein.html` (Kasten `<div class="sim" id="mbsim">` komplett raus; drei Sätze „Probiert es zuerst im Simulator oben, Reiter …“ und „Schaut im Simulator oben, Reiter 3“ ersetzen)
- Modify: `website/src/stations/03-fahrschule.html` (Kasten `<div class="sim" id="sim">` Zeile 89–116 raus; Satz „Löse die ersten beiden Parcours im Simulator …“ im `goal` raus; Hinweis „kennt ihr aus Parcours 3 im Simulator“ raus)
- Modify: `website/test/smoke.cjs` (Kopfkommentar Punkte 4 und 5; Abschnitte „Station 2: micro:bit-Simulator“ und „Station 3: Parcours-Simulator“)
- Modify: `website/README.md:73` (Zeile „Simulator-Level“ raus)

**Interfaces:**
- Produces: `app.js` exportiert weiterhin (innerhalb der IIFE) `PAT`, `ledIcon(name)`, `nestStack(stack)`; `S = {done:[], quiz:{}, bonus:{}, cur:0, safe:false}` ohne `levels`/`mb`. `load()` muss ein altes `S` mit `levels`/`mb` weiter lesen (ignorieren, nicht abstürzen).

- [ ] **Step 1: Smoke-Test anpassen (fehlschlagend)**

Die Abschnitte „Station 2: micro:bit-Simulator“ und „Station 3: Parcours-Simulator“ löschen. Stattdessen:

```js
// Station 2 und 3: keine eigenen Simulatoren mehr (Martin, 09.11.2026)
check((await page.$('#mbsim')) === null && (await page.$('#sim')) === null, 'keine Simulator-Kästen auf der Seite');
check(!/Reiter/.test(await page.$eval('.station[data-st="2"]', e => e.textContent)), 'Station 2: kein Verweis auf Simulator-Reiter');
check(/MakeCode/.test(await page.$eval('.station[data-st="2"] .block:nth-of-type(1)', e => e.textContent)), 'Station 2: verweist auf den MakeCode-Simulator');
```

Kopfkommentar: Punkt 4 wird „4. Keine eigenen Simulatoren; Station 2 verweist auf den MakeCode-Simulator.“, Punkt 5 entfällt, folgende neu nummerieren.

- [ ] **Step 2: Bauen und testen, Fehlschlag sehen**

Run: `cd website && python3 build.py && npm test`
Expected: FAIL bei „keine Simulator-Kästen auf der Seite“.

- [ ] **Step 3: Simulator-Kästen aus Station 2 und 3 entfernen, Sätze ersetzen**

Station 2, Schritt 1: „Probiert es zuerst im Simulator oben, Reiter 1 · Zeichnen.“ → „Probiert es im Simulator in MakeCode, links neben den Blöcken.“ Schritt 2 und 3: denselben Satz ohne Reiter; Schritt 3 zusätzlich: der MakeCode-Simulator kippt, wenn ihr mit der Maus über die Platine fahrt, und zeigt einen Knopf SHAKE, sobald `wenn geschüttelt` im Programm ist. Satz „Schaut im Simulator oben, Reiter 3 · Neigen. Unter dem Gerät seht ihr die Zahl“ ersetzen durch die Anleitung aus Step 4.

- [ ] **Step 4: Station 2 Schritt 3: Extra „Die Zahl sehen“**

Hinter der Tabelle (flach / Logo oben / Logo unten) ein `.mcstack` mit Einrückung:

```html
<div class="mcb b-basic">dauerhaft</div>
<div class="mcb b-basic i1">zeige Zahl <span class="mcr b-input">Beschleunigung (mg) <b>y</b></span></div>
```

und ein Satz: Ladet das herunter und kippt den micro:bit in der Hand – die Zahl läuft. `zeige Zahl` liegt in Grundlagen, `Beschleunigung` in Eingabe. Die Tabelle bleibt, der „Regler“ wird nicht mehr erwähnt.

- [ ] **Step 5: Code in `app.js` und `styles.css` löschen**

Löschen wie unter Files beschrieben. `S` ohne `levels`/`mb`; in `load()` keine Migration nötig, aber kein Zugriff auf die Felder mehr. Der `resize`-Handler und `matchMedia` im Boot entfallen ganz (sie riefen nur `draw` des Parcours).

- [ ] **Step 6: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün, insbesondere „keine JavaScript-Fehler“ und „Herz-Symbol in Blöcken als 5×5-Bild“.

- [ ] **Step 7: Commit**

```bash
git add website/src website/test website/README.md website/dist
git commit -m "Beide Simulatoren entfernen; Station 2 nutzt den MakeCode-Simulator"
```

---

### Task 2: Stationen 3+4 zusammenlegen, 5 und 6 umnummerieren, Minuten neu

**Files:**
- Create: `website/src/stations/03-fahrschule.html` (neuer Inhalt, ersetzt die alte Datei)
- Delete: `website/src/stations/04-augen.html`
- Rename: `05-reflexe.html` → `04-reflexe.html`, `06-grand-prix.html` → `05-grand-prix.html` (nur `data-st`, Eyebrow, `data-next`/`data-prev`, Minuten; Inhalt kommt in Task 3 und 4)
- Modify: `website/src/stations/01-erster-kontakt.html` (Eyebrow 15 Minuten), `02-microbit-allein.html` (`data-next="3"` bleibt)
- Modify: `website/src/app.js:6-14` (`STATIONS`)
- Modify: `website/test/smoke.cjs` (Struktur, Selektoren mit `data-st`, Station-5-Prüfungen)

**Interfaces:**
- Produces: `STATIONS = [Boxenstopp 5 Rookie, Erster Kontakt 15 Ersteinschalter, micro:bit allein 15 Pixelkünstler, Fahrschule 20 Spurhalter, Reflexe 10 Bremsassistent, Grand Prix 40 Champion]`. Quiz-IDs: Station 3 behält `q3` (aus 04-augen), Station 4 `q4`.
- Consumes: aus Task 1 nur `nestStack()`.

- [ ] **Step 1: Smoke-Test anpassen (fehlschlagend)**

```js
check(n === 6, 'sechs Stationen (gefunden: ' + n + ')');
check(JSON.stringify(mins) === '[5,15,15,20,10,40]', 'Minuten 5/15/15/20/10/40 (' + mins.join('/') + ')');
check(await page.$$eval('.stepbtn .min', s => s.filter(x => /\d/.test(x.textContent)).length) === 6, 'Stückliste: zählt nicht zu den Stationsminuten');
// Station 3: zusammengelegt
const st3 = await page.$eval('.station[data-st="3"]', e => e.textContent);
check(/Line patrolling ON/.test(st3) && /RGB Car Lights/.test(st3) && !/steuere/.test(st3) && !/wiederholen/.test(st3), 'Station 3: Linie und Ampel, keine Motorblöcke');
check((await page.$('#mqinsert')) !== null && (await page.$('.station[data-st="3"] table.fix')) !== null, 'Station 3: Einsetz-Figur und Sensortabelle');
// alter Fortschritt aus der Siebener-Fassung
await page.evaluate(() => localStorage.setItem('mgp-v1', JSON.stringify({done:[0,1,2,3,4,5,6], quiz:{}, bonus:{}, cur:6, safe:true})));
await page.reload(); await page.waitForTimeout(300);
check(await page.$$eval('.station:not(.page)', s => s.some(e => !e.hidden)), 'alter Fortschritt (cur 6): eine Station ist sichtbar');
check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) <= 6, 'alter Fortschritt: höchstens sechs Abzeichen');
await page.click('#resetbtn'); await page.waitForTimeout(200); await page.click('#safetyok');
```

Die bisherigen Prüfungen „Station 5: zwei wenn/sonst-Blöcke“ und „Station 5 ist keine Bonus-Station“ löschen (Inhalt kommt in Task 3). Alle `data-st="5"`/`"6"`-Selektoren auf `"4"`/`"5"` umstellen (`#gpmap`, `.b-gp`, Dunkelmodus-Test, Kommentar „Station 6“ → „Station 5“).

- [ ] **Step 2: Bauen, Fehlschlag sehen**

Run: `cd website && python3 build.py`
Expected: SystemExit „Stationsminuten summieren auf …“ oder „data-st passt nicht“, sobald Dateien bewegt sind; vorher FAIL „sechs Stationen“ im Test.

- [ ] **Step 3: Dateien bewegen**

```bash
cd website/src/stations
git mv 05-reflexe.html 04-reflexe.html
git mv 06-grand-prix.html 05-grand-prix.html
git rm 04-augen.html
```

In `04-reflexe.html`: `data-st="4"`, Eyebrow „Station 4 · 10 Minuten · Reflexe“, Zurück `data-next="3"`, Weiter `data-next="5"`. In `05-grand-prix.html`: `data-st="5"`, Eyebrow „Station 5 · 40 Minuten · Finale“, Zurück `data-next="4"`. In `01-erster-kontakt.html`: Eyebrow 15 Minuten.

- [ ] **Step 4: `03-fahrschule.html` neu schreiben**

Eyebrow „Station 3 · 20 Minuten · Fahrschule“, `h2` „Der Roboter fährt die Linie“, ein Satz `goal`. Aufbau in dieser Reihenfolge, Budget 500 Wörter:

1. `note fresh` mit Knopf `href="makecode:vorlage"`, Text: Projekt unten neben Herunterladen **Linie** nennen, Station 5 braucht es wieder.
2. Block 01 „Roboter anschließen“: Figur `#mqinsert` unverändert aus der alten Datei (Zeilen 16–82) samt Bildunterschrift; darunter die `note warn` „Immer zuerst: initialisiere Maqueen Plus V2“ (X blinkt / Haken) aus der alten Datei, auf drei Sätze gekürzt.
3. Block 02 „Wie ein Liniensensor sieht“: Tabelle `table.fix` (weiß ≈ 3800, schwarz ≈ 2700) und `note` „Kalibrieren – schon erledigt“ aus `04-augen.html`, Zeilen 15–30.
4. Block 03 „Knopf A: Ampel, dann fährt er“: `.mcstack` genau mit dem Programm aus dem Spec (beim Start / Knopf A mit fünf Ampelblöcken, `Line Following Settings Speed 1`, `Line patrolling ON` / Knopf B `OFF`). Ein Satz zu „… mehr, Gruppe V3“ und zu den englischen Wörtern. Reihenfolge-Liste (herunterladen, USB ab, auf den Teststreifen am Boden stellen, einschalten, A drücken, B hält an). Testen-Zeile. `note aha` „Der eigentliche Aha-Moment“ auf zwei Sätze gekürzt.
5. Quiz `q3` aus `04-augen.html` unverändert.
6. `note warn` „Wenn es klemmt“ mit zwei Punkten: Kurve verlassen → kleinere Speed; Linie nicht gefunden → neu kalibrieren (Calc-Key 2 s). Der Satz zum Sonnenlicht geht ins Handbuch.
7. Nav: Zurück `data-next="2"`, Abzeichen Spurhalter, Weiter `data-next="4"` „Weiter zu den Reflexen“.

Nicht übernehmen: Parcours-Simulator, Motorblöcke, Drehung, Quadrat, Zahlengefühl, Extra „So entsteht die Erweiterung“, Rot-Blau-Blinken.

- [ ] **Step 5: `STATIONS` in `app.js`**

```js
var STATIONS = [
  {n:"Boxenstopp", m:"5 Min", badge:"Rookie"},
  {n:"Erster Kontakt", m:"15 Min", badge:"Ersteinschalter"},
  {n:"micro:bit allein", m:"15 Min", badge:"Pixelkünstler"},
  {n:"Fahrschule", m:"20 Min", badge:"Spurhalter"},
  {n:"Reflexe", m:"10 Min", badge:"Bremsassistent"},
  {n:"Grand Prix", m:"40 Min", badge:"Champion"}
];
```

In `load()` nach dem Parsen: `if(typeof S.cur === "number" && S.cur >= STATIONS.length) S.cur = 0; S.done = S.done.filter(function(i){ return i < STATIONS.length; });`

- [ ] **Step 6: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün.

- [ ] **Step 7: Commit**

```bash
git add -A website/src website/test website/dist
git commit -m "Sechs Stationen: Fahrschule und Augen zusammengelegt, Minuten 5/15/15/20/10/40"
```

---

### Task 3: Station 4 Reflexe nur noch Laser-Stopp im Projekt Linie

**Files:**
- Modify: `website/src/stations/04-reflexe.html`
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: Station 4 zeigt genau einen Logik-Block `wenn … dann` (kein `ansonsten`), keine `.b-var`-Blöcke.

- [ ] **Step 1: Smoke-Test (fehlschlagend)**

```js
const st4 = await page.$eval('.station[data-st="4"]', e => e.textContent);
check(/Line patrolling OFF/.test(st4) && !/ansonsten/.test(st4) && !/steuere/.test(st4) && !/pausiert/.test(st4), 'Station 4: Laser-Stopp ohne Motorblöcke, ohne ansonsten, ohne Variable');
check(await page.$$eval('.station[data-st="4"] .mcc[data-c="b-logic"]', l => l.length) === 1, 'Station 4: genau ein wenn-Block');
check((await page.$$('.station[data-st="4"] .mcb.b-var')).length === 0, 'Station 4: keine Variablen-Blöcke');
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag sehen**

Run: `cd website && python3 build.py && npm test`
Expected: FAIL „Station 4: Laser-Stopp …“.

- [ ] **Step 3: Inhalt neu schreiben, Budget 300 Wörter**

1. `note fresh` wird „Weiter im Projekt Linie“: kein neues Projekt; Haus-Symbol → Meine Projekte → Linie. Rückfall-Knopf `href="makecode:vorlage"` als `btn sec` bleibt.
2. Block 01 „Der Laserscanner vorne“: zwei Sätze (8×8 Strahlen, misst in Millimetern) plus `note` „Eigene Blöcke“ auf zwei Sätze.
3. Block 02 „Die Bedingung“: `.mcstack` mit dem Programm aus dem Spec (beim Start: `initialisiere Maqueen Plus V2`, Laser-Init; dauerhaft: `Hindernisvermeidungsdaten abrufen`, `wenn Entfernung Vorne (mm) < 200 dann` → `Line patrolling OFF`, `RGB Car Lights All color red`). Die dreistufige Bauanleitung („Erst die Form, dann der Inhalt“) bleibt, gekürzt auf die drei Listenpunkte ohne Vorspann. Testen: Roboter fährt die Linie, Hand davor, er bleibt stehen und leuchtet rot; Knopf A startet neu.
4. Quiz `q4` bleibt (Denkfrage dauerhaft vs. beim Start).
5. Nav unverändert.

Raus: Block 03 Variablen, Pausenknopf, Staubsauger-Bonus, Extra `spiele Ton`, `SET PIN P1`, `setze die Helligkeit`, `ansonsten`, `oder`.

- [ ] **Step 4: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src/stations/04-reflexe.html website/test/smoke.cjs website/dist
git commit -m "Station 4 Reflexe: nur der Laser-Stopp im Projekt Linie"
```

---

### Task 4: Station 5 Grand Prix ohne Schritt 0 und Startampel, Variable im Profi-Teil

**Files:**
- Modify: `website/src/stations/05-grand-prix.html`
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: Profi-Teil enthält einen `.mcstack` mit mindestens einem `.mcb.b-var`.

- [ ] **Step 1: Smoke-Test (fehlschlagend)**

```js
const st5 = await page.$eval('.station[data-st="5"]', e => e.textContent);
check(!/Schritt 0/.test(st5) && !/Rot-Blau/.test(st5), 'Station 5: kein Schritt 0, kein Blinken mehr');
check(/Station 4/.test(st5) && !/Station 6/.test(st5), 'Station 5: verweist auf Station 4, nicht mehr auf 6');
check(await page.$$eval('.station[data-st="5"] .mcb.b-var', l => l.length >= 1 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(220, 20, 60)')), 'Station 5: Variablen-Block im Profi-Teil in Rot');
```

- [ ] **Step 2: Fehlschlag sehen**

Run: `cd website && python3 build.py && npm test`
Expected: FAIL „Station 5: kein Schritt 0 …“.

- [ ] **Step 3: Inhalt anpassen, Budget 800 Wörter**

1. `note fresh` „Weiter im Projekt Linie“: Absatz „Schritt 0“ raus; der Absatz „Der Rest darf bleiben …“ wird: Ampel, Not-Aus (Knopf B) und Laser-Stopp habt ihr schon. Die Kreuzungsregeln kommen in Knopf A **vor** die Ampel.
2. Block 02 „Euer Programm“: der `.mcstack` zeigt das vollständige Normalprogramm (beim Start mit Laser-Init; Knopf A mit Zähler-Reset, vier Kreuzungsregeln mit `???`, `Speed 2`, Ampel, `Line patrolling ON`; Knopf B `OFF`; `wenn Kreuzung Nummer 1 erreicht`; `wenn Kreuzung Nummer ??? erreicht` Melodie; dauerhaft Laser-Stopp). Teams mit Projekt Linie fügen nur die grauen und die Kreuzungsblöcke ein; wer neu startet, baut alles nach.
3. Block 03 „Ausbauen“: nur noch Tempo-Zone. Startampel und „Vor der Kiste anhalten“ raus.
4. Block 04 Profi: „Wie beim Pausenknopf in Station 5“ ersetzen durch einen `.mcstack`:

```html
<div class="mcb b-input">wenn Knopf A geklickt</div>
<div class="mcb b-var i1">setze <b>gesprungen</b> auf <span class="mcr b-logic"><b>falsch</b></span></div>
```

und ein Satz: Nach dem Sprung setzt ihr `gesprungen` auf wahr; die Melodie spielt nur, wenn `gesprungen` wahr ist. Variable anlegen: Variablen → Erstelle eine Variable.
5. „Den Laser kennt ihr aus Station 5“ → Station 4. Absatz „Wo das, was ihr heute gebaut habt, wirklich fährt“ raus (geht ins Handbuch, Task 7).

- [ ] **Step 4: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün, inkl. „Station 5: Skizze nummeriert 1–4“.

- [ ] **Step 5: Commit**

```bash
git add website/src/stations/05-grand-prix.html website/test/smoke.cjs website/dist
git commit -m "Station 5 Grand Prix: Ampel und Laser-Stopp kommen aus Station 3 und 4"
```

---

### Task 5: Stationen 0, 1, 2 kürzen

**Files:**
- Modify: `website/src/stations/00-boxenstopp.html`, `01-erster-kontakt.html`, `02-microbit-allein.html`

**Interfaces:**
- Consumes: Blockstapel bleiben unverändert (Station 1: `beim Start:1`, `dauerhaft:4` laut Smoke-Test).

- [ ] **Step 1: Wörter zählen (Ausgangslage)**

Run: `cd website/src/stations && for f in 0*.html; do printf "%s %s\n" "$f" "$(sed -e 's/<[^>]*>/ /g' "$f" | wc -w)"; done`
Expected: 00 ≈ 271, 01 ≈ 423, 02 > 550.

- [ ] **Step 2: Kürzen nach den Schreibregeln des Specs**

Station 0 (Ziel ≤ 200): `goal` ein Satz; Legende der acht Bauteile je ein Halbsatz; Regelkreis-Treppe bleibt; Aufwärm-Frage auf drei Antworten (Antwort D „Lichtsensor“ streichen, Lösung bleibt C).
Station 1 (≤ 350): Einleitung ein Satz; „So bedient ihr MakeCode“ bleibt als drei Zeilen; „Genau das ist der Unterschied“ auf zwei Sätze; „Wenn es klemmt“ zwei Punkte.
Station 2 (≤ 550): Einleitung ein Satz; „Warum das clever ist“ raus (33 Millionen → Handbuch); „Der wichtigste Satz des Workshops“ auf zwei Sätze; „Frei hinlegen“ auf einen Satz; Würfel-Challenge bleibt; „Wenn es klemmt“ zwei Punkte.

- [ ] **Step 3: Zählen**

Run: wie Step 1.
Expected: 00 ≤ 200, 01 ≤ 350, 02 ≤ 550.

- [ ] **Step 4: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src/stations/0[012]-*.html website/dist
git commit -m "Stationen 0–2: Text gekürzt"
```

---

### Task 6: Textbudget in `build.py`

**Files:**
- Modify: `website/build.py` (Funktion `stations()`, neue Konstante neben `STATIONSMINUTEN`)

**Interfaces:**
- Produces: `TEXTBUDGET = [200, 350, 550, 500, 300, 800]`; `wortzahl(body: str) -> int` (Tags per `re.sub(r'<[^>]*>', ' ', body)` entfernen, `len(.split())`); `stations()` bricht mit `SystemExit("Station %s: %d Wörter, Budget %d")` ab.

- [ ] **Step 1: Prüfung schreiben**

`wortzahl()` und die Prüfung in `stations()` einbauen, Kommentar: zählt stumpf alle Wörter nach dem Tag-Entfernen, `&nbsp;`-Paare zählen als ein Wort (Spec, Abschnitt Textbudget).

- [ ] **Step 2: Fehlschlag erzwingen**

`TEXTBUDGET[0]` vorübergehend auf 10 setzen.
Run: `cd website && python3 build.py`
Expected: `Station 00-boxenstopp.html: NNN Wörter, Budget 10`. Danach zurück auf 200.

- [ ] **Step 3: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün; `build.py` gibt je Station die Wortzahl aus (eine Zeile, z. B. `Station 3: 412/500 Wörter`).

- [ ] **Step 4: Commit**

```bash
git add website/build.py
git commit -m "build.py prüft ein Textbudget je Station"
```

---

### Task 7: Handbuch und Sicherheitsfenster

**Files:**
- Modify: `website/src/handbuch.html` (Zeilen 10–17 Zeitplan; 29 Material; 49, 118, 178 Knopf-Verweise; 65 „Station 6 dauert 30“; 105 Funktion bleibt; 135, 141, 195–200 Didaktik/Rückfall; 169 „Station 5/6“; 208 Aufbocken)
- Modify: `website/src/sicherheit.html` (unverändert prüfen; Regel „Am Tisch nur mit frei drehenden Rädern“ bleibt)
- Modify: `website/test/smoke.cjs` (Handbuch-Prüfung)

**Interfaces:**
- Produces: Zeitplan-Zeilen `0:00–0:05 Boxenstopp`, `0:05–0:20 Erster Kontakt`, `0:20–0:35 micro:bit allein`, `0:35–0:55 Fahrschule`, `0:55–1:05 Reflexe`, `1:05–1:45 Grand Prix`, `1:45–2:00 Puffer`.

- [ ] **Step 1: Smoke-Test (fehlschlagend)**

```js
check(['0:00–0:05', '0:05–0:20', '0:20–0:35', '0:35–0:55', '0:55–1:05', '1:05–1:45', '1:45–2:00'].every(w => hbn.includes(w)), 'Handbuch: Zeitplan mit sechs Stationen und Puffer');
check(hbn.includes('Teststreifen') && !hbn.includes('Simulator') && !hbn.includes('Quadrat'), 'Handbuch: Teststreifen drin, Simulator und Quadrat raus');
```

- [ ] **Step 2: Fehlschlag sehen**

Run: `cd website && python3 build.py && npm test`
Expected: FAIL „Handbuch: Zeitplan …“.

- [ ] **Step 3: Handbuch ändern**

1. Zeitplan: sieben Zeilen wie unter Interfaces; Texte: Erster Kontakt bleibt „kritischste Phase“; micro:bit allein ohne Simulator-Satz; Fahrschule: Vorlage, einstecken, Haken, Linie auf Knopf A mit Ampel, Teststreifen am Boden, Wow-Moment; Reflexe: Laser-Stopp im Projekt Linie; Grand Prix 40 Minuten.
2. Material je Team: Aufbocken bleibt; neu: **Teststreifen**: A3-Blatt oder Mattenrest mit 60 cm geradem Isolierband, liegt am Boden neben dem Tisch; darauf testen Station 3 und 4.
3. Zeile 65 „Station 6 dauert 30 Minuten“ → „Station 5 dauert 40 Minuten“; Minute-15-Regel bleibt absolut.
4. Zeilen 49, 118, 178: „Station 3“ bleibt für den Knopf; 178 „(Station 3, 4 oder 5)“ → „(Station 3; Rückfall in 4 und 5)“. Zeile 169 „Station 5/6“ → „Station 4/5“.
5. Zeile 135: „Diese Seite samt beider Simulatoren“ → „Diese Seite“. Zeile 141: letzte Rückfallebene wird „Station 0 plus Vorführroboter plus fertige `.hex` aus `microbit/stations/` per Laufwerk MICROBIT“.
6. Zeilen 195–200: Nachzügler steigen bei Station 1 ein; „Station 2 funktioniert auch ohne Roboter“ bleibt ohne „Simulator“; zu schnelle Teams: Würfel (Station 2) und Profi-Teil des Grand Prix; zu langsame Teams: Würfel weglassen, Puffer nutzen; „setzt Abzeichen, Simulator und Timer zurück“ → „Abzeichen und Timer“.
7. Zeile 13 Funktionen-Absatz raus; Zeile 105 bleibt.
8. Neuer Abschnitt „Was ihr nebenbei erzählen könnt“ (vor den Störungen): drei Absätze zu je zwei Sätzen: 25 Lämpchen = 33 Millionen Bilder (digital); Linienfolger = Lagerroboter, Bremsassistent = Neuwagen, Regelkreis = Staubsauger bis Marsrover; Sonnenlicht und glänzendes Band stören den Liniensensor.

- [ ] **Step 4: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src/handbuch.html website/test/smoke.cjs website/dist
git commit -m "Handbuch: Zeitplan mit sechs Stationen, Teststreifen, Erzählstoff statt Stationstext"
```

---

### Task 8: Musterlösungen

**Files:**
- Delete: `microbit/stations/03-fahrschule/loesung-quadrat.js`, `loesung-funktionen.js`, `bloecke.png`
- Modify: `microbit/stations/03-fahrschule/loesung.js`, `README.md`
- Rename: `microbit/stations/04-augen/` → entfällt (Inhalt geht in 03), `05-reflexe/` → `04-reflexe/`, `06-grand-prix/` → `05-grand-prix/`
- Modify: `04-reflexe/loesung.js`, `README.md`; `05-grand-prix/loesung.js`, `loesung-profi.js`, `README.md`
- Modify: `microbit/stations/README.md` (Beispiel „04-augen“ → „03-fahrschule“)
- Modify: `website/build.py` (falls der Pfad `microbit/stations/06-grand-prix` irgendwo steht: `grep -rn "06-grand-prix" website tools docs`)

**Interfaces:**
- Produces: alle drei `loesung.js` enthalten `maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.OFF)` in `input.onButtonPressed(Button.B, …)`; `04-reflexe` und `05-grand-prix` enthalten in `basic.forever` nach dem `OFF` die Zeile `maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Red)`.

- [ ] **Step 1: Prüfbefehl (fehlschlagend)**

Run: `grep -L "Button.B" microbit/stations/0[345]-*/loesung.js; grep -c "CarLightColors.Red" microbit/stations/04-reflexe/loesung.js microbit/stations/05-grand-prix/loesung.js`
Expected: vor der Änderung listet `grep -L` Dateien bzw. die Ordner fehlen noch.

- [ ] **Step 2: Ordner bewegen und Lösungen schreiben**

```bash
cd microbit/stations
git rm 03-fahrschule/loesung-quadrat.js 03-fahrschule/loesung-funktionen.js 03-fahrschule/bloecke.png
git mv 04-augen/loesung.js 03-fahrschule/loesung.js
git rm -r 04-augen
git mv 05-reflexe 04-reflexe
git mv 06-grand-prix 05-grand-prix
```

`03-fahrschule/loesung.js`: Programm aus dem Spec (Knopf A: fünf Ampelzeilen, `setPatrolSpeed(Speed1)`, `patrolling(ON)`; Knopf B `OFF`; `I2CInit()`); kein `forever`.
`04-reflexe/loesung.js`: dasselbe plus `matrixLidarDistance.initialize(Addr4, OBS)` und `basic.forever` mit `getData()`, `if (getObstacleDistance(Front) < 200) { patrolling(OFF); setRgblLed(All, Red) }`.
`05-grand-prix/loesung.js`: Knopf-B-Handler ergänzen, rote Zeile im `forever` ergänzen. `loesung-profi.js`: dieselben zwei Ergänzungen, falls nicht vorhanden.
READMEs: Stationsnummern und Beschreibungen nachziehen; `05-grand-prix/README.md` Abschnitt „Wo die Zählnummern stehen“: Pfade `06-grand-prix.html` → `05-grand-prix.html`, „Station 5“ → „Station 4“ beim Pausenknopf-Verweis streichen.

- [ ] **Step 3: Prüfbefehl**

Run: wie Step 1 plus `grep -rn "06-grand-prix\|04-augen" website tools docs microbit CLAUDE.md README.md | grep -v "docs/superpowers"`
Expected: `grep -L` gibt nichts aus; Zähler je 1; letzter grep leer (Treffer in `docs/superpowers/specs` sind Geschichte und bleiben).

- [ ] **Step 4: Bauen und testen**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün (die Vorlage ist nicht betroffen).

- [ ] **Step 5: Commit**

```bash
git add -A microbit/stations
git commit -m "Musterlösungen: Mappen 03–05 neu, Not-Aus und rotes Licht in allen Roboterlösungen"
```

---

### Task 9: CLAUDE.md, README, docs nachziehen

**Files:**
- Modify: `CLAUDE.md` (Regel 1 Stationsangaben; Regel 6 „Station 6“ → 5, „Station 5“ → 4; Stationstabelle „Stand 09.11.2026“; Roter Faden; Absatz Entlastung 15.09. um einen Satz zum 09.11. ergänzen; Abschnitt „Was der Simulator-Code kann“ → „Block-Optik und Figuren“ ohne beide Simulator-Absätze; Maqueen-Figuren „Station 3“ bleibt; Offen: Punkt „Station 2 auf 12 Min“ raus, „ms für 90°“ raus, neu: Firmware-Verhalten `Line patrolling ON` ohne Linie; vorläufiger Block `zeige Zahl (Beschleunigung (mg) y)`)
- Modify: `README.md` Zeilen 69–73
- Modify: `docs/02-offline-und-trockenlauf.md` (Zeile 30, 36, 59–65 Stationsnummern; Motor/Schleife raus; neuer Prüfpunkt wie oben)

- [ ] **Step 1: Ändern wie beschrieben**

Die Stationstabelle in `CLAUDE.md` wird exakt die Tabelle „Die neue Stationsfolge“ aus dem Spec.

- [ ] **Step 2: Prüfen**

Run: `grep -n "Station 6\|sieben Stationen\|Parcours-Simulator\|micro:bit-Simulator" CLAUDE.md README.md docs/02-offline-und-trockenlauf.md website/README.md`
Expected: keine Treffer außer in historischen Absätzen, die ausdrücklich ein Datum vor dem 09.11.2026 tragen.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md docs/02-offline-und-trockenlauf.md website/README.md
git commit -m "Doku auf sechs Stationen und Parcours-first nachgezogen"
```

---

### Task 10: Abschluss

- [ ] **Step 1: Kompletter Lauf**

Run: `cd website && python3 build.py && npm test && npm run check`
Expected: alles grün; `build.py` zeigt Wortzahlen unter Budget.

- [ ] **Step 2: Sichtprüfung im Browser**

`website/dist/maqueen-grand-prix-offline.html` per `file://` öffnen, Stationen 2 bis 5 durchklicken, Dunkelmodus und 360 px Breite für Station 3 und 5 ansehen. Erwartung: keine leeren Kästen, Figur `#mqinsert` sichtbar, Blockklammern geschlossen.

- [ ] **Step 3: Gedächtnis**

Memory `parcours-first.md`: Status „umgesetzt am <Datum>, Commit <hash>“ ergänzen, Verweis auf den Plan.
