# FRANCOR-Maqueen-Erweiterung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine MakeCode-Erweiterung `franc0r/pxt-francor-maqueen` (Englisch + Deutsch), die DFRobots Maqueen-Erweiterung, die LiDAR-Erweiterung und die Grand-Prix-Bibliothek ersetzt.

**Architecture:** Reines TypeScript-Paket für `pxt-microbit`, zwei Namensräume = zwei Kategorien (`francorMaqueen`, `francorLidar`). Hardwarefreie Rechnungen (Linienlage, Motor-Prozent, LiDAR-Rahmen) liegen in `logic.ts` und werden in Node getestet; alles mit `pins.*` wird mit `pxt build` kompiliert und von Martin am Gerät geprüft. Register und Abläufe folgen Martins Rust-Treiber.

**Tech Stack:** pxt (`pxt-core`, Ziel `microbit`), TypeScript, Node ≥ 20 (`node --test`), `typescript` (nur für die Node-Tests), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-11-francor-maqueen-extension-design.md` (im Workshop-Repo). Referenz-Hardware: `github.com/franc0r/francor-maqueen-plus` (`src/registers.rs`, `src/robot.rs`, `src/lidar.rs`), Pinbelegung `github.com/franc0r/francor-maqueen-plus-microbit`. DFRobot-Quellen nur zum Gegenlesen; bei Widerspruch gilt der Rust-Treiber.

## Global Constraints

- Repo: `franc0r/pxt-francor-maqueen`, **öffentlich**, lokal neben dem Workshop-Repo unter `/Users/martin/Projekte/francor/Schulprogramm_AG/pxt-francor-maqueen`. `pxt.json` im Hauptordner, `"name": "francor-maqueen"`.
- Nur TypeScript, keine eigenen C++-Dateien (offline-fähig). Abhängigkeit nur `core`; einzig erlaubte Ausnahme `"ws2812b": "github:microsoft/pxt-ws2812b#v0.1.2"` (genau diese Version, sonst Konflikt mit DFRobot).
- Namensräume `francorMaqueen` und `francorLidar` — nie `maqueen` oder `maqueenPlusV2`. Block-IDs mit Präfix `francor_` (z. B. `blockId=francor_drive`).
- Farben: `francorMaqueen` `#0FBC11`, `francorLidar` `#5B3FE8`.
- Gruppen in `francorMaqueen`: `V3`, `Line`, `Lights`, `V2` (deutsch: „V3“, „Linie“, „Lichter“, „V2“). Radgeschwindigkeit, Umgebungslicht, Version mit `advanced=true`.
- Sprachen: Englisch im Code, Deutsch vollständig in `_locales/de/francor-maqueen-strings.json` und `_locales/de/francor-maqueen-jsdoc-strings.json`. Deutsch in Du-Form, kurz. `npm run check:locales` muss nach jedem Task grün sein.
- I2C: Platine `0x10`, LiDAR `0x33`. Lesen = `pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE)` dann `pins.i2cReadNumber/ReadBuffer` (kein repeated start).
- Kein Block außer „starte Maqueen“/„starte Maqueen V2“ darf länger als ~200 ms blockieren, wenn Hardware fehlt. „starte Maqueen“ blinkt X endlos, wenn die Platine nie antwortet — auch im Simulator (Martin, 11.11.2026).
- Vorläufige, am Gerät zu prüfende Werte im Code mit `// VORLÄUFIG (Gerätetest):` markieren.
- Nicht bauen: Fernbedienung, Display-Blöcke, LiDAR-Matrixmodus, Regenbogen.

## Blocktexte (gilt für alle Tasks)

Englisch = `//% block=` im Code, Deutsch = `…|block` in `_locales/de/francor-maqueen-strings.json`. Wortlaut vorläufig bis Martins Gerätetest; Parameter-Platzhalter (`%x`/`$x`) in beiden gleich.

| Funktion | Gruppe | English | Deutsch |
|---|---|---|---|
| `start()` | V3 | start Maqueen | starte Maqueen |
| `drive(left, right)` | V3 | drive left %left \|\% right %right \|\% | fahre links %left \|\% rechts %right \|\% |
| `driveBoth(speed)` | V3 | drive %speed \|\% | fahre %speed \|\% |
| `stop()` | V3 | stop motors | stoppe Motoren |
| `patrol(on)` | V3 | line following %on | Linienverfolgung %on |
| `patrolSpeed(level)` | V3 | line following speed %level | Linien-Tempo %level |
| `atCrossroad(m)` | V3 | at crossroad %m | an Kreuzung %m |
| `atTJunction(m)` | V3 | at T-junction %m | an T-Kreuzung %m |
| `atLeftOrStraight(m)` | V3 | at left-or-straight %m | an Abzweig links %m |
| `atRightOrStraight(m)` | V3 | at right-or-straight %m | an Abzweig rechts %m |
| `junction()` | V3 | junction seen | erkannte Kreuzung |
| `isJunction(j)` | V3 | %j | %j |
| `onCrossing(nr, handler)` | V3 | when crossing number $nr reached | wenn Kreuzung Nummer $nr erreicht |
| `crossingsCounted()` | V3 | crossings counted | Kreuzungen gezählt |
| `resetCrossings()` | V3 | reset crossing counter | setze Kreuzungszähler zurück |
| `headlight(side, color)` | V3 | headlight %side color %color | Scheinwerfer %side Farbe %color |
| `driveDistance(cm, dir, wait)` | V3 | drive %cm cm %dir %wait | fahre %cm cm %dir %wait |
| `turn(degrees, wait)` | V3 | turn %degrees ° %wait | drehe %degrees ° %wait |
| `pidStop()` | V3 | stop drive move | stoppe Fahrbefehl |
| `wheelSpeed(side)` | V3 adv. | wheel speed %side (cm/s) | Radgeschwindigkeit %side (cm/s) |
| `ambientLight(side)` | V3 adv. | ambient light %side | Umgebungslicht %side |
| `version()` | V3 adv. | firmware version | Firmware-Version |
| `seesLine(s)` | Line | sensor %s sees line | Sensor %s sieht Linie |
| `sensorRaw(s)` | Line | raw value sensor %s | Rohwert Sensor %s |
| `linePosition()` | Line | line position | Linienlage |
| `setLight(led, color)` | Lights | set light %led to %color=francor_colors | setze Licht %led auf %color=francor_colors |
| `colors(c)` | Lights | %c | %c |
| `rgb(r, g, b)` | Lights | red %r green %g blue %b | rot %r grün %g blau %b |
| `brightness(v)` | Lights | light brightness %v | Licht-Helligkeit %v |
| `lightsOff()` | Lights | all lights off | alle Lichter aus |
| `startV2()` | V2 | start Maqueen V2 | starte Maqueen V2 |
| `driveV2(left, right)` / `stopV2()` | V2 | wie oben, Suffix „(V2)“ | wie oben, Suffix „(V2)“ |
| `redLed(side, on)` | V2 | red LED %side %on | rote LED %side %on |
| `ultrasonic()` | V2 | ultrasonic distance (cm) | Ultraschall-Abstand (cm) |
| `francorLidar.start()` | LiDAR | start LiDAR | LiDAR einschalten |
| `francorLidar.distance(side)` | LiDAR | distance %side (mm) | Abstand %side (mm) |
| `francorLidar.direction()` | LiDAR | avoid direction | Ausweichrichtung |
| `francorLidar.isDirection(d)` | LiDAR | %d | %d |
| `francorLidar.setAvoidDistance(mm)` | LiDAR | avoid distance %mm mm | Ausweich-Abstand %mm mm |

Enum-Werte (EN → DE): `On/Off` → an/aus; Kreuzungsregel `Straight/Left/Right/Stop` → geradeaus/links/rechts/halt; Kreuzung `None/Crossroad/TJunction/LeftOrStraight/RightOrStraight` → keine/Kreuzung/T-Kreuzung/Abzweig links/Abzweig rechts; `Forward/Backward` → vorwärts/rückwärts; Warten `UntilDone/Continue` → warte bis fertig/sofort weiter; Seite `Left/Right/Both` → links/rechts/beide; Sensoren `L2/L1/M/R1/R2` bleiben; Scheinwerferfarben `Off/Red/Green/Yellow/Blue/Purple/Cyan/White` → aus/rot/grün/gelb/blau/lila/cyan/weiß; LED `1/2/3/4/All` → 1/2/3/4/alle; LiDAR-Seite `Front/Left/Right` → vorne/links/rechts; Richtung `Left/Right/Free` → links/rechts/frei; Kategorie `Maqueen` → Maqueen, `LiDAR` → LiDAR.

## Review Focus

1. **Linienlage 100 in einer Rechnung** („fahre links 40 − 20 × Linienlage“ bei verlorener Linie ergibt −1960): `drive` muss auf −100…100 begrenzen, nicht überlaufen oder Byte-Müll schicken. → Test `motorSpeed clamps far out of range` in Task 2.
2. **LiDAR fehlt oder ist nicht eingeschaltet:** `Abstand vorne < 200` darf nicht wahr werden. Fehlerwert `NO_VALUE = 9999`. → Test `NO_VALUE is never an obstacle` in Task 2; Gerätetest in Task 8.
3. **Kreuzung / alle Sensoren / Lücken:** Linienlage für alle 32 Bitmuster definiert, nie `NaN`. → Test `linePosition covers all 32 patterns` in Task 2.
4. **PID-Fahrt, bei der das Busy-Flag nie 1 wird** (sehr kurze Strecke, andere Firmware): „warte bis fertig“ darf nicht ewig hängen. Phase „warten auf 1“ endet nach 500 ms, Phase „warten auf 0“ nach 30 000 ms. → Gerätetest-Zeile in Task 8 (`fahre 0 cm … warte bis fertig` kehrt zurück).
5. **Blöcke ohne Startblock oder V3-Blöcke auf dem V2:** dürfen nicht hängen und nicht abstürzen; Lichter nehmen ohne Startblock P1. → Kompilier-Test in `test.ts` (Task 3) ruft Blöcke ohne `start()`; Gerätetest-Zeile in Task 8.

---

### Task 1: Repo, Gerüst, Werkzeugkette, Übersetzungsprüfung

**Files:**
- Create: `pxt.json`, `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `LICENSE` (MIT, „FRANCOR e. V.“), `main.ts` (Namensraum-Köpfe), `test.ts`, `_locales/de/francor-maqueen-strings.json`, `_locales/de/francor-maqueen-jsdoc-strings.json`, `tools/check-locales.mjs`, `.github/workflows/build.yml`

**Interfaces:**
- Produces: `npm run build` (= pxt build), `npm test` (Node-Tests unter `test-node/`), `npm run check:locales`; Namensraum-Köpfe in `main.ts`:
  - `//% weight=100 color="#0FBC11" icon="" block="Maqueen" groups='["V3","Line","Lights","V2"]'` `namespace francorMaqueen {}`
  - `//% weight=99 color="#5B3FE8" icon="" block="LiDAR"` `namespace francorLidar {}`

- [ ] **Step 1: Repo anlegen**

```bash
cd /Users/martin/Projekte/francor/Schulprogramm_AG
gh repo create franc0r/pxt-francor-maqueen --public --description "MakeCode extension for DFRobot Maqueen Plus V3/V2 and Matrix LiDAR (EN/DE) by FRANCOR e. V." --clone
cd pxt-francor-maqueen
```
Expected: leeres Repo geklont.

- [ ] **Step 2: Gerüst schreiben**

`pxt.json`: `name` `francor-maqueen`, `version` `0.1.0`, `dependencies` `{"core": "*"}`, `files` = alle `.ts` außer `test.ts` plus `README.md` und beide `_locales/de/*.json`, `testFiles` `["test.ts"]`, `supportedTargets` `["microbit"]`, `preferredEditor` `"tsprj"`. `package.json` mit devDependencies `pxt` und `typescript`, scripts `build`: `pxt build`, `test`: `node --test test-node/`, `check:locales`: `node tools/check-locales.mjs`. `.gitignore`: `node_modules/`, `built/`, `pxt_modules/`, `projects/`.

- [ ] **Step 3: Werkzeugkette prüfen**

```bash
npm install && npx pxt target microbit && npx pxt install && npx pxt build
```
Expected: Build ohne Fehler, `built/binary.hex` existiert.

- [ ] **Step 4: Prüfskript `tools/check-locales.mjs` schreiben**

Ablauf: Englische String-Dateien von pxt erzeugen lassen (`npx pxt gendocs --locs`; falls die Option anders heißt, in `npx pxt help` den Befehl suchen, der `_locales/francor-maqueen-strings.json` und `…-jsdoc-strings.json` schreibt), dann jeden Schlüssel daraus in der passenden deutschen Datei suchen. Exit 1 mit Liste der fehlenden Schlüssel; zusätzlich Exit 1, wenn ein deutscher Wert leer ist oder einen anderen Satz `%name`/`$name`-Platzhalter hat als der englische. Die von pxt erzeugten englischen Dateien gehören ins Repo (MakeCode braucht sie nicht, aber sie machen Änderungen sichtbar).

- [ ] **Step 5: Prüfskript gegen einen absichtlichen Fehler testen**

Einen Dummy-Block `//% block="probe"` `export function probe() {}` in `francorMaqueen` einfügen, `npm run check:locales` → Expected: FAIL, nennt `francorMaqueen.probe|block`. Deutschen Eintrag ergänzen → PASS. Dummy und Eintrag wieder entfernen; Kategorie-Einträge (`{id:category}…`, `{id:group}…`) für Maqueen, LiDAR, V3, Line→„Linie“, Lights→„Lichter“, V2 ergänzen → PASS.

- [ ] **Step 6: CI** — `.github/workflows/build.yml`: auf push/PR, Node 20, `npm ci`, `npx pxt target microbit`, `npx pxt install`, `npx pxt build`, `npm test`, `npm run check:locales`.

- [ ] **Step 7: Commit und Push**

```bash
git add -A && git commit -m "Gerüst: pxt-Paket, Übersetzungsprüfung, CI" && git push -u origin main
```
Expected: CI grün auf GitHub (`gh run watch`).

---

### Task 2: Hardwarefreie Logik mit Node-Tests

**Files:**
- Create: `logic.ts` (`namespace francorMaqueen`, nur reine Funktionen ohne `pins`, `basic`, `control`, `Math.idiv`)
- Create: `test-node/logic.test.mjs`, `test-node/load.mjs` (transpiliert `logic.ts` mit `typescript.transpileModule`, führt es per `vm` aus und gibt `{ m: francorMaqueen, l: francorLidar }` zurück)

**Interfaces:**
- Produces (alle `export`, ohne `//%`-Block-Kommentar, also unsichtbar in der Blockliste):
  - `linePositionFromState(state: number): number` — Bits L2 `0x10`=2, L1 `0x08`=1, M `0x04`=0, R1 `0x02`=−1, R2 `0x01`=−2; Mittelwert der gesetzten; keine gesetzt → `LINE_LOST` (= 100).
  - `const LINE_LOST = 100`
  - `motorDir(percent: number): number` → 0 vorwärts / 1 rückwärts (Byte für Register 0x00/0x02).
  - `motorSpeed(percent: number): number` → 0…255; begrenzt auf ±100; `Math.round(|p| * 255 / 100)` — VORLÄUFIG (Gerätetest, tote Zone).
  - `francorLidar.NO_VALUE = 9999` (in `logic.ts` als `namespace francorLidar { export const NO_VALUE = 9999 }`)
  - `lidarRequest(cmd: number, payload: number[]): number[]` → `[0x55, (len>>8)&0xFF, len&0xFF, cmd, ...payload]` mit `len = payload.length + 1`.
  - `lidarObstacle(payload: number[]): number[]` → `[direction, left, front, right]` aus `payload[0]`, LE16 `payload[2..3]`, `[4..5]`, `[6..7]`.

- [ ] **Step 1: Failing tests schreiben** (`test-node/logic.test.mjs`)

```js
test('linePosition examples from Martin', () => {
  assert.equal(m.linePositionFromState(0x04), 0)
  assert.equal(m.linePositionFromState(0x04|0x08), 0.5)
  assert.equal(m.linePositionFromState(0x08), 1)
  assert.equal(m.linePositionFromState(0x08|0x10), 1.5)
  assert.equal(m.linePositionFromState(0x10), 2)
  assert.equal(m.linePositionFromState(0x04|0x02), -0.5)
  assert.equal(m.linePositionFromState(0x08|0x04|0x02), 0) // breites Band
  assert.equal(m.linePositionFromState(0x1F), 0)           // Kreuzung
  assert.equal(m.linePositionFromState(0), 100)
})
test('linePosition covers all 32 patterns', () => {
  for (let s = 0; s < 32; s++) { const v = m.linePositionFromState(s)
    assert.ok(Number.isFinite(v)); assert.ok(s === 0 ? v === 100 : v >= -2 && v <= 2) }
})
test('motor percent', () => {
  assert.deepEqual([m.motorDir(100), m.motorSpeed(100)], [0, 255])
  assert.deepEqual([m.motorDir(-100), m.motorSpeed(-100)], [1, 255])
  assert.deepEqual([m.motorDir(0), m.motorSpeed(0)], [0, 0])
  assert.equal(m.motorSpeed(50), 128)
})
test('motorSpeed clamps far out of range', () => {
  assert.deepEqual([m.motorDir(-1960), m.motorSpeed(-1960)], [1, 255])
  assert.equal(m.motorSpeed(250), 255)
})
test('NO_VALUE is never an obstacle', () => { assert.ok(!(l.NO_VALUE < 200)); assert.ok(l.NO_VALUE > 4000) })
test('lidar frames', () => {
  assert.deepEqual(m.lidarRequest(6, []), [0x55, 0, 1, 6])
  assert.deepEqual(m.lidarRequest(7, [0, 200]), [0x55, 0, 3, 7, 0, 200])
  assert.deepEqual(m.lidarObstacle([3, 0, 0x2C, 0x01, 0xC8, 0x00, 0x10, 0x27]), [3, 300, 200, 10000])
})
```

- [ ] **Step 2:** `npm test` → Expected: FAIL (`logic.ts` fehlt / Funktionen undefiniert).
- [ ] **Step 3:** `logic.ts` mit den Signaturen oben schreiben.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` → PASS; `npm run check:locales` → PASS.
- [ ] **Step 5:** Commit `"Logik: Linienlage, Motor-Prozent, LiDAR-Rahmen"`.

---

### Task 3: I2C-Grundlage, Start V3/V2, Motoren, Liniensensoren

**Files:**
- Create: `core.ts` (Konstanten, Modell, I2C-Helfer, Enums `Model`, `LineSensor`), `start.ts`, `motors.ts`, `line.ts`
- Modify: `test.ts`, `_locales/de/*.json`

**Interfaces:**
- Consumes: `linePositionFromState`, `motorDir`, `motorSpeed` (Task 2).
- Produces (intern, nicht exportiert als Block): `const ADDR = 0x10`; `writeReg(reg: number, bytes: number[]): void`; `readReg(reg: number, n: number): Buffer`; `let model: Model` (Standard `Model.V3`); `enum LineSensor { L2, L1, M, R1, R2 }`; `enum OnOff { On, Off }`.
- Produces (Blöcke): `start()`, `startV2()`, `drive(left: number, right: number)`, `driveBoth(speed: number)`, `stop()`, `driveV2(left, right)`, `stopV2()`, `seesLine(s: LineSensor): boolean`, `sensorRaw(s: LineSensor): number`, `linePosition(): number`.

- [ ] **Step 1: `test.ts` als Kompilier-Test erweitern** — ruft *ohne* vorherigen `start()` auf: `francorMaqueen.drive(40 - 20 * francorMaqueen.linePosition(), 40 + 20 * francorMaqueen.linePosition())`, `seesLine(LineSensor.M)`, `sensorRaw(LineSensor.L2)`, `stop()`; danach `start()`, `driveBoth(50)`, `startV2()`, `driveV2(-30, 30)`, `stopV2()`.
- [ ] **Step 2:** `npm run build` → Expected: FAIL (Funktionen fehlen).
- [ ] **Step 3: Implementieren.**
  - `start()`: `writeReg(0x49, [1])`, `basic.pause(100)`, dann solange `readReg(0x32,1)[0] == 0`: X zeigen (`basic.showLeds` mit X, Intervall 10), 500 ms, `basic.clearScreen()`; dann Haken (Muster aus DFRobot `I2CInit`), 500 ms, löschen. Setzt `model = Model.V3`. Endloses Warten ist gewollt.
  - `startV2()`: wie `start()` ohne Reset-Schreiben (VORLÄUFIG (Gerätetest): kennt der V2 0x49?), setzt `model = Model.V2`.
  - Motoren: ein Schreibvorgang `writeReg(0x00, [motorDir(l), motorSpeed(l), motorDir(r), motorSpeed(r)])`; `stop` = alles 0. V2-Varianten rufen dieselben Helfer.
  - `seesLine`: Bit aus `readReg(0x1D,1)` (Masken wie Task 2). `sensorRaw`: Register R2 0x1E, R1 0x20, M 0x22, L1 0x24, L2 0x26, Wert `b[0] | b[1] << 8`. `linePosition` = `linePositionFromState(readReg(0x1D,1)[0])`.
  - Annotationen nach Blocktext-Tabelle; Motorparameter `min=-100 max=100`, `defl=50`; `linePosition` mit Hilfe-Text, der 100 = „keine Linie“ und „positiv = Linie links“ erklärt.
  - Deutsche Einträge für alle neuen Blöcke, Enum-Werte und Hilfetexte.
- [ ] **Step 4:** `npm run build` → PASS; `npm test` → PASS; `npm run check:locales` → PASS.
- [ ] **Step 5:** Commit `"Start, Motoren, Liniensensoren, Linienlage"`.

---

### Task 4: Fertige Linienverfolgung, Kreuzungsregeln, Kreuzungen zählen

**Files:**
- Create: `patrol.ts`, `crossings.ts`
- Modify: `test.ts`, `_locales/de/*.json`

**Interfaces:**
- Consumes: `writeReg`, `readReg`, `OnOff` (Task 3).
- Produces: `patrol(on: OnOff)` (Reg 60 ← `0x05` an / `0x08` aus), `patrolSpeed(level: number)` (Reg 63, 1–5, `min=1 max=5 defl=1`), `atCrossroad(m: CrossroadRule)` (69), `atTJunction(m: TRule)` (70), `atLeftOrStraight(m: LeftRule)` (71), `atRightOrStraight(m: RightRule)` (72) mit Werten Left=1, Right=2, Straight=3, Stop=4 (je nur die erlaubten), `enum Junction { None=0, Crossroad=1, TJunction=2, LeftOrStraight=3, RightOrStraight=4 }`, `junction(): number` (Reg 61), `isJunction(j: Junction): number` (Wertblock zum Vergleichen), `onCrossing(nr: number, handler: () => void)`, `crossingsCounted(): number`, `resetCrossings()`.

- [ ] **Step 1:** `test.ts` um je einen Aufruf jedes neuen Blocks ergänzen, inkl. `francorMaqueen.onCrossing(1, () => { francorMaqueen.atRightOrStraight(RightRule.Straight) })` und `if (francorMaqueen.junction() == francorMaqueen.isJunction(Junction.TJunction)) {}`.
- [ ] **Step 2:** `npm run build` → FAIL.
- [ ] **Step 3: Implementieren.** `crossings.ts` übernimmt `microbit/bibliothek/custom.ts` aus dem Workshop-Repo unverändert im Verhalten (Sperrzeit 300 ms, Abfrage alle 20 ms, zählt Wechsel 0 → ≠0, `afterOnStart=true`, `nr.min=1 nr.defl=1`), liest aber `junction()` statt `maqueenPlusV2.intersectionDetecting()`. Hilfe zu `patrol`: „aus“ löscht die Kreuzungsregeln der Platine. Deutsche Einträge.
- [ ] **Step 4:** build / test / check:locales → PASS.
- [ ] **Step 5:** Commit `"Linienverfolgung der Platine, Kreuzungsregeln, Kreuzungen zählen"`.

---

### Task 5: Lichter unten, Scheinwerfer, V2-LEDs, Ultraschall

**Files:**
- Create: `lights.ts`, `headlights.ts`, `v2.ts`
- Modify: `test.ts`, `_locales/de/*.json`, ggf. `pxt.json` (nur bei Fallback)

**Interfaces:**
- Consumes: `model`, `writeReg` (Task 3).
- Produces: `enum Led { One=0, Two=1, Three=2, Four=3, All=4 }`, `setLight(led: Led, color: number)`, `colors(c: Colors): number` (`blockId=francor_colors`, `blockHidden` nicht gesetzt, Farben wie MakeCodes NeoPixel-Liste: rot, orange, gelb, grün, blau, indigo, violett, lila, weiß, schwarz), `rgb(r,g,b): number`, `brightness(v: number)` (0–255), `lightsOff()`, `enum Side { Left, Right, Both }`, `enum HeadColor { Off=0, Red=1, Green=2, Yellow=3, Blue=4, Purple=5, Cyan=6, White=7 }`, `headlight(side: Side, color: HeadColor)` (0x0B/0x0C), `redLed(side: Side, on: OnOff)` (0x0B/0x0C, an = 1 — VORLÄUFIG (Gerätetest)), `ultrasonic(): number` (TRIG P13, ECHO P14, cm 0–300, Ablauf wie DFRobot `readUltrasonic` mit `pulseIn`-Timeout 58 ms).

- [ ] **Step 1:** `test.ts`: `setLight(Led.Two, colors(Colors.Red))`, `setLight(Led.All, rgb(0,0,255))`, `brightness(80)`, `lightsOff()`, `headlight(Side.Both, HeadColor.Green)`, `redLed(Side.Left, OnOff.On)`, `let d = ultrasonic()`.
- [ ] **Step 2:** `npm run build` → FAIL.
- [ ] **Step 3: Implementieren.** Puffer 4×3 Byte in GRB-Reihenfolge, Helligkeit beim Senden anwenden. Pin: `model == Model.V2 ? DigitalPin.P15 : DigitalPin.P1`. Senden mit `light.sendWS2812Buffer(buf, pin)` aus `core`; meldet `pxt build` dieses Symbol als unbekannt, stattdessen Abhängigkeit `"ws2812b": "github:microsoft/pxt-ws2812b#v0.1.2"` und `ws2812b.sendBuffer(buf, pin)`. LED-Nummer → Pufferindex VORLÄUFIG (Gerätetest). Deutsche Einträge.
- [ ] **Step 4:** build / test / check:locales → PASS.
- [ ] **Step 5:** Commit `"Lichter, Scheinwerfer, V2-LEDs, Ultraschall"`.

---

### Task 6: PID-Fahrten und Messwerte

**Files:**
- Create: `pid.ts`, `telemetry.ts`
- Modify: `test.ts`, `_locales/de/*.json`

**Interfaces:**
- Consumes: `writeReg`, `readReg`, `Side` (Task 3/5).
- Produces: `enum Dir { Forward=1, Backward=2 }`, `enum Wait { UntilDone, Continue }`, `driveDistance(cm: number, dir: Dir, wait: Wait)` (`cm.min=1 cm.max=1000 cm.defl=20`), `turn(degrees: number, wait: Wait)` (`min=-180 max=180 defl=90`), `pidStop()`, `wheelSpeed(side: Side): number` (Reg 76, 2 Byte, Wert/5; `Both` = Mittelwert), `ambientLight(side: Side): number` (Reg 78, 4 Byte big-endian links, rechts; `Both` = Mittelwert), `version(): string` (Länge 0x32, Daten 0x33).

- [ ] **Step 1:** `test.ts`: `driveDistance(20, Dir.Forward, Wait.UntilDone)`, `turn(-90, Wait.Continue)`, `pidStop()`, `wheelSpeed(Side.Left)`, `ambientLight(Side.Right)`, `version()`.
- [ ] **Step 2:** `npm run build` → FAIL.
- [ ] **Step 3: Implementieren.**
  - Distanz: 64 ← dir, 85 ← 2, 65 ← `(cm >> 8) & 0xFF`, 66 ← `cm & 0xFF`, 60 ← `0x06`. Winkel: 67 ← 1 bei ≥ 0 sonst 2, 86 ← 2, 68 ← `|deg|`, 60 ← `0x06`. Stopp: 60 ← `0x10`.
  - `Wait.UntilDone`: Busy-Flag mit **jedem Mal neu** `readReg(87, 1)` lesen; erst warten, bis es 1 ist (höchstens 500 ms), dann bis 0 (höchstens 30 000 ms), Abfrage alle 10 ms. Die 500 ms sind VORLÄUFIG (Gerätetest).
  - Drehrichtung positiver Winkel VORLÄUFIG (Gerätetest), in der Hilfe so lassen, wie die Platine dreht.
  - Deutsche Einträge.
- [ ] **Step 4:** build / test / check:locales → PASS.
- [ ] **Step 5:** Commit `"PID-Fahrten mit echtem Warten, Messwerte"`.

---

### Task 7: LiDAR mit Hintergrund-Abfrage

**Files:**
- Create: `lidar.ts` (`namespace francorLidar`)
- Modify: `test.ts`, `_locales/de/*.json`

**Interfaces:**
- Consumes: `lidarRequest`, `lidarObstacle`, `francorLidar.NO_VALUE` (Task 2).
- Produces: `start()`, `enum LidarSide { Front, Left, Right }`, `distance(side: LidarSide): number`, `enum AvoidDir { Left=1, Right=2, Free=3 }`, `direction(): number`, `isDirection(d: AvoidDir): number`, `setAvoidDistance(mm: number)` (`min=100 max=500 defl=200`, Hilfe: am Maqueen höchstens 200).

- [ ] **Step 1:** `test.ts`: `francorLidar.distance(LidarSide.Front) < 200` *vor* `francorLidar.start()`, dann `start()`, `setAvoidDistance(200)`, `if (francorLidar.direction() == francorLidar.isDirection(AvoidDir.Left)) {}`.
- [ ] **Step 2:** `npm run build` → FAIL.
- [ ] **Step 3: Implementieren.**
  - Adresse fest `0x33`. Kommandos: Modus setzen `1` mit Nutzlast `[1, 0, 0, 4]` (Ausweichmodus 4×4), Ausweichdaten `6`, Ausweich-Abstand `7` mit `[hi, lo]`.
  - Antwort lesen wie `francor-maqueen-plus/src/lidar.rs`: Status-Byte einzeln lesen (`0xFF` = noch nicht bereit, `0x53` ok, `0x63` Fehler), dann Kommando-Echo, Länge LE16, Nutzlast. Beim Modus-Setzen jedes Echo akzeptieren. **Zeitlimit je Anfrage 100 ms**, danach Fehlschlag.
  - Bis zur ersten erfolgreichen Messung liefern `distance` → `NO_VALUE`, `direction` → `AvoidDir.Free`. Ohne `start()` ebenso; es läuft dann keine Schleife.
  - `start()` kehrt sofort zurück und startet einmalig `control.inBackground`: warten bis `control.millis() >= 3000`, Modus setzen (bei Fehlschlag nach 1000 ms erneut, ohne Ausgabe, endlos), danach dauernd Ausweichdaten holen und in Variablen ablegen, Pause 20 ms zwischen Abfragen. Schlägt eine Abfrage fehl, bleibt der letzte Wert stehen; nach 5 Fehlschlägen in Folge wieder `NO_VALUE`.
  - `setAvoidDistance` vor `start()` merkt sich den Wert und schickt ihn nach dem Modus-Setzen.
  - Hilfe zu `start()` und `distance()`: in den ersten Sekunden und ohne Sensor 9999.
  - Deutsche Einträge.
- [ ] **Step 4:** build / test / check:locales → PASS.
- [ ] **Step 5:** Commit `"LiDAR: Startblock, Hintergrund-Abfrage, kein Hängen"`.

---

### Task 8: Gerätetests, README, Release v0.1.0

**Files:**
- Create: `geraetetest/README.md` (Checkliste), `geraetetest/01-start-motoren.ts`, `02-linie.ts`, `03-platine-kreuzungen.ts`, `04-lichter.ts`, `05-pid.ts`, `06-lidar.ts`, `07-v2.ts`, `08-stationen.ts` — Programme im MakeCode-JavaScript-Format zum Einfügen in ein Projekt mit der Erweiterung (in `.gitignore`/`pxt.json` **nicht** als Paketdateien).
- Modify: `README.md`

- [ ] **Step 1: Gerätetest-Programme schreiben.** Jedes Programm prüft einen Bereich mit Knopf A/B und zeigt Ergebnisse per `basic.showNumber` oder seriell. Die Checkliste nennt je Zeile: was tun, was erwarten, Kästchen. Pflichtzeilen:
  - Start: X blinkt ohne Platine, Haken mit Platine; im Simulator blinkt X endlos.
  - Motoren 10 %, 20 %, 50 %, 100 %, −50 %: ab wie viel Prozent dreht ein Rad? (→ tote Zone)
  - `drive(40 - 20 * linePosition(), 40 + 20 * linePosition())` auf dem Teststreifen: Lenkt er zur Linie? (→ Vorzeichen)
  - Linienlage auf dem Display bei M, M+L1, L2, keine Linie (100).
  - Linienverfolgung an/aus, Tempo 1/5, alle vier Regeln, `wenn Kreuzung Nummer 1 erreicht`.
  - LEDs 1–4 einzeln: welche Nummer ist welche LED (vorn links …)? Scheinwerfer alle Farben.
  - `driveDistance(20, Forward, UntilDone)`: Folgeblock startet erst nach der Fahrt; `driveDistance(… 0 cm …)` und `turn(0, UntilDone)` kehren zurück; `turn(90)` dreht nach links oder rechts?
  - LiDAR: ohne `start()` 9999; nach `start()` erst 9999, nach ~3 s echte Werte; Sensor abgesteckt → kein Hängen, 9999; Hand vor Sensor → `< 200`.
  - Roboter ohne LiDAR, nur Linienprogramm: läuft flüssig.
  - V2 (falls vorhanden): Start ohne Reset, Motoren, Linie, Lichter an P15, rote LED an = an, Ultraschall.
  - Stationen 3, 4, 5 normal und Profi nach `microbit/stations/*/README.md` des Workshop-Repos nachbauen — Profi ohne die 2000-ms-Pause nach dem PID-Sprung.
  - Sprache: MakeCode auf Deutsch, Blöcke durchsehen — kein englischer Rest; auf Englisch — kein deutscher Rest.
  - Offline: Projekt einmal mit Netz laden, Netz aus, neu laden, kompilieren, flashen.
- [ ] **Step 2: README** — Englisch und Deutsch: Was es ist, „Erweiterungen → `https://github.com/franc0r/pxt-francor-maqueen` einfügen“, Blockübersicht je Gruppe, Hinweis Fehlerwerte (Linienlage 100, LiDAR 9999), Lizenz, Verweis auf den Rust-Treiber. Kein Shop-Link.
- [ ] **Step 3:** build / test / check:locales → PASS; CI grün.
- [ ] **Step 4: Release**

```bash
git add -A && git commit -m "Gerätetests, README" && git push
git tag v0.1.0 && git push origin v0.1.0
```
Expected: In makecode.microbit.org → Erweiterungen → URL des Repos einfügen → Kategorien „Maqueen“ und „LiDAR“ erscheinen.

- [ ] **Step 5: Übergabe an Martin.** Link zu `geraetetest/README.md`. Gefundene Abweichungen (tote Zone, LED-Nummern, Vorzeichen, Busy-Flag-Zeit, V2-Reset, Drehrichtung) fließen danach als v0.1.x ein; `// VORLÄUFIG`-Marken werden dabei aufgelöst.
