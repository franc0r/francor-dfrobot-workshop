# Maskottchen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Workshop-Seite führt die Teams als Gespräch mit einer animierten Logo-Figur durch alle sieben Stationen; „Geht nicht“ fragt ein LLM über OpenRouter.

**Architecture:** Die gebaute Einzeldatei bleibt (`website/build.py`). Statt `src/stations/*.html` gibt es je Station ein Drehbuch (`src/drehbuch/NN-name.js`, reine Daten) und eine Kartendatei (`src/karten/NN-name.html`, versteckte HTML-Schnipsel wie Blockstapel, Simulatoren, Quiz). Eine neue Gesprächs-Engine (`src/maskottchen.js`) spielt das Drehbuch in `#chat` ab, hängt Karten aus `#karten` ein, hält den Verlauf in `S` und ruft das LLM. Die Figur ist ein Inline-SVG (`src/figur.html`) mit CSS-Zuständen. `build.py` fügt Drehbücher und Engine an einer Marke in `app.js` ein, damit alles im selben Geltungsbereich (IIFE) bleibt.

**Tech Stack:** Vanilla JS (ES5-Stil wie `app.js`, eine IIFE), CSS mit den vorhandenen Tokens, Python-Build, Playwright-Smoketest (`node test/smoke.cjs`), Node-Prüfskript für Drehbücher.

**Spec:** `docs/superpowers/specs/2026-11-06-maskottchen-design.md`

## Global Constraints

- Zweig `worktree-maskottchen`; `master` bleibt unberührt. Regel 1 (Offline-only) ist auf diesem Zweig aufgehoben, aber: ohne Netz und ohne Schlüssel läuft die Seite vollständig mit festem Drehbuch.
- Eine Datei: Ausgabe weiter `dist/maqueen-grand-prix-{offline,pages,artifact}.html`; Bilder nur aus `src/assets/` als `data:`-URI.
- Nur Blöcke, Blockfarben wie `CLAUDE.md` Regel 3; `.mcb`/`.mcstack`/`nestStack()` bleiben.
- Deutsch, Du-Form, Klasse 7, kurze Sätze; je Blase ein bis zwei Sätze. Kein Emoji in Blasen, Symbole als 5×5-Bildchen (`data-led`).
- Minuten: Drehbuch-`min` je Station = `STATIONS[i].m` = Zeitplan im Handbuch; Summe 105, Puffer 15.
- Figur-Name als Konstante `MASKOTTCHEN_NAME = "Franco"` (Platzhalter).
- LLM: OpenRouter Chat Completions, Modellkennung als Konstante `LLM_MODELL`, `max_tokens: 200`, Kontext ≤ ~2.000 Token, Timeout 15 s, Schlüssel nur in `localStorage` unter `mgp-key`, nie im Repo. Zähler in `localStorage` unter `mgp-llm`.
- Sprachausgabe nur Web Speech API, Standard aus, Schalter in `localStorage` unter `mgp-tts`.
- Fortschritt bleibt in `localStorage` unter `mgp-v1` (`S`), „Neues Team“ löscht Verlauf, nicht den Schlüssel.
- `prefers-reduced-motion`: nur Blinzeln, Tipp-Verzögerung 0.

## Review Focus

1. Neuladen mitten in einer Station: Verlauf und Antwortknöpfe des aktuellen Schritts erscheinen wieder, ohne dass Blasen doppelt auftauchen (Test in Task 3).
2. Stationswechsel über die Leiste zurück zu einer fertigen Station: Verlauf sichtbar, Figur spielt nichts erneut ab, kein zweites Abzeichen (Task 3).
3. „Geht nicht“ ohne Netz und ohne Schlüssel: Rückfallantwort mit Checkliste, nie leerer Chat, keine JS-Fehler (Task 5).
4. Simulator-Karte zweimal gezeigt (Neuladen): Simulator funktioniert weiter, weil der Knoten bewegt und nicht geklont wird; Canvas wird nach dem Einhängen neu gezeichnet (Task 4).
5. Bonus-Schritt übersprungen: Abzeichen trotzdem erreichbar, Schritt bleibt als „Extra“ erreichbar (Task 3).

---

### Task 1: Build liest Drehbücher, Karten und Figur

**Files:**
- Modify: `website/build.py` (Funktionen `stations()`, `check_times()`, `assemble()`, `inline_assets()`)
- Modify: `website/src/app.js:1-15` (Marke, `DREHBUCH`)
- Create: `website/src/drehbuch/00-boxenstopp.js` (vorläufig nur Metadaten, Schritte folgen in Task 3)
- Create: `website/src/karten/00-boxenstopp.html` (vorläufig leer: `<div class="karten" data-st="0"></div>`)
- Create: `website/src/figur.html` (Platzhalter `<div id="figur"></div>`, echte Figur in Task 2)
- Create: `website/src/maskottchen.js` (vorläufig leer mit Kopfkommentar)
- Create: `website/test/drehbuch.cjs`
- Modify: `website/package.json` (`"test": "node test/drehbuch.cjs && node test/smoke.cjs"`)

**Interfaces:**
- Produces: `var DREHBUCH = [];` in `app.js` vor der Marke `/* @@EINHAENGEN@@ */`. Jede Drehbuchdatei setzt `DREHBUCH[N] = {name, min, badge, titel, schritte:[]}`.
- Produces: `build.py` ersetzt die Marke durch: alle `src/drehbuch/*.js` (sortiert), dann `src/maskottchen.js`.
- Produces: `build.py` baut `<main id="stage">` als: `read("figur.html")` + `<section class="gespraech" id="gespraech"><div class="chat" id="chat"></div><div class="antworten" id="antworten"></div></section>` + `<div id="karten" hidden>` + alle `src/karten/*.html` + `</div>` + (bis Task 4 noch) die alten Stationen.
- Produces: `inline_assets()` ersetzt auch `href="assets/…"` (für `<image href>` im SVG).
- Produces: `test/drehbuch.cjs` lädt `app.js`-STATIONS und alle Drehbücher in einem `vm`-Kontext und prüft das Schema.

- [ ] **Step 1: Prüfskript schreiben**

`website/test/drehbuch.cjs` (Node, `vm.runInNewContext` über `var DREHBUCH=[];` + Inhalt aller `src/drehbuch/*.js`; `STATIONS` per Regex `var STATIONS = (\[[\s\S]*?\]);` aus `app.js`). Prüfungen, jede mit `check(cond, msg)` wie in `smoke.cjs`:

```
- DREHBUCH.length === 7 und kein Loch
- je i: DREHBUCH[i].name === STATIONS[i].n, DREHBUCH[i].min + " Min" === STATIONS[i].m, badge gleich
- Summe min === 105
- je Schritt: id string, eindeutig je Station; nachrichten Array mit ≥1 Eintrag; jeder Eintrag string oder {karte:string}; fertig string; chips Array mit 3–4 strings (bei bonus optional); zeig (optional) Objekt string → Array
- kein Eintrag enthält /\p{Extended_Pictographic}/u
- jeder karte-Verweis (außer makecode:neu, makecode:vorlage) existiert als data-karte in src/karten/*.html
```
Exit 1 bei Fehlern, Ausgabe wie `smoke.cjs`.

- [ ] **Step 2: Prüfskript laufen lassen, muss fehlschlagen**

Run: `cd website && node test/drehbuch.cjs`
Expected: FAIL, `src/drehbuch` existiert nicht.

- [ ] **Step 3: Drehbuch 0 (nur Metadaten), Karten 0, Figur-Platzhalter, Marke**

`src/drehbuch/00-boxenstopp.js`: `DREHBUCH[0] = {name:"Boxenstopp", min:5, badge:"Rookie", titel:"Boxenstopp", schritte:[]};` – das Prüfskript akzeptiert leere `schritte` nur in diesem Task; ab Task 3 verlangt es ≥1 Schritt (Prüfung dann ergänzen).
`app.js`: direkt nach `var STATIONS = […];` die Zeile `var DREHBUCH = [];`, und vor `/* ================= boot ================= */` die Zeile `/* @@EINHAENGEN@@ */`.

- [ ] **Step 4: build.py umbauen**

`stations()` bleibt (bis Task 4). Neu: `def drehbuch_js() -> str` (Dateien aus `src/drehbuch/`, sortiert, Prüfung: Dateiname `NN-name.js`, `DREHBUCH[NN]` steht darin), `def karten_html() -> str`, `assemble()` setzt beide ein (Marke muss genau einmal vorkommen, sonst `SystemExit`). `check_times()` liest die Minuten zusätzlich aus den Drehbüchern (`min:(\d+)`) und verlangt Gleichheit mit dem `STATIONS`-Array; die Eyebrow-Prüfung bleibt, bis Task 4 sie entfernt. `inline_assets()`-Regex: `(src|href)="assets/([A-Za-z0-9._-]+)"`.

- [ ] **Step 5: Build und Prüfskript laufen lassen**

Run: `cd website && python3 build.py && node test/drehbuch.cjs`
Expected: drei Dateien gebaut; Prüfskript meldet 6 fehlende Drehbücher (1–6) als FAIL – das ist in diesem Task erwartet. Dafür in `test/drehbuch.cjs` die Länge-Prüfung so schreiben, dass sie fehlende Stationen einzeln auflistet.

Damit `npm test` in den Tasks 1–9 nicht dauerhaft rot ist: Prüfskript bekommt Umgebungsvariable `DREHBUCH_ERWARTET` (Standard 7); in `package.json` bleibt der Standard. Die Tasks 3–9 setzen beim lokalen Lauf `DREHBUCH_ERWARTET=<bisher>`; Task 10 entfernt die Variable wieder.

- [ ] **Step 6: Smoketest läuft noch**

Run: `cd website && node test/smoke.cjs`
Expected: alles grün (alte Stationen werden noch gebaut).

- [ ] **Step 7: Commit**

```bash
git add website/build.py website/src/app.js website/src/drehbuch website/src/karten website/src/figur.html website/src/maskottchen.js website/test/drehbuch.cjs website/package.json
git commit -m "Build: Drehbuch-, Karten- und Figur-Dateien einhängen"
```

---

### Task 2: Die Figur

**Files:**
- Modify: `website/src/figur.html`
- Modify: `website/src/styles.css` (neuer Abschnitt `/* ===== Figur ===== */`)
- Modify: `website/src/maskottchen.js` (Abschnitt `figur`)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: `figur.html` = `<div class="figur" id="figur" data-zustand="leerlauf"><svg viewBox="0 0 105 120" …><image href="assets/francor-logo.png" …/><g class="augen">…</g></svg><div class="figurname" id="figurname"></div></div>`. Visier: `<rect x="36" y="26" width="52" height="18" rx="9" fill="#1a1a1a">`, Augen zwei `<ellipse class="pupille" cx="50|73" cy="35" rx="5" ry="5.5" fill="#7df9ff">`, je in `<g class="lid">`.
- Produces in `maskottchen.js`: `var MASKOTTCHEN_NAME = "Franco";` `var figur = { zustand: function(name){…}, schauen: function(clientX, clientY){…}, zuElement: function(el){…} };` Zustände: `leerlauf | reden | jubel | gruebeln | sorge`. `zustand()` setzt `data-zustand`; `jubel` fällt nach 900 ms auf `leerlauf` zurück; `schauen()` verschiebt beide `.pupille` per `transform="translate(dx dy)"`, Betrag ≤ 3,2 Einheiten; `zuElement(el)` ruft `schauen()` mit der Mitte von `el`.
- CSS: `.figur[data-zustand="leerlauf"] svg { animation: figur-wippen 3.2s infinite }`, `reden` → `figur-reden .35s infinite`, `jubel` → `figur-huepfen .6s 1`, `gruebeln` → `.lid { transform: scaleY(.6) }` + Kopf `rotate(-4deg)`, `sorge` → `.pupille` 2 Einheiten nach oben; `.lid { animation: figur-blinzeln 4.5s infinite }`; unter `@media (prefers-reduced-motion: reduce)` nur `figur-blinzeln`.
- Layout: `.shell main` wird `display:grid; grid-template-columns: 180px minmax(0,1fr)`; `.figur` sticky `top:90px`; unter 760 px eine Spalte, `.figur` 72 px breit links oben neben dem Chat (`position:sticky; top:70px`).

- [ ] **Step 1: Smoketest-Prüfungen schreiben**

In `smoke.cjs` nach dem Sicherheitsblock:
```js
check(await page.$eval('#figur svg', e => e.getBoundingClientRect().height) > 100, 'Figur: SVG wird gezeichnet');
check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Figur: Leerlauf nach dem Laden');
check(await page.$eval('#figur .lid', e => getComputedStyle(e).animationName) === 'figur-blinzeln', 'Figur: blinzelt');
check(await page.$eval('#figurname', e => e.textContent) === 'Franco', 'Figur: Name steht dran');
await page.mouse.move(1200, 900);
check(await page.$eval('#figur .pupille', e => /translate\(\s*[1-9]/.test(e.getAttribute('transform') || '')), 'Figur: Pupillen folgen der Maus');
```
Und im reduced-motion-Kontext (neuer `browser.newContext({ reducedMotion: 'reduce', offline: true })`): `animationName` des `svg` ist `none`, der `.lid` bleibt `figur-blinzeln`.

- [ ] **Step 2: Laufen lassen, muss fehlschlagen**

Run: `cd website && python3 build.py && node test/smoke.cjs`
Expected: FAIL bei „Figur: SVG wird gezeichnet“.

- [ ] **Step 3: figur.html, CSS und `figur`-Objekt umsetzen**

`maskottchen.js` registriert `document.addEventListener("mousemove", …)` und `touchstart` für `schauen()`, setzt `#figurname` auf `MASKOTTCHEN_NAME`.

- [ ] **Step 4: Laufen lassen**

Run: `cd website && python3 build.py && node test/smoke.cjs`
Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src/figur.html website/src/styles.css website/src/maskottchen.js website/test/smoke.cjs
git commit -m "Figur: Logo mit Visier-Augen, Zustände und Blick"
```

---

### Task 3: Gesprächs-Engine mit Drehbuch 0

**Files:**
- Modify: `website/src/maskottchen.js` (Abschnitte `gespraech`, `antworten`, `stups`)
- Modify: `website/src/drehbuch/00-boxenstopp.js` (echte Schritte)
- Modify: `website/src/app.js` (`S`-Felder, `go()`, Reset, `data-next`-Handler)
- Modify: `website/src/styles.css` (Abschnitt `/* ===== Gespräch ===== */`)
- Modify: `website/test/drehbuch.cjs` (≥1 Schritt je Station)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Consumes: `figur.zustand()`, `complete(i)`, `go(i)`, `save()`, `S`, `reduced()`, `nestStack()`, `ledIcon()`.
- Produces Drehbuch-Schema (verbindlich für Tasks 6–9):
  ```js
  DREHBUCH[N] = { name, min, badge, titel,
    schritte: [ { id:"projekt",            // eindeutig je Station
                  bonus:false,             // true = Zugabe
                  nachrichten:[ "Text mit <b>HTML</b>", {karte:"k4-bloecke"} ],
                  zeig:{ "Zeig mir wo":[ "…", {karte:"makecode:vorlage"} ] }, // optional
                  chips:[ "Der micro:bit zeigt nur ein X", … ],   // 3–4
                  fertig:"Hab ich ✓" } ] };
  ```
- Produces State in `S`: `S.schritt = {}` (Station → Index des aktuellen Schritts), `S.chat = {}` (Station → Verlauf, Einträge `{r:"bot", h:html}`, `{r:"me", h:text}`, `{r:"karte", k:id}`), `S.skip = {}` (`"4:extra"` → 1). Reset leert alle drei.
- Produces Funktionen in `maskottchen.js`: `function gesprZeige(st)` (Verlauf aus `S.chat[st]` sofort rendern, dann Antwortknöpfe des aktuellen Schritts; ist `S.schritt[st]` undefiniert, Schritt 0 abspielen), `function spielSchritt(st, i)` (Nachrichten nacheinander mit `TIPP_MS = 700`, davor Zustand `reden`, danach `leerlauf` und Antworten), `function blase(st, html, me)`, `function karte(st, id)` (in Task 3 nur `makecode:neu`/`makecode:vorlage` als `<a class="btn" href="makecode:…">`; andere IDs ab Task 4), `function antworten(st, i)`, `function fertig(st)`, `function ueberspringen(st)`, `function logPush(st, eintrag)` (hängt an `S.chat[st]` an und speichert).
- Übersprungene Bonus-Schritte: solange `S.skip["st:id"]` gesetzt ist, zeigt `antworten()` zusätzlich einen kleinen Knopf `data-extra="id"` mit Text „Extra: <titel>“; Klick spielt den Schritt ab (`S.skip` löschen, `spielSchritt`), danach geht es beim vorherigen Stand weiter.
- Antwortknöpfe (`#antworten`): normal: `[fertig]`, je Schlüssel in `zeig` ein Knopf, `[Geht nicht]` (`data-frage`, Verhalten ab Task 5, bis dahin ohne Wirkung). Bonus-Schritt vor der Entscheidung: `[Machen wir!]` `[Überspringen]`; nach „Machen wir!“ wie normal. Letzter Schritt: `fertig` ruft `complete(st)`, Zustand `jubel`, danach Knopf `Weiter zu Station N →` (`go(N)`, `timerAutoStart()`), bei Station 6 `Workshop abschließen ✓` (setzt `#finaltitle` wie der alte Handler).
- Beim Schrittwechsel spricht die Figur den neuen Schritt sofort (`spielSchritt`). Stups: `STUPS_MS = 180000`; ein `setTimeout` je Schritt, zurückgesetzt bei jedem Klick in `#gespraech`; feuert höchstens einmal je `(st, i)` (Merker nur im Speicher) mit der Blase „Alles gut bei euch? Ich bin hier, wenn ihr mich braucht.“
- `go(i)` ruft am Ende `gesprZeige(i)`. Der alte `data-next`-Handler bleibt, bis Task 4 die Stationen entfernt.

- [ ] **Step 1: Drehbuch 0 schreiben**

Aus `src/stations/00-boxenstopp.html` in 3–4 Schritte: Begrüßung und Regelkreis (wahrnehmen → entscheiden → handeln) als drei Blasen, Maqueen-Übersicht `{karte:"k0-mqmap"}` (Karte selbst kommt in Task 4; bis dahin rendert `karte()` unbekannte IDs als leeren `<div class="karte" data-k="…">`), Quiz `{karte:"k0-quiz"}`, Abschluss. `chips` je Schritt, z. B. „Was ist ein Sensor?“, „Was macht der Summer?“, „Wo ist der Schalter?“.

- [ ] **Step 2: Smoketest-Prüfungen schreiben**

Ersetzt den alten Block „Station 0 abgeschlossen → Abzeichen“:
```js
// Gespräch Station 0
check(await page.$eval('#chat .blase', e => !!e), 'Gespräch: erste Blase da');
check(await page.$eval('#figur', e => e.dataset.zustand) === 'reden', 'Figur: redet beim Abspielen');
await page.waitForTimeout(3200);
check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Figur: nach dem Schritt Leerlauf');
const n0 = await page.$$eval('#chat .blase', l => l.length);
await page.reload(); await page.waitForTimeout(300);
check(await page.$$eval('#chat .blase', l => l.length) === n0, 'Gespräch: Neuladen zeigt den Verlauf, nichts doppelt');
check(await page.$('#antworten button[data-fertig]') !== null, 'Gespräch: Antwortknöpfe nach Neuladen da');
let runden = 0;
while (await page.$('#antworten button[data-fertig]') && runden++ < 10) { await page.click('#antworten button[data-fertig]'); await page.waitForTimeout(3500); }
check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Station 0 durchgespielt → Abzeichen');
check(await page.$('#antworten button[data-go="1"]') !== null, 'Gespräch: Knopf zur Station 1');
await page.click('.stepbtn[data-go="0"]'); await page.waitForTimeout(300);
check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Zurück zu Station 0: kein zweites Abzeichen');
check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Zurück zu Station 0: nichts wird neu abgespielt');
```
Reduced-motion-Kontext: nach `goto` ohne Wartezeit sind alle Blasen des ersten Schritts da (`TIPP_MS` 0).

Bonus-Prüfung (Review-Fokus 5) in Task 6 bei Station 2 (Würfel), hier vormerken.

- [ ] **Step 3: Laufen lassen, muss fehlschlagen**

Run: `cd website && python3 build.py && DREHBUCH_ERWARTET=1 node test/drehbuch.cjs && node test/smoke.cjs`
Expected: FAIL bei „Gespräch: erste Blase da“.

- [ ] **Step 4: Engine, CSS und `app.js`-Anbindung umsetzen**

CSS: `.blase` (hell/dunkel über Tokens `--surface`, `--ink`), `.blase.me` in `#E9483F` rechtsbündig, `.karte`, `#antworten button` als Pille mit Rand `#E9483F`. Alte `.station`-Abschnitte bleiben gebaut, aber `go()` versteckt sie weiterhin; `.gespraech` ist immer sichtbar.

- [ ] **Step 5: Laufen lassen**

Run: `cd website && python3 build.py && DREHBUCH_ERWARTET=1 node test/drehbuch.cjs && node test/smoke.cjs`
Expected: alles grün.

- [ ] **Step 6: Commit**

```bash
git add website/src website/test
git commit -m "Gespräch: Engine, Verlauf, Antwortknöpfe, Drehbuch 0"
```

---

### Task 4: Karten und Abschied von den Stationsseiten

**Files:**
- Create: `website/src/karten/00-boxenstopp.html` … `06-grand-prix.html` (Inhalt zunächst nur die Teile, die Simulatoren und Figuren tragen; Blockstapel/Quiz je Station kommen mit den Drehbüchern in Tasks 6–9)
- Modify: `website/src/maskottchen.js` (`karte()` vollständig)
- Modify: `website/src/app.js` (Quiz- und Bonus-Handler, Boot)
- Modify: `website/build.py` (`stations()` und Eyebrow-Prüfung entfernen)
- Delete: `website/src/stations/*.html` (bleiben auf `master`)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: Kartendatei je Station `src/karten/NN-name.html` = `<div class="karten" data-st="N">` mit Kindern `<div class="karte" data-karte="kN-…">…</div>`. Pflicht-Karten dieses Tasks: `k0-mqmap` (Figure `#mqmap` aus Station 0), `k0-quiz` (`.quiz[data-quiz="q0"]`), `k2-mbsim` (`#mbsim` komplett), `k3-mqinsert` (`#mqinsert`), `k3-sim` (`#sim` komplett mit `#cv`), `k6-gpmap` (`#gpmap`-Figure). Außerdem je Station `kN-klemmt` (die Note „Wenn es klemmt“, als `<details class="hint">` zusammengeklappt).
- Produces: `karte(st, id)`: holt `#karten [data-karte=id]`, **bewegt** den Knoten (`appendChild`, kein Klon) in eine neue `.blase.karte` in `#chat`, ruft bei `k3-sim` `fit(); draw();`, ruft `figur.zuElement()` auf die Karte. Für `makecode:neu`/`makecode:vorlage` wie in Task 3. Unbekannte ID → `SystemExit` schon im Prüfskript (Task 1 Regel), zur Laufzeit leere Karte.
- Quiz- und Bonus-Handler in `app.js` laufen weiter über `document.querySelectorAll` beim Boot – die Knoten existieren versteckt in `#karten`, das genügt. `data-bonus`-Knöpfe entfallen (Bonus ist jetzt Drehbuch-Schritt), Handler bleibt für den Fall leerer Auswahl harmlos.
- `build.py`: `check_times()` ohne Eyebrows; `assemble()` ohne `stations()`; Prüfung `src/stations` darf nicht mehr existieren (sonst `SystemExit("Stationen gehören jetzt in drehbuch/ und karten/")`).

- [ ] **Step 1: Smoketest anpassen**

Entfernen: Struktur-Block (sieben `.station`, Eyebrows, Rail = Eyebrows), Station-0-Tabelle, Klammer-Prüfungen in Station 1/5 (kommen in Tasks 6/8 als Karten-Prüfungen zurück), Station-3-Einsetz-Block, Station-6-Block, Dunkelmodus-Block (kommt in Task 9 zurück). Ändern: micro:bit- und Parcours-Prüfungen laufen jetzt so:
```js
await page.click('.stepbtn[data-go="2"]'); await page.waitForTimeout(400);
await page.evaluate(() => window.__karte(2, 'k2-mbsim'));   // Testhaken, siehe unten
check(await page.$('#chat #mbmatrix') !== null, 'Karte: micro:bit-Simulator im Gespräch');
… (Herz, Neigen, Schütteln wie bisher)
await page.click('.stepbtn[data-go="3"]'); await page.waitForTimeout(400);
await page.evaluate(() => window.__karte(3, 'k3-sim'));
check(await page.$eval('#chat #cv', e => e.getBoundingClientRect().width) > 100, 'Karte: Parcours-Canvas sichtbar und gezeichnet');
… (fahre 5 wie bisher)
await page.reload(); await page.waitForTimeout(400);
check(await page.$('#chat #cv') !== null, 'Karte: Parcours nach Neuladen wieder im Gespräch');
```
Testhaken: `maskottchen.js` setzt `window.__karte = function(st, id){ karte(st, id); logPush(st, {r:"karte", k:id}); }` nur, wenn `location.protocol === "file:"`. Rail-Minuten-Prüfung: `railMins` gegen `DREHBUCH`-Minuten aus `page.evaluate(() => window.__drehbuchMin)` (gleicher Haken), Summe 105.

- [ ] **Step 2: Laufen lassen, muss fehlschlagen**

Run: `cd website && python3 build.py && node test/smoke.cjs`
Expected: FAIL bei „Karte: micro:bit-Simulator im Gespräch“.

- [ ] **Step 3: Karten anlegen, Stationen löschen, build.py und `karte()` umsetzen**

Die Simulator-Markups 1:1 aus den Stationsdateien in die Karten verschieben (IDs unverändert). `git rm website/src/stations/*.html`.

- [ ] **Step 4: Laufen lassen**

Run: `cd website && python3 build.py && DREHBUCH_ERWARTET=1 node test/drehbuch.cjs && node test/smoke.cjs`
Expected: alles grün, Build ohne `src/stations`.

- [ ] **Step 5: Commit**

```bash
git add -A website/src website/build.py website/test
git commit -m "Karten: Simulatoren und Figuren wandern ins Gespräch, Stationsseiten raus"
```

---

### Task 5: Frage-Feld, LLM, Zähler, Rückfall, Betreuer-Abschnitt

**Files:**
- Modify: `website/src/maskottchen.js` (Abschnitte `frage`, `llm`)
- Modify: `website/src/handbuch.html` (neuer `<section>` „Maskottchen“ nach „Ohne Internet arbeiten“)
- Modify: `website/src/styles.css` (`.frage`, `.chips`)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces Konstanten: `LLM_URL = "https://openrouter.ai/api/v1/chat/completions"`, `LLM_MODELL = "anthropic/claude-haiku-4.5"` (eine Zeile, tauschbar), `LLM_MAX_TOKENS = 200`, `LLM_TIMEOUT_MS = 15000`, `LLM_CENT_PRO_MTOKEN = {ein: 100, aus: 500}` (Schätzung, nur für die Anzeige).
- Produces: `function frageOeffnen(st)` (unter `#antworten` ein `<form class="frage" id="frage">` mit `<div class="chips">` aus `schritt.chips`, `<input id="frageeingabe">`, Knopf „Fragen“), `function fragen(st, text)` → Blase `me`, Zustand `gruebeln`, dann `llmAntwort(st, text)`; Erfolg → Blase `bot`, Zustand `leerlauf`, Antwortknöpfe wieder plus Knopf „Noch eine Frage“; Fehler/kein Schlüssel/kein Netz → `rueckfall(st)` = Blase „Hm, da komm ich gerade nicht ran. Schaut mal hier rein, und wenn das nichts bringt: Wink den Betreuer her.“ + Karte `kN-klemmt`.
- Produces: `function llmAntwort(st, text)` → `Promise<string>`; `fetch` mit `AbortController`; Header `Authorization: Bearer <mgp-key>`, `HTTP-Referer` weggelassen; Body `{model, max_tokens, messages:[{role:"system", content: systemPrompt(st)}, …letzte 4 Einträge aus S.chat[st] als user/assistant, {role:"user", content:text}]}`. Wirft bei `!res.ok`, Timeout, fehlendem Schlüssel.
- Produces: `function systemPrompt(st)` baut aus `MASKOTTCHEN_NAME`, festen Regeln (Spec „System-Prompt, Kern“, wörtlich inkl. „höchstens drei Sätze“, „Blocknamen wörtlich aus dem Drehbuch“), dem Drehbuch der Station als Kurzform (je Schritt `titel` + Blasentexte ohne HTML, gekürzt auf 300 Zeichen) und dem aktuellen Schritt.
- Produces: Zähler `localStorage["mgp-llm"] = {anfragen, ein, aus}`; `function zaehlerPlus(usage)` nimmt `usage.prompt_tokens`/`completion_tokens` aus der Antwort; Anzeige `#llmzaehler` im Handbuch: „N Anfragen · ca. X Cent“; Knopf `#llmreset`.
- Handbuch-Abschnitt „Maskottchen“: Eingabe `#orkey` (type password), Knopf `#orkeysave` (schreibt `mgp-key`), Anzeige `#orkeystate` („Schlüssel gesetzt“/„kein Schlüssel“), Checkbox `#ttsbox` (Task 6), `#llmzaehler`, `#llmreset`, drei Absätze: was ohne Netz passiert, Kosten, Vorlesen.

- [ ] **Step 1: Smoketest-Prüfungen schreiben**

Offline-Kontext (bestehende `page`):
```js
await page.click('.stepbtn[data-go="0"]'); await page.waitForTimeout(300);
await page.click('#antworten button[data-frage]');
check(await page.$$eval('#frage .chips button', l => l.length >= 3), 'Frage: Chips da');
await page.click('#frage .chips button');
await page.waitForTimeout(500);
check(await page.$eval('#chat .blase:last-child', e => e.textContent.includes('Wink den Betreuer')), 'Frage ohne Netz: Rückfallantwort');
check(await page.$('#chat details.hint') !== null, 'Frage ohne Netz: Checkliste „Wenn es klemmt“ als Karte');
```
Neuer Kontext mit Netz und `page.route('https://openrouter.ai/**', r => r.fulfill({ json: { choices:[{message:{content:'Stell ihn auf die Linie, dann A drücken.'}}], usage:{prompt_tokens:1200, completion_tokens:30} } }))`; vorher `page.evaluate(() => localStorage.setItem('mgp-key','test'))`:
```js
check(await page.$eval('#figur', e => e.dataset.zustand) === 'gruebeln', 'Frage: Figur grübelt, solange das LLM antwortet');  // direkt nach dem Klick
… warten 300 ms
check(await page.$eval('#chat .blase:last-child', e => e.textContent.includes('A drücken')), 'Frage: LLM-Antwort als Blase');
check(JSON.parse(await page.evaluate(() => localStorage.getItem('mgp-llm'))).anfragen === 1, 'Zähler: eine Anfrage');
await page.click('#coachbtn'); check(await page.$eval('#llmzaehler', e => /1 Anfrage/.test(e.textContent)), 'Handbuch: Zähler sichtbar');
check(!html.includes('sk-or-'), 'kein Schlüssel in der Datei');
await page.click('#resetbtn'); check(await page.evaluate(() => localStorage.getItem('mgp-key')) === 'test', '„Neues Team“ behält den Schlüssel');
```
Und: Route antwortet mit Status 500 → Rückfallantwort, `anfragen` bleibt 1.

- [ ] **Step 2: Laufen lassen, muss fehlschlagen**

Run: `cd website && python3 build.py && node test/smoke.cjs`
Expected: FAIL bei „Frage: Chips da“.

- [ ] **Step 3: Frage-Feld, LLM, Zähler, Handbuch-Abschnitt umsetzen**

- [ ] **Step 4: Laufen lassen**

Run: `cd website && python3 build.py && node test/smoke.cjs`
Expected: alles grün; `build.py` meldet keine externen Verweise (die `fetch`-Adresse steht nur im Skript).

- [ ] **Step 5: Commit**

```bash
git add website/src website/test
git commit -m "Frage-Feld: Chips, OpenRouter-Anbindung, Zähler, Rückfall ohne Netz"
```

---

### Task 6: Vorlesen

**Files:**
- Modify: `website/src/maskottchen.js` (Abschnitt `vorlesen`)
- Modify: `website/src/handbuch.html` (`#ttsbox` verdrahten)
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Produces: `function vorlesen(html)`: nur wenn `localStorage["mgp-tts"] === "1"` und `window.speechSynthesis` vorhanden; Text = `html` ohne Tags; `SpeechSynthesisUtterance` mit `lang = "de-DE"` und der ersten Stimme, deren `lang` mit `de` beginnt; `blase()` ruft `vorlesen()` für `bot`-Blasen, LLM-Antworten werden an Satzgrenzen (`/(?<=[.!?])\s+/`) in mehrere Utterances geteilt, in Reihenfolge eingereiht.
- `#ttsbox` spiegelt `mgp-tts`; „Neues Team“ lässt den Schalter unverändert.

- [ ] **Step 1: Smoketest-Prüfung schreiben**

```js
await page.evaluate(() => { localStorage.setItem('mgp-tts','1'); window.__gesprochen = []; window.speechSynthesis = { speak: u => window.__gesprochen.push(u.text), getVoices: () => [{lang:'de-DE', name:'Test'}], cancel(){} }; window.SpeechSynthesisUtterance = function(t){ this.text = t; }; });
await page.click('.stepbtn[data-go="1"]'); await page.waitForTimeout(1200);
check((await page.evaluate(() => window.__gesprochen)).length >= 1, 'Vorlesen: Blase wird gesprochen');
check((await page.evaluate(() => window.__gesprochen))[0].indexOf('<') === -1, 'Vorlesen: ohne HTML-Tags');
```

- [ ] **Step 2: Laufen lassen, muss fehlschlagen** – Run wie oben, Expected: FAIL „Vorlesen: Blase wird gesprochen“.

- [ ] **Step 3: Umsetzen**

- [ ] **Step 4: Laufen lassen** – Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src website/test
git commit -m "Vorlesen: Browser-Stimme als Schalter im Betreuer-Handbuch"
```

---

### Task 7: Drehbücher und Karten für Station 1 und 2

**Files:**
- Create: `website/src/drehbuch/01-erster-kontakt.js`, `website/src/drehbuch/02-microbit-allein.js`
- Modify: `website/src/karten/01-erster-kontakt.html`, `website/src/karten/02-microbit-allein.html`
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Consumes: Schema aus Task 3, `karte()` aus Task 4.
- Quelle: `git show master:website/src/stations/01-erster-kontakt.html` und `…/02-microbit-allein.html`. Jeder `.block` wird ein Schritt, jede `.mcstack` eine Karte (`k1-start`, `k1-herz`, `k2-…`), Quiz als Karte (`k1-quiz`, `k2-quiz`), Notes „So bedient ihr MakeCode“ als `zeig`-Abzweig, „Wenn es klemmt“ als `k1-klemmt`/`k2-klemmt`.
- Station 1 Schrittfolge (Pflicht): `oeffnen` (mit `{karte:"makecode:neu"}`, Blase „Ja, ihr dürft. Jetzt.“), `lebenszeichen` (zwei Blockkarten), `uebertragen`, `quiz`. Station 2: `projekt`, `simulator` (`k2-mbsim`), `knoepfe`, `neigen`, `quiz`, `wuerfel` mit `bonus:true` (Würfel-Challenge, vorher `data-bonus="wuerfel3x"`).
- Texte: Du-Form, frech, je Blase ≤ 2 Sätze; Blocknamen wörtlich wie bisher (`beim Start`, `dauerhaft`, `zeige Symbol`, `pausiere (ms)`, `Bildschirminhalt löschen`, `wähle eine zufällige Zahl` …).

- [ ] **Step 1: Prüfungen schreiben**

`test/drehbuch.cjs` läuft mit `DREHBUCH_ERWARTET=3`. In `smoke.cjs`:
```js
// Station 1: Klammer-Blöcke in der Karte
await page.click('.stepbtn[data-go="1"]'); … bis Karte k1-herz sichtbar (Schritte durchklicken)
const loopKids = await page.$$eval('#chat .mcc', l => l.map(c => c.querySelector('.mch').textContent.trim() + ':' + c.querySelectorAll(':scope > .mcbody > .mcb').length));
check(loopKids.includes('beim Start:1') && loopKids.includes('dauerhaft:4'), 'Station 1: Klammer-Blöcke in der Karte');
check(await page.$$eval('#chat .mcb .ledico[aria-label="Herz"] span.on', l => l.length === 16), 'Station 1: Herz als 5×5-Bild');
// Station 2: Bonus überspringen blockiert das Abzeichen nicht (Review-Fokus 5)
… Station 2 bis zum Schritt wuerfel durchklicken; check Knopf „Überspringen“ da; klicken;
check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) >= 1, 'Station 2: Abzeichen trotz übersprungenem Extra');
check(await page.$('#antworten button[data-extra]') !== null, 'Station 2: Extra bleibt erreichbar');
```

- [ ] **Step 2: Laufen lassen, muss fehlschlagen** – Expected: Prüfskript meldet Drehbuch 1 und 2 fehlend.

- [ ] **Step 3: Drehbücher und Karten schreiben**

- [ ] **Step 4: Laufen lassen** – Run: `cd website && python3 build.py && DREHBUCH_ERWARTET=3 node test/drehbuch.cjs && node test/smoke.cjs`. Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src website/test
git commit -m "Drehbuch: Station 1 und 2 als Gespräch"
```

---

### Task 8: Drehbücher und Karten für Station 3, 4 und 5

**Files:**
- Create: `website/src/drehbuch/03-fahrschule.js`, `04-augen.js`, `05-reflexe.js`
- Modify: `website/src/karten/03-fahrschule.html`, `04-augen.html`, `05-reflexe.html`
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Quelle wie Task 7 (`git show master:…`). Station 3: `einsetzen` (`k3-mqinsert`), `vorlage` (`makecode:vorlage`, Name „Fahren“ wie bisher), `simulator` (`k3-sim`, Level 1–2; Level 3 als Blase „Bonus für Schnelle“), `motoren` (Blockkarte), `quadrat` `bonus:true` (vorher `data-bonus="quadrat"`), `klemmt` als Karte. Station 4: `projekt` (Name „Linie“), `sensor` (Blase mit den zwei Zahlen 3800/2700 und Karte `k4-sensorbild`, falls ein Bild in `assets/` liegt, sonst nur Blase), `bloecke` (`k4-bloecke`, der Stapel aus Schritt 02), `fahren` (fertig: „Er fährt!“), `quiz`. Station 5: `projekt`, `laser` (Blockkarte), `wenn` (`k5-logik`, die zwei wenn/sonst-Stapel), `pausenknopf` (Variable `pausiert`), `quiz`, `staubsauger` `bonus:true`.
- Chips Station 4 (verbindlich): „Der micro:bit zeigt nur ein X“, „Er fährt von der Linie runter“, „Er fährt gar nicht los“, „Wo ist der Block Line patrolling?“.

- [ ] **Step 1: Prüfungen schreiben**

`DREHBUCH_ERWARTET=6`. `smoke.cjs`: Station 5 Karte `k5-logik`: `#chat .mcc[data-c="b-logic"] > .mcbody` zählt 4; `.mcb.b-var` zwei Stück in `rgb(220, 20, 60)`; Station 4 Chips exakt die vier oben.

- [ ] **Step 2: Laufen lassen, muss fehlschlagen**

- [ ] **Step 3: Drehbücher und Karten schreiben**

- [ ] **Step 4: Laufen lassen** – `DREHBUCH_ERWARTET=6`, Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src website/test
git commit -m "Drehbuch: Station 3 bis 5 als Gespräch"
```

---

### Task 9: Drehbuch und Karten für Station 6

**Files:**
- Create: `website/src/drehbuch/06-grand-prix.js`
- Modify: `website/src/karten/06-grand-prix.html`
- Modify: `website/test/smoke.cjs`

**Interfaces:**
- Quelle `git show master:website/src/stations/06-grand-prix.html` und `microbit/stations/06-grand-prix/README.md` (Zählnummern 1–4 bleiben wie dort). Schritte: `strecke` (`k6-gpmap`), `projekt` („Linie“ wieder öffnen), `kreuzungen` (Blockkarte mit `.b-gp`), `tempo`, `laserstopp`, `melodie`, `lauf` (fertig: „Wir sind durch!“), `profi` `bonus:true` (Pro-Ziel), Abschluss mit „Workshop abschließen ✓“.
- Dunkelmodus-Prüfung kommt zurück: Kontext `colorScheme:'dark'`, 360 px: `#gpmap .gp-mat` Fill weiß, kein waagerechter Scroll, `.figur` sichtbar und ≤ 80 px breit.

- [ ] **Step 1: Prüfungen schreiben** (`DREHBUCH_ERWARTET=7`; Skizze nummeriert 1–4; `.mcb.b-gp` in `rgb(60, 60, 60)`; Workshop abschließen → `#finaltitle` „Workshop geschafft!“ und 7 Abzeichen nach Durchklicken aller Stationen in einem frischen Kontext mit `reducedMotion:'reduce'`, damit es schnell geht)

- [ ] **Step 2: Laufen lassen, muss fehlschlagen**

- [ ] **Step 3: Drehbuch und Karten schreiben**

- [ ] **Step 4: Laufen lassen** – Expected: alles grün.

- [ ] **Step 5: Commit**

```bash
git add website/src website/test
git commit -m "Drehbuch: Station 6 als Gespräch, Durchlauf aller Stationen im Smoketest"
```

---

### Task 10: Handbuch, CLAUDE.md, Aufräumen

**Files:**
- Modify: `website/src/handbuch.html` (Zeitplan unverändert; „Am Vorabend“ und „Vorbereitung, pro Arbeitsplatz“ bekommen den Schritt „Schlüssel im Abschnitt Maskottchen eintragen, einmal ‚Geht nicht‘ probieren“)
- Modify: `CLAUDE.md` (Abschnitt „Maskottchen-Zweig“: Regel 1 aufgehoben, Drehbuch/Karten-Format, Konstanten, Zähler; Tabelle „Die Stationen“ verweist auf Drehbücher)
- Modify: `website/test/drehbuch.cjs` (`DREHBUCH_ERWARTET` entfernen, fest 7)
- Modify: `website/test/smoke.cjs` (Kopfkommentar auf den neuen Stand)
- Modify: `.github/workflows/pages.yml` nur, falls `npm test` dort anders aufgerufen wird als `npm test`

- [ ] **Step 1: Handbuch und CLAUDE.md schreiben**

- [ ] **Step 2: Vollständiger Lauf**

Run: `cd website && python3 build.py && npm test`
Expected: alles grün, `node test/drehbuch.cjs` ohne Umgebungsvariable.

- [ ] **Step 3: Datei von Hand öffnen**

Run: `open website/dist/maqueen-grand-prix-pages.html` – einmal Station 4 mit echtem Schlüssel durchspielen, Zähler ablesen; Ergebnis als Zeile in `docs/02-offline-und-trockenlauf.md` unter „Maskottchen“ eintragen (Antwortzeit, Cent).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md website docs
git commit -m "Maskottchen: Handbuch, CLAUDE.md und Tests auf den Gesprächsstand"
```
