/*
 * Smoketest für die Offline-Ausgabe.
 *
 *   npm test          (baut vorher nicht – erst `npm run build`)
 *
 * Prüft, was am Messetag weh tun würde (fast alles mit abgeschaltetem Netzwerk):
 *   1. Die Datei lädt ohne Netz und ohne JS-Fehler; keine externen Verweise (Schriften,
 *      Skripte, Bilder), nur die MakeCode-Links; kein Schlüssel in der Datei.
 *   2. Struktur: keine Stationsseiten mehr; Rail-Minuten summieren auf 105 (+ 15 Puffer = 120)
 *      und stimmen mit den Drehbüchern überein (Testhaken window.__drehbuchMin, nur file://).
 *      Dazu die Stückliste als Seite oben in der Leiste – ohne Minuten, Timer, Abzeichen und
 *      ohne Gespräch (Figur und #gespraech sind dort ausgeblendet).
 *   3. Figur: Name, Blinzeln, Blick zur Maus, reduzierte Bewegung (kein Tipp-Effekt).
 *   4. Karten: liegen versteckt im Vorrat #karten; window.__karte holt sie ins Gespräch.
 *   5. Gespräch Station 0 bis 5: Verlauf, Knöpfe, „Zeig mir“, Bonus/Extra, Abzeichen, Neuladen;
 *      ein Durchlauf aller sechs Drehbücher bis „Workshop geschafft!“ mit 6 Abzeichen.
 *   6. Dunkelmodus auf Handybreite (360 px): Sicherheitsfenster, Streckenskizze Station 5.
 *   7. Frage-Feld „Geht nicht“: ohne Netz die Rückfallantwort mit Checkliste; Kontingent
 *      (S.fragen ≥ 30: kein fetch); mit gefälschtem OpenRouter (Playwright route) Antwort,
 *      Anfrageform [system, user] mit Mitschrift, Zähler mgp-llm, Serverfehler, späte
 *      Antwort nach „Neues Team“, Schlüssel bleibt erhalten.
 *   8. Vorlesen (Schalter mgp-tts): Standard aus, ohne HTML, Verlauf bleibt still.
 *   9. Betreuer-Handbuch öffnet sich; "Neues Team" setzt zurück und zeigt das
 *      Sicherheitsfenster wieder (nur der Knopf schließt es).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const DIST = path.join(__dirname, '..', 'dist', 'maqueen-grand-prix-offline.html');
let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else { console.log('  FAIL ' + msg); failures++; }
}

(async () => {
  check(fs.existsSync(DIST), 'dist/maqueen-grand-prix-offline.html existiert (vorher: npm run build)');
  if (!fs.existsSync(DIST)) process.exit(1);

  const html = fs.readFileSync(DIST, 'utf8');
  // Ausnahme wie in build.py: Links in den MakeCode-Editor laden nichts in diese Seite
  const ext = html.match(/(?:src|href)="https?:\/\/(?!makecode\.microbit\.org\/#)[^"]*"|src="https?:\/\/makecode[^"]*"|url\(\s*["']?https?:\/\//g) || [];
  check(ext.length === 0, 'keine externen Verweise' + (ext.length ? ': ' + ext.slice(0, 3).join(', ') : ''));
  const vorlage = fs.readFileSync(path.join(__dirname, '..', '..', 'microbit', 'vorlage', 'vorlage.mkcd')).toString('base64');
  check(html.includes('href="https://makecode.microbit.org/#newproject"'), 'Link „neues MakeCode-Projekt“ (Station 1)');
  check(html.includes('href="https://makecode.microbit.org/#project:' + vorlage + '"'), 'Link „Vorlage in MakeCode“ trägt vorlage.mkcd (Station 3)');

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + DIST);
  await page.waitForTimeout(500);
  check(await page.$eval('#tval', e => e.textContent) === '120:00', 'Timer steht auf 120:00');

  // Sicherheitsfenster beim Teamstart
  check(await page.$eval('#safety', e => !e.hidden), 'Sicherheit: Fenster erscheint beim ersten Öffnen');
  const sTxt = (await page.$eval('#safety', e => e.textContent)).replace(/\u00a0/g, ' ');
  check(['orangen Band', 'anheben', 'Schalter aus', 'frei drehenden', 'Getränke', 'Betreuer sagen', 'absichtlich'].every(w => sTxt.includes(w)), 'Sicherheit: alle Regeln und der Satz zum Ausschluss');
  check(!/\p{Extended_Pictographic}/u.test(sTxt), 'Sicherheit: kein Emoji');
  await page.keyboard.press('Escape');
  check(await page.$eval('#safety', e => !e.hidden), 'Sicherheit: Escape schließt nicht');
  await page.click('#safetyok');
  check(await page.$eval('#safety', e => e.hidden), 'Sicherheit: Knopf schließt das Fenster');
  await page.reload(); await page.waitForTimeout(300);
  check(await page.$eval('#safety', e => e.hidden), 'Sicherheit: nach Neuladen nicht noch einmal');
  await page.click('#safetybtn');
  check(await page.$eval('#safety', e => !e.hidden), 'Sicherheit: Knopf in der Kopfzeile holt es zurück');
  await page.click('#safetyok');

  // Figur
  check(await page.$eval('#figur svg', e => e.getBoundingClientRect().height) > 100, 'Figur: SVG wird gezeichnet');
  check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Figur: Leerlauf nach dem Laden');
  check(await page.$eval('#figur .lid', e => getComputedStyle(e).animationName) === 'figur-blinzeln', 'Figur: blinzelt');
  check(await page.$eval('#figurname', e => e.textContent) === 'Franco', 'Figur: Name steht dran');
  check(await page.$eval('#figur .mund', e => getComputedStyle(e).stroke === getComputedStyle(document.body).color), 'Figur: Mund hat die Textfarbe');
  await page.mouse.move(1200, 900);
  check(await page.$eval('#figur .pupille', e => /translate\(\s*[1-9]/.test(e.getAttribute('transform') || '')), 'Figur: Pupillen folgen der Maus');
  const ctxR = await browser.newContext({ reducedMotion: 'reduce', offline: true, viewport: { width: 1280, height: 1000 } });
  const pR = await ctxR.newPage();
  pR.on('pageerror', e => errors.push(String(e)));
  await pR.goto('file://' + DIST);
  await pR.waitForTimeout(300);
  check(await pR.$eval('#figur svg', e => getComputedStyle(e).animationName) === 'none', 'Figur: reduzierte Bewegung hält den Körper still');
  check(await pR.$eval('#figur .lid', e => getComputedStyle(e).animationName) === 'figur-blinzeln', 'Figur: blinzelt auch bei reduzierter Bewegung');
  // Reduzierte Bewegung: kein Tipp-Effekt, alle Blasen des ersten Schritts sofort da (Drehbuch 0 hat dort 5: 4 Text, 1 Blockstapel)
  await pR.click('#safetyok');
  check(await pR.$$eval('#chat .blase', l => l.length) === 5 && await pR.$('#antworten button[data-fertig]') !== null, 'Gespräch: reduzierte Bewegung zeigt den ersten Schritt sofort');
  check(await pR.$eval('#figur svg', e => e.getAttribute('aria-label')) === 'Franco, das FRANCOR-Maskottchen', 'Figur: aria-label aus MASKOTTCHEN_NAME');
  check(await pR.$$eval('#coach .figurname-ref', l => l.length >= 3 && l.every(e => e.textContent === 'Franco')), 'Handbuch: Name der Figur aus MASKOTTCHEN_NAME');
  await ctxR.close();

  // Struktur: keine Stationsseiten mehr, die Rail trägt die Minuten, die Drehbücher stimmen damit überein
  check((await page.$$('.station:not(.page)')).length === 0, 'keine Stationsseiten mehr (alles läuft im Gespräch)');
  const railMins = await page.$$eval('.stepbtn:not(.page) .min', s => s.map(x => parseInt(x.textContent, 10)));
  check(railMins.length === 6 && railMins.reduce((a, b) => a + b, 0) === 105, 'Rail: sechs Stationen, Minuten summieren auf 105 (' + railMins.join('+') + ')');
  const dbMin = await page.evaluate(() => window.__drehbuchMin);
  check(Array.isArray(dbMin) && dbMin.length >= 1 && dbMin.every((m, i) => m === undefined || m === null || m === railMins[i]), 'Drehbuch-Minuten = Rail-Minuten (' + JSON.stringify(dbMin) + ')');

  // Sicherheitsfenster auf Handybreite
  {
    const ctx2 = await browser.newContext({ offline: true, colorScheme: 'dark', viewport: { width: 360, height: 800 } });
    const p2 = await ctx2.newPage();
    p2.on('pageerror', e => errors.push(String(e)));
    await p2.goto('file://' + DIST);
    await p2.waitForTimeout(300);
    check(await p2.evaluate(() => { const b = document.querySelector('#safety .sbox').getBoundingClientRect(); return b.left >= 0 && b.right <= window.innerWidth; }), 'Sicherheit: Fenster passt auf 360 px (dunkel)');
    // Station 5 im Dunkelmodus auf Handybreite: Skizze im Gespräch
    await p2.click('#safetyok'); await p2.waitForTimeout(100);
    await p2.click('.stepbtn[data-go="5"]'); await p2.waitForTimeout(300);
    await p2.evaluate(() => window.__karte(5, 'k5-gpmap'));
    await p2.waitForTimeout(100);
    check(await p2.$('#chat #gpmap') !== null, 'Station 5: Streckenskizze im Gespräch (dunkel, 360 px)');
    check(await p2.$eval('#gpmap .gp-mat', e => getComputedStyle(e).fill).catch(() => '') === 'rgb(255, 255, 255)', 'Station 5: Matte bleibt im Dunkelmodus weiß');
    check(await p2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Station 5: kein waagerechter Scroll bei 360 px');
    const fig = await p2.$eval('.figur', e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, vis: getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' }; });
    check(fig.vis && fig.w > 0 && fig.h > 0 && fig.w <= 80, 'Station 5: Figur sichtbar und höchstens 80 px breit bei 360 px (' + Math.round(fig.w) + ' px)');
    check(await p2.$eval('#figur .mund', e => getComputedStyle(e).stroke) === 'rgb(230, 237, 239)', 'Figur: Mund ist im Dunkelmodus hell');
    await ctx2.close();
  }

  // Karten sind im Vorrat versteckt, bis das Gespräch sie holt
  check(await page.$('#karten #mqmap') !== null, 'Karten: Vorrat trägt die Maqueen-Übersicht');
  for (const id of ['k0-mqmap', 'k0-quiz', 'k0-klemmt', 'k1-film', 'k1-start', 'k1-herz', 'k1-quiz', 'k1-klemmt', 'k2-knoepfe', 'k2-neigen', 'k2-tabelle', 'k2-zahl', 'k2-quiz', 'k2-wuerfel', 'k2-klemmt', 'k3-mqinsert', 'k3-tabelle', 'k3-bloecke', 'k3-quiz', 'k3-klemmt', 'k4-laser', 'k4-bedingung', 'k4-bauen', 'k4-quiz', 'k4-klemmt', 'k5-gpmap', 'k5-typen', 'k5-kreuzungen', 'k5-melodie', 'k5-tempo', 'k5-plan', 'k5-variable', 'k5-final', 'k5-klemmt'])
    check(await page.$('#karten [data-karte="' + id + '"]') !== null, 'Karten: ' + id + ' im Vorrat');

  // Stückliste: Seite oben in der Leiste, keine Station, kein Gespräch
  check(await page.$eval('#rail .stepbtn:first-of-type', e => e.classList.contains('page') && e.textContent.includes('Stückliste')), 'Stückliste: erster Knopf in der Leiste');
  check(await page.$$eval('.stepbtn .min', s => s.filter(x => /\d/.test(x.textContent)).length) === 6, 'Stückliste: zählt nicht zu den Stationsminuten');
  await page.click('.stepbtn[data-go="teile"]'); await page.waitForTimeout(100);
  check(await page.$eval('.page[data-st="teile"]', e => !e.hidden) && await page.$eval('#gespraech', e => e.hidden) && await page.$eval('#figur', e => e.hidden), 'Stückliste: öffnet, Gespräch und Figur sind ausgeblendet');
  check(await page.$eval('#tval', e => e.textContent) === '120:00', 'Stückliste: startet den Timer nicht');
  const teile = (await page.$eval('.page[data-st="teile"]', e => e.textContent)).replace(/\u00a0/g, ' ');
  for (const w of ['micro:bit V2', 'Maqueen Plus V3', 'DFRobot', '18650', '4 × AA', 'Datenkabel', 'Button Top'])
    check(teile.includes(w), 'Stückliste: nennt "' + w + '"');
  check(await page.$$eval('.page[data-st="teile"] a[href]', l => l.every(a => a.getAttribute('href').startsWith('https://makecode.microbit.org/#'))), 'Stückliste: kein Shop-Link, nur MakeCode');
  check(!/\p{Extended_Pictographic}/u.test(teile), 'Stückliste: kein Emoji');
  await page.reload(); await page.waitForTimeout(300);
  check(await page.$eval('.page[data-st="teile"]', e => !e.hidden) && await page.$eval('#gespraech', e => e.hidden), 'Stückliste: bleibt nach Neuladen offen');
  await page.click('.page[data-st="teile"] [data-go="0"]'); await page.waitForTimeout(100);
  check(await page.$eval('.page[data-st="teile"]', e => e.hidden) && await page.$eval('#gespraech', e => !e.hidden) && await page.$eval('#figur', e => !e.hidden), 'Stückliste: Knopf „Zum Workshop“ führt zurück ins Gespräch');
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 0), 'Stückliste: vergibt kein Abzeichen');

  // Keine Punkteanzeige mehr
  check((await page.$('#ptsval')) === null, 'keine Punkteanzeige');
  // (erster Schritt: 5 Blasen × 700 ms)
  // Gespräch Station 0 – frischer Kontext, damit Franco den ersten Schritt gerade erst spricht.
  // Er wartet, bis das Sicherheitsfenster zu ist.
  {
    const ctxG = await browser.newContext({ viewport: { width: 1280, height: 1000 }, offline: true });
    const page = await ctxG.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + DIST);
    await page.waitForTimeout(300);
    check((await page.$$('#chat .blase')).length === 0, 'Gespräch: Franco schweigt, solange das Sicherheitsfenster offen ist');
    await page.click('#safetyok');
    // Gespräch Station 0
    check(await page.$eval('#chat .blase', e => !!e), 'Gespräch: erste Blase da');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'reden', 'Figur: redet beim Abspielen');
    check(await page.$eval('#figur .mund', e => getComputedStyle(e).animationName) === 'figur-mund', 'Figur: Mund bewegt sich beim Reden');
    await page.waitForTimeout(4000);
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Figur: nach dem Schritt Leerlauf');
    const n0 = await page.$$eval('#chat .blase', l => l.length);
    await page.reload(); await page.waitForTimeout(300);
    check(await page.$$eval('#chat .blase', l => l.length) === n0, 'Gespräch: Neuladen zeigt den Verlauf, nichts doppelt');
    check(await page.$('#antworten button[data-fertig]') !== null, 'Gespräch: Antwortknöpfe nach Neuladen da');
    check(await page.$('#antworten button[data-frage]') !== null, 'Gespräch: Knopf „Geht nicht“ da');
    let runden = 0;
    while (await page.$('#antworten button[data-fertig]') && runden++ < 10) { await page.click('#antworten button[data-fertig]'); await page.waitForTimeout(3500); }
    check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Station 0 durchgespielt → Abzeichen');
    check(await page.$('#antworten button[data-go="1"]') !== null, 'Gespräch: Knopf zur Station 1');
    check(await page.$('#chat .blase.karte[data-k="k0-mqmap"]') !== null, 'Gespräch: Karte Maqueen-Übersicht im Verlauf');
    await page.click('.stepbtn[data-go="0"]'); await page.waitForTimeout(300);
    check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Zurück zu Station 0: kein zweites Abzeichen');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Zurück zu Station 0: nichts wird neu abgespielt');
    // Weiter zu Station 1: Franco spricht deren ersten Schritt
    await page.click('#antworten button[data-go="1"]'); await page.waitForTimeout(300);
    // (mit Tipp-Effekt steht der Schritt sofort im Verlauf, die Blasen folgen nach und nach)
    check(await page.evaluate(() => (JSON.parse(localStorage.getItem('mgp-v1')).chat[1] || []).some(e => /Ja, ihr dürft/.test(e.h || ''))), 'Gespräch: Weiter zu Station 1 startet deren Drehbuch');
    check(await page.$eval('#timer', e => e.classList.contains('running')), 'Gespräch: Weiter startet den Timer');
    // Neues Team leert das Gespräch, Franco wartet wieder auf das Sicherheitsfenster
    await page.click('#resetbtn'); await page.waitForTimeout(200);
    check((await page.$$('#chat .blase')).length === 0, '"Neues Team" leert das Gespräch');
    await page.click('#safetyok'); await page.waitForTimeout(100);
    check(await page.$$eval('#chat .blase', l => l.length) >= 1, '"Neues Team": Franco begrüßt nach dem Sicherheitsfenster');
    await ctxG.close();
  }

  // Station 1 und 2 als Gespräch. Reduzierte Bewegung: kein Tipp-Effekt, jeder Klick spielt sofort.
  {
    const ctxS = await browser.newContext({ reducedMotion: 'reduce', offline: true, viewport: { width: 1280, height: 1000 } });
    const page = await ctxS.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.click('#safetyok');
    const weiter = async () => { if (!(await page.$('#antworten button[data-fertig]'))) return; await page.click('#antworten button[data-fertig]'); await page.waitForTimeout(50); };
    // Station 1: Erlaubnis und MakeCode-Knopf, dann Klammer-Blöcke in der Karte
    await page.click('.stepbtn[data-go="1"]'); await page.waitForTimeout(100);
    check(/Ja, ihr dürft\. Jetzt\./.test(await page.$eval('#chat', e => e.textContent)), 'Station 1: Franco gibt die Erlaubnis');
    check(await page.$('#chat .blase.karte a[href="https://makecode.microbit.org/#newproject"]') !== null, 'Station 1: Knopf „Neues Projekt starten“ im Gespräch');
    // „Zeig mir“: Zusatz-Erklärung ohne Schrittwechsel (Schritt „umschauen“)
    await weiter();
    const vorZeig = await page.$$eval('#chat .blase', l => l.length);
    await page.click('#antworten button[data-zeig="So bedient ihr MakeCode"]'); await page.waitForTimeout(100);
    check(await page.$$eval('#chat .blase', l => l.length) === vorZeig + 4, 'Gespräch: „Zeig mir“ zeigt Antwort und Erklärung');
    check(await page.$$eval('#chat .blase.me', l => l.length && l[l.length - 1].textContent) === 'So bedient ihr MakeCode', 'Gespräch: eigene Antwort als Blase rechts');
    check(await page.$('#antworten button[data-fertig]') !== null && (await page.$eval('#antworten button[data-fertig]', e => e.textContent)) === 'Alles gefunden ✓', 'Gespräch: „Zeig mir“ wechselt den Schritt nicht');
    let r1 = 0;
    while (!(await page.$('#chat [data-karte="k1-herz"]')) && r1++ < 5) await weiter();
    check(await page.isVisible('#chat [data-karte="k1-herz"]'), 'Station 1: Karte k1-herz sichtbar');
    // MakeCode-Film: unter reduzierter Bewegung steht das Endbild (Block in beim Start, Herz in der Vorschau)
    check(await page.$('#chat [data-karte="k1-film"] svg .mcf-drag') !== null, 'Station 1: MakeCode-Film im Gespräch');
    check(await page.$eval('#chat .mcf-drag', e => getComputedStyle(e).transform) === 'matrix(1, 0, 0, 1, 386, 84)', 'Station 1: Film-Endbild – Block liegt in beim Start');
    check(await page.$$eval('#chat .mcf-led.on', l => l.length === 16 && l.every(e => getComputedStyle(e).fill === 'rgb(255, 61, 46)')), 'Station 1: Film-Endbild – Herz in der Vorschau');
    check(await page.$$eval('#chat .mcf-fly, #chat .mcf-hl, #chat .mcf-ring', l => l.every(e => getComputedStyle(e).opacity === '0')), 'Station 1: Film-Endbild – Blockliste und Markierungen aus');
    const loopKids = await page.$$eval('#chat .mcc', l => l.map(c => c.querySelector('.mch').textContent.trim() + ':' + c.querySelectorAll(':scope > .mcbody > .mcb').length));
    check(loopKids.includes('beim Start:1') && loopKids.includes('dauerhaft:4'), 'Station 1: Klammer-Blöcke in der Karte (' + loopKids.join(', ') + ')');
    check(await page.$$eval('#chat .mcb .ledico[aria-label="Herz"] span.on', l => l.length === 16), 'Station 1: Herz als 5×5-Bild');
    r1 = 0;
    while (!(await page.$eval('.stepbtn[data-go="1"]', e => e.classList.contains('done'))) && r1++ < 8) await weiter();
    check(await page.$('#chat [data-karte="k1-quiz"] .quiz[data-quiz="q1"]') !== null, 'Station 1: Quiz als Karte');
    check(await page.$eval('.stepbtn[data-go="1"]', e => e.classList.contains('done')), 'Station 1 durchgespielt → Abzeichen');
    // Station 2: Bonus überspringen blockiert das Abzeichen nicht (Review-Fokus 5)
    await page.click('#antworten button[data-go="2"]'); await page.waitForTimeout(100);
    // unterwegs: „Es klappt nicht“ beim Neigen holt die Checkliste, die Grenze ist ein eigener Schritt
    let r2 = 0, klemmtNeigen = false, grenzeFertig = '', zahlKarte = false;
    while (!(await page.$('#antworten button[data-skip]')) && await page.$('#antworten button[data-fertig]') && r2++ < 12) {
      // Schritt erkennen am Fertig-Knopf (die Drehbücher liegen nicht global)
      const fk = await page.$eval('#antworten button[data-fertig]', e => e.textContent);
      if (fk === 'Pfeile und Totenkopf ✓' && !klemmtNeigen) {
        await page.click('#antworten button[data-zeig="Es klappt nicht"]'); await page.waitForTimeout(50);
        klemmtNeigen = await page.$('#chat [data-karte="k2-klemmt"]') !== null;
      }
      if (await page.$('#chat [data-karte="k2-tabelle"]') && !grenzeFertig) {
        grenzeFertig = fk;
        await page.click('#antworten button[data-zeig="Die Zahl selbst sehen"]'); await page.waitForTimeout(50);
        zahlKarte = await page.$('#chat [data-karte="k2-zahl"] .mcc') !== null;
      }
      await weiter();
    }
    check(klemmtNeigen, 'Station 2: „Es klappt nicht“ beim Neigen zeigt k2-klemmt');
    check(grenzeFertig === 'Verstanden ✓', 'Station 2: Grenze 200 als eigener Schritt mit Tabelle (' + grenzeFertig + ')');
    check(zahlKarte, 'Station 2: Extra „Die Zahl selbst sehen“ zeigt zeige Zahl (Beschleunigung y) als Klammer');
    check(await page.$('#chat #mbmatrix') === null && await page.$('#karten #mbsim') === null, 'Station 2: kein eigener Simulator mehr (MakeCode-Simulator)');
    check(await page.$('#antworten button[data-skip]') !== null && (await page.$eval('#antworten button[data-skip]', e => e.textContent)) === 'Überspringen', 'Station 2: Knopf „Überspringen“ beim Würfel');
    const vorher = await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length);
    await page.click('#antworten button[data-skip]'); await page.waitForTimeout(100);
    check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) >= 1 && await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) === vorher + 1, 'Station 2: Abzeichen trotz übersprungenem Extra');
    check(await page.$('#antworten button[data-extra]') !== null, 'Station 2: Extra bleibt erreichbar');
    check(await page.$eval('#antworten button[data-extra]', e => e.textContent) === 'Extra: Würfel', 'Station 2: Extra heißt „Extra: Würfel“');
    // Extra nachholen: Würfelkarte kommt, danach ist der Knopf weg
    await page.click('#antworten button[data-extra]'); await page.waitForTimeout(100);
    check(await page.$('#chat [data-karte="k2-wuerfel"] .mcc') !== null, 'Station 2: Extra zeigt die Würfel-Blöcke');
    await page.click('#antworten button[data-zeig="Es klappt nicht"]'); await page.waitForTimeout(50);
    check(/Laufschrift/.test(await page.$eval('#chat', e => e.textContent)) && await page.$('#chat [data-karte="k2-klemmt"]') !== null, 'Station 2: „Es klappt nicht“ beim Würfel zeigt Laufschrift-Tipp und k2-klemmt');
    await weiter();
    check(await page.$('#antworten button[data-extra]') === null && await page.evaluate(() => JSON.parse(localStorage.getItem('mgp-v1')).bonus.wuerfel === 1), 'Station 2: Extra erledigt, Knopf weg');
    await ctxS.close();
  }

  // Station 3 und 4 als Gespräch. Reduzierte Bewegung; Schritte erkennt der Test am Fertig-Knopf.
  {
    const ctxT = await browser.newContext({ reducedMotion: 'reduce', offline: true, viewport: { width: 1280, height: 1000 } });
    const page = await ctxT.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.click('#safetyok');
    const fertigText = async () => (await page.$('#antworten button[data-fertig]')) ? page.$eval('#antworten button[data-fertig]', e => e.textContent) : '';
    const weiter = async () => { if (!(await page.$('#antworten button[data-fertig]'))) return; await page.click('#antworten button[data-fertig]'); await page.waitForTimeout(50); };
    const klammern = () => page.$$eval('#chat .mcc', l => l.map(c => c.querySelector('.mch').textContent.trim().replace(/\s+/g, ' ') + ':' + c.querySelectorAll(':scope > .mcbody > .mcb, :scope > .mcbody > .mcc').length));
    const abzeichen = () => page.$eval('#badges', e => e.querySelectorAll('.badge.on').length);

    // Station 3: Vorlage „Linie“, Einsetzen, Sensorzahlen, Ampel + Line patrolling, Fahren, Quiz
    await page.click('.stepbtn[data-go="3"]'); await page.waitForTimeout(100);
    check(/Linie/.test(await page.$eval('#chat', e => e.textContent)) && await page.$('#chat .blase.karte a[href^="https://makecode.microbit.org/#project:"]') !== null, 'Station 3: Knopf „Neues Roboter-Projekt starten“, Projekt heißt Linie');
    let r3 = 0, klemmt3 = false, chips3 = null;
    while (await page.$('#antworten button[data-fertig]') && r3++ < 10) {
      if (await fertigText() === 'Er fährt!' && !chips3) {
        await page.click('#antworten button[data-zeig="Es klappt nicht"]'); await page.waitForTimeout(50);
        klemmt3 = await page.$('#chat [data-karte="k3-klemmt"]') !== null;
        await page.click('#antworten button[data-frage]'); await page.waitForTimeout(50);
        chips3 = await page.$$eval('#frage .chip', l => l.map(e => e.textContent));
        await page.click('#frage button[data-zurueck]'); await page.waitForTimeout(50);
      }
      await weiter();
    }
    check(await page.$('#chat [data-karte="k3-mqinsert"] #mqinsert') !== null, 'Station 3: Einsetz-Figur im Gespräch');
    const txt3 = await page.$eval('#chat', e => e.textContent);
    check(/3800/.test(txt3) && /2700/.test(txt3), 'Station 3: Weiß ≈ 3800, Schwarz ≈ 2700');
    const k3 = await klammern();
    check(k3.includes('beim Start:1') && k3.includes('wenn Knopf A geklickt:7') && k3.includes('wenn Knopf B geklickt:1'), 'Station 3: Ampel + Line patrolling als Klammer (' + k3.join(', ') + ')');
    check(await page.$$eval('#chat .mcb.b-mq', l => l.length > 0 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(15, 188, 17)')), 'Station 3: Maqueen-Blöcke hellgrün');
    check(!/steuere|linkes Rad|beide Räder|-mal wiederholen/.test(txt3), 'Station 3: kein Motorblock, keine Schleife (Parcours first)');
    check(klemmt3, 'Station 3: „Es klappt nicht“ zeigt k3-klemmt');
    check(JSON.stringify(chips3) === JSON.stringify(['Der micro:bit zeigt nur ein X', 'Er fährt von der Linie runter', 'Er fährt gar nicht los', 'Die Ampel leuchtet nicht']), 'Station 3: Chips beim Fahren (' + JSON.stringify(chips3) + ')');
    check(await page.$('#chat [data-karte="k3-quiz"] .quiz[data-quiz="q3"]') !== null, 'Station 3: Quiz als Karte');
    check(await page.$eval('.stepbtn[data-go="3"]', e => e.classList.contains('done')), 'Station 3 durchgespielt → Abzeichen');

    // Station 4: weiter im Projekt Linie, Laser, Bedingung mit Bauanleitung, Denkfrage
    await page.click('#antworten button[data-go="4"]'); await page.waitForTimeout(100);
    check(/Meine Projekte/.test(await page.$eval('#chat', e => e.textContent)), 'Station 4: weiter im Projekt Linie');
    let r4 = 0;
    while (await page.$('#antworten button[data-fertig]') && r4++ < 10) await weiter();
    const k4 = await klammern();
    check(k4.includes('dauerhaft:2') && k4.some(k => /^wenn .*< 200 dann:2$/.test(k)), 'Station 4: Laser-Stopp als Klammer, wenn mit zwei Blöcken (' + k4.join(', ') + ')');
    check(await page.$$eval('#chat .mcb.b-lidar', l => l.length > 0 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(91, 63, 232)')), 'Station 4: Laserblöcke lila');
    check(await page.$$eval('#chat .mcstack', l => l.every(st => { const r = st.getBoundingClientRect().right + 1; return [...st.querySelectorAll('.mcb')].every(b => b.getBoundingClientRect().right <= r); })), 'Station 4: lange Blöcke ragen nicht aus der Karte');
    check(await page.$('#chat [data-karte="k4-bauen"] ol.steps') !== null, 'Station 4: Bauanleitung „Erst die Form, dann der Inhalt“');
    check(!/ansonsten|Variable|pausiert|Staubsauger/.test(await page.$eval('#chat', e => e.textContent)), 'Station 4: nur der Laser-Stopp (kein ansonsten, keine Variable)');
    check(await page.$('#chat [data-karte="k4-quiz"] .quiz[data-quiz="q4"]') !== null, 'Station 4: Quiz als Karte');
    check(await page.$eval('.stepbtn[data-go="4"]', e => e.classList.contains('done')), 'Station 4 durchgespielt → Abzeichen');
    await ctxT.close();
  }

  // Station 5 und Durchlauf aller Stationen: frischer Kontext, reduzierte Bewegung, jeder Knopf sofort
  {
    const ctxD = await browser.newContext({ reducedMotion: 'reduce', offline: true, viewport: { width: 1280, height: 1000 } });
    const page = await ctxD.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.click('#safetyok'); await page.waitForTimeout(100);
    // Schritt-IDs aus den Quellen (DREHBUCH ist in der Seite nicht global)
    const vm = require('vm');
    const dbCtx = vm.createContext({ DREHBUCH: [] });
    const dbDir = path.join(__dirname, '..', 'src', 'drehbuch');
    for (const f of fs.readdirSync(dbDir).filter(f => f.endsWith('.js')).sort()) vm.runInContext(fs.readFileSync(path.join(dbDir, f), 'utf8'), dbCtx);
    const schrittId = (st, i) => { const d = dbCtx.DREHBUCH[st]; return d && d.schritte[i] ? d.schritte[i].id : (d && i >= d.schritte.length ? 'ende' : String(i)); };
    const zustand = () => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('mgp-v1') || '{}'); return { st: s.cur, i: (s.schritt || {})[s.cur] }; });
    const stand = async () => { const z = await zustand(); return 'Station ' + z.st + ', Schritt ' + schrittId(z.st, z.i); };
    const knoepfe = () => page.$$eval('#antworten button', l => l.map(b => b.textContent));
    let schritte = 0, abgeschlossen = false, haenger = '';
    const gesehen5 = new Set();
    while (schritte++ < 150) {
      await page.waitForSelector('#antworten button', { timeout: 2000 }).catch(() => {});
      const z = await zustand();
      if (z.st === 5) gesehen5.add(schrittId(5, z.i));
      if (await page.$('#antworten button[data-abschluss]')) { await page.click('#antworten button[data-abschluss]'); await page.waitForTimeout(100); abgeschlossen = true; break; }
      const sel = ['#antworten button[data-skip]', '#antworten button[data-fertig]', '#antworten button[data-go]'];
      let geklickt = false;
      for (const q of sel) if (await page.$(q)) { await page.click(q); await page.waitForTimeout(30); geklickt = true; break; }
      if (!geklickt) { haenger = (await stand()) + ', Knöpfe: ' + JSON.stringify(await knoepfe()); break; }
    }
    if (!abgeschlossen && !haenger) haenger = (await stand()) + ' (mehr als 150 Klicks)';
    check(abgeschlossen, 'Durchlauf: von Station 0 bis „Workshop abschließen ✓“' + (haenger ? ' — hängt bei ' + haenger : ''));
    check(await page.$eval('#finaltitle', e => e.textContent).catch(() => '') === 'Workshop geschafft!', 'Durchlauf: #finaltitle „Workshop geschafft!“');
    check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) === 6, 'Durchlauf: alle 6 Abzeichen an');
    check(await page.$('#chat [data-karte="k5-final"] #finaltitle') !== null, 'Station 5: Pokal-Karte im Gespräch');
    check(await page.$eval('#finalwho', e => e.textContent).catch(() => '') === '6 von 6 Abzeichen', 'Station 5: Pokal zählt 6 von 6');
    const soll5 = ['strecke', 'arten', 'projekt', 'kreuzungen', 'melodie', 'tempo', 'lauf', 'profi', 'abschluss'];
    check(soll5.every(id => gesehen5.has(id)), 'Station 5: Schritte ' + soll5.join(', ') + ' (gesehen: ' + [...gesehen5].join(', ') + ')');
    // Station 5 im Verlauf: Skizze, Grand-Prix-Blöcke, Ampel + Speed 2 + Laser im Programm, Pro-Ziel als Extra, Stückliste
    check(await page.$('#chat [data-karte="k5-gpmap"] #gpmap') !== null && (await page.$eval('#gpmap', e => e.getBoundingClientRect().height)) > 120, 'Station 5: Streckenskizze im Gespräch gezeichnet');
    check(JSON.stringify(await page.$$eval('#chat #gpmap .gp-k', l => l.map(e => e.textContent.trim()))) === '["1","2","3","4"]', 'Station 5: Skizze nummeriert 1–4');
    check(await page.$$eval('#chat #gpmap .gp-k', l => l.length === 4 && l.every(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; })), 'Station 5: Nummern 1–4 sichtbar');
    const gpText = await page.$eval('#chat #gpmap', e => e.textContent).catch(() => '');
    check(gpText.includes('Ziel') && gpText.includes('Pro-Ziel') && gpText.includes('Start'), 'Station 5: Start, Ziel und Pro-Ziel beschriftet');
    check(await page.$$eval('#chat .mcb.b-gp', l => l.length >= 2 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(60, 60, 60)')), 'Station 5: Grand-Prix-Blöcke in Graphit');
    const k5 = await page.$$eval('#chat [data-karte="k5-kreuzungen"] .mcc', l => l.map(c => c.querySelector('.mch').textContent.trim().replace(/\s+/g, ' ') + ':' + c.querySelectorAll(':scope > .mcbody > .mcb, :scope > .mcbody > .mcc').length));
    check(k5.includes('wenn Knopf A geklickt:12') && k5.includes('dauerhaft:2'), 'Station 5: Knopf A mit Regeln, Ampel, Speed 2, Line patrolling ON; Laser-Stopp in dauerhaft (' + k5.join(', ') + ')');
    const txt5 = await page.evaluate(() => (JSON.parse(localStorage.getItem('mgp-v1')).chat[5] || []).map(e => e.h || '').join(' '));
    check(/Meine Projekte/.test(txt5) && /Gummibärchen/.test(txt5) && /Stückliste/.test(txt5), 'Station 5: weiter im Projekt Linie, Gummibärchen für alle, Hinweis auf die Stückliste');
    check(await page.$('#chat button[data-go="teile"]') !== null, 'Station 5: Knopf „Stückliste öffnen“ im Gespräch');
    check(await page.$('#antworten button[data-extra]') !== null && await page.$eval('#antworten button[data-extra]', e => e.textContent) === 'Extra: Pro-Ziel', 'Station 5: Extra heißt „Extra: Pro-Ziel“');
    await page.click('#antworten button[data-extra]'); await page.waitForTimeout(100);
    await page.click('#antworten button[data-zeig="Die Melodie kommt schon am Ziel 4?"]'); await page.waitForTimeout(50);
    check(await page.$$eval('#chat .mcb.b-var', l => l.length === 1 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(220, 20, 60)')), 'Station 5: Variable gesprungen im Pro-Ziel, rot');
    check(!/\p{Extended_Pictographic}/u.test(await page.$eval('#chat', e => e.textContent)), 'Station 5: kein Emoji');
    await page.click('#chat button[data-go="teile"]'); await page.waitForTimeout(100);
    check(await page.$eval('.page[data-st="teile"]', e => !e.hidden) && await page.$eval('#gespraech', e => e.hidden), 'Station 5: Knopf „Stückliste öffnen“ öffnet die Seite');
    await ctxD.close();
  }

  // Frage-Feld „Geht nicht“. Letzte Textblase = letzte .blase ohne .karte (die Karte folgt der Blase).
  const letzteBlase = pg => pg.evaluate(() => { const l = document.querySelectorAll('#chat .blase:not(.karte)'); return l.length ? l[l.length - 1].textContent : ''; });
  {
    // ohne Netz, ohne Schlüssel: Rückfallantwort mit Karte „Wenn es klemmt“
    const ctxF = await browser.newContext({ viewport: { width: 1280, height: 1000 }, offline: true });
    const page = await ctxF.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.click('#safetyok'); await page.waitForTimeout(4000);
    await page.click('#antworten button[data-frage]');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'sorge', 'Frage: Figur schaut besorgt, solange das Feld offen ist');
    await page.click('#frage button[data-zurueck]');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf' && await page.$('#antworten button[data-fertig]') !== null, 'Frage: „Doch nicht“ zurück zu Leerlauf und Knöpfen');
    await page.click('#antworten button[data-frage]');
    check(await page.$$eval('#frage .chips button', l => l.length >= 3), 'Frage: Chips da');
    check(await page.$eval('#frageeingabe', e => parseFloat(getComputedStyle(e).fontSize) >= 16), 'Frage: Eingabefeld mindestens 16 px');
    await page.click('#frage .chips button');
    await page.waitForTimeout(500);
    check((await letzteBlase(page)).includes('Wink den Betreuer'), 'Frage ohne Netz: Rückfallantwort');
    check(await page.$('#chat details.hint') !== null, 'Frage ohne Netz: Checkliste „Wenn es klemmt“ als Karte');
    check(await page.$('#antworten button[data-fertig]') !== null && await page.$('#antworten button[data-nochfrage]') !== null, 'Frage ohne Netz: Antwortknöpfe und „Noch eine Frage“');
    check(JSON.parse(await page.evaluate(() => localStorage.getItem('mgp-llm')) || '{"anfragen":0}').anfragen === 0, 'Frage ohne Netz: Zähler bleibt bei 0');
    await page.reload(); await page.waitForTimeout(300);
    check((await letzteBlase(page)).includes('Wink den Betreuer') && await page.$('#chat details.hint') !== null, 'Frage ohne Netz: Verlauf übersteht Neuladen');
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('mgp-v1')).fragen) === 1, 'Kontingent: Frage zählt in S.fragen');
    await ctxF.close();
  }
  {
    // Kontingent: 30 Fragen verbraucht → kein fetch, Kontingent-Blase und Checkliste
    const ctxK = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
    const page = await ctxK.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    let anfragen = 0;
    await page.route('https://openrouter.ai/**', r => { anfragen++; r.fulfill({ json: { choices: [{ message: { content: 'NICHT-ERWARTET' } }] } }); });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.evaluate(() => {
      localStorage.setItem('mgp-key', 'test');
      const s = JSON.parse(localStorage.getItem('mgp-v1') || '{}'); s.fragen = 30; localStorage.setItem('mgp-v1', JSON.stringify(s));
    });
    await page.reload(); await page.waitForTimeout(300);
    await page.click('#safetyok'); await page.waitForTimeout(200);
    await page.click('#antworten button[data-frage]');
    await page.click('#frage .chips button');
    await page.waitForTimeout(500);
    check(anfragen === 0, 'Kontingent: nach 30 Fragen keine Anfrage an OpenRouter');
    check((await letzteBlase(page)).includes('Frage-Kontingent') && await page.$('#chat details.hint') !== null, 'Kontingent: Blase „Frage-Kontingent … aufgebraucht“ mit Checkliste');
    await page.click('#resetbtn'); await page.waitForTimeout(100);
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('mgp-v1')).fragen) === 0, 'Kontingent: „Neues Team“ setzt S.fragen zurück');
    await ctxK.close();
  }
  {
    // mit Netz (gefälscht) und Schlüssel
    const ctxN = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await ctxN.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    // die absichtliche 500-Antwort meldet der Browser selbst als Konsolenfehler; das ist kein Skriptfehler
    page.on('console', m => { if (m.type() === 'error' && !/status of 500/.test(m.text())) errors.push(m.text()); });
    let anfrage = null;
    await page.route('https://openrouter.ai/**', r => {
      anfrage = { auth: r.request().headers()['authorization'], body: JSON.parse(r.request().postData() || '{}') };
      setTimeout(() => r.fulfill({ json: { choices: [{ message: { content: 'Stell ihn auf die Linie, dann A drücken. <b>x</b>' } }], usage: { prompt_tokens: 1200, completion_tokens: 30 } } }), 400);
    });
    await page.goto('file://' + DIST); await page.waitForTimeout(300);
    await page.evaluate(() => localStorage.setItem('mgp-key', 'test'));
    await page.click('#safetyok'); await page.waitForTimeout(4000);
    await page.click('#antworten button[data-frage]');
    await page.fill('#frageeingabe', 'Ist a < b und b > c?');
    await page.press('#frageeingabe', 'Enter');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'gruebeln', 'Frage: Figur grübelt, solange das LLM antwortet');
    await page.waitForTimeout(900);
    check((await letzteBlase(page)).includes('A drücken'), 'Frage: LLM-Antwort als Blase');
    check(await page.$eval('#chat', e => !e.innerHTML.includes('<b>x</b>')), 'Frage: Antwort des Modells wird nicht als HTML gedeutet');
    check(anfrage && anfrage.auth === 'Bearer test' && anfrage.body.model === 'anthropic/claude-haiku-4.5' && anfrage.body.max_tokens === 200, 'Frage: Anfrage trägt Schlüssel, Modell, max_tokens');
    check(anfrage.body.messages[0].role === 'system' && /höchstens drei Sätze/i.test(anfrage.body.messages[0].content) && anfrage.body.messages.reduce((n, m) => n + m.content.length, 0) < 6000, 'Frage: Systemprompt mit Regeln, unter ca. 2000 Token');
    // Rollenfolge (Anthropic über OpenRouter): nach system zuerst user, nie zweimal dieselbe Rolle
    const rollenOk = b => { const r = b.messages.map(m => m.role); const ns = r.filter(x => x !== 'system'); return r[0] === 'system' && ns[0] === 'user' && r.every((x, i) => i === 0 || x !== r[i - 1]) && r[r.length - 1] === 'user'; };
    check(rollenOk(anfrage.body), 'Frage: erste Nachricht nach system ist user, Rollen wechseln (' + anfrage.body.messages.map(m => m.role).join(',') + ')');
    check(/Bisher im Gespräch:[\s\S]*Franco: [\s\S]*Frage des Teams: Ist a < b und b > c\?/.test(anfrage.body.messages[1].content), 'Frage: Mitschrift und Frage in der user-Nachricht');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf' && await page.$('#antworten button[data-nochfrage]') !== null, 'Frage: danach Leerlauf und „Noch eine Frage“');
    check(JSON.parse(await page.evaluate(() => localStorage.getItem('mgp-llm'))).anfragen === 1, 'Zähler: eine Anfrage');
    await page.click('#coachbtn');
    check(await page.$eval('#llmzaehler', e => /1 Anfrage/.test(e.textContent)), 'Handbuch: Zähler sichtbar');
    await page.keyboard.press('Escape');
    // Schlüssel-Fenster über den Knopf in der Kopfzeile
    check(await page.$eval('#keydlg', e => e.hidden), 'Schlüssel: Fenster ist zu, bis man den Knopf drückt');
    await page.click('#keybtn');
    check(await page.$eval('#keydlg', e => !e.hidden), 'Schlüssel: Knopf „LLM Setup“ öffnet das Fenster');
    check(await page.$eval('#orkeystate', e => /gesetzt/.test(e.textContent)), 'Schlüssel: „Schlüssel gesetzt“ angezeigt');
    check(await page.$eval('#orkey', e => e.type === 'password' && e.value === ''), 'Schlüssel: Passwortfeld, leer');
    await page.fill('#orkey', ' sk-or-neu '); await page.press('#orkey', 'Enter');
    check(await page.evaluate(() => localStorage.getItem('mgp-key')) === 'sk-or-neu' && await page.$eval('#orkey', e => e.value === ''), 'Schlüssel: Enter speichert getrimmt und leert das Feld');
    await page.click('#orkeydel');
    check(await page.evaluate(() => localStorage.getItem('mgp-key')) === null && await page.$eval('#orkeystate', e => /kein Schlüssel/.test(e.textContent)), 'Schlüssel: Löschen entfernt ihn');
    await page.evaluate(() => localStorage.setItem('mgp-key', 'test'));
    await page.keyboard.press('Escape');
    check(await page.$eval('#keydlg', e => e.hidden), 'Schlüssel: Escape schließt das Fenster');
    await page.click('#keybtn'); await page.click('#keydlgok');
    check(await page.$eval('#keydlg', e => e.hidden), 'Schlüssel: „Schließen“ schließt das Fenster');
    check(!html.includes('sk-or-'), 'kein Schlüssel in der Datei');
    // Serverfehler: Rückfallantwort, Zähler bleibt
    await page.unroute('https://openrouter.ai/**');
    let anfrage2 = null;
    await page.route('https://openrouter.ai/**', r => { anfrage2 = JSON.parse(r.request().postData() || '{}'); r.fulfill({ status: 500, body: 'kaputt' }); });
    await page.click('#antworten button[data-nochfrage]');
    await page.fill('#frageeingabe', 'Es geht nicht');
    await page.press('#frageeingabe', 'Enter');
    await page.waitForTimeout(500);
    check((await letzteBlase(page)).includes('Wink den Betreuer'), 'Frage: Serverfehler 500 → Rückfallantwort');
    check(anfrage2 && rollenOk(anfrage2) && anfrage2.messages.length === 2 && anfrage2.messages.reduce((n, m) => n + m.content.length, 0) < 6000, 'Frage mit Verlauf: [system, user], unter dem Zeichenbudget');
    check(anfrage2 && anfrage2.messages[1].content.includes('Team: Ist a < b und b > c?'), 'Frage mit Verlauf: eigene Frage „a < b … > c“ bleibt Text (kein HTML-Strip)');
    check(JSON.parse(await page.evaluate(() => localStorage.getItem('mgp-llm'))).anfragen === 1, 'Zähler: Fehler zählt nicht');
    // späte Antwort nach „Neues Team“ darf nicht ins neue Gespräch
    await page.unroute('https://openrouter.ai/**');
    await page.route('https://openrouter.ai/**', async r => {
      await new Promise(x => setTimeout(x, 800));
      r.fulfill({ json: { choices: [{ message: { content: 'SPAETE-ANTWORT' } }], usage: { prompt_tokens: 10, completion_tokens: 5 } } });
    });
    await page.click('#antworten button[data-nochfrage]');
    await page.fill('#frageeingabe', 'Noch eine');
    await page.press('#frageeingabe', 'Enter');
    await page.click('#resetbtn');
    await page.waitForTimeout(1500);
    check(!(await page.evaluate(() => localStorage.getItem('mgp-v1'))).includes('SPAETE-ANTWORT') && !(await page.$eval('#chat', e => e.textContent)).includes('SPAETE-ANTWORT'), '„Neues Team“: späte LLM-Antwort landet nicht im neuen Gespräch');
    await page.click('#safetyok');
    await page.click('#coachbtn');
    await page.click('#llmreset');
    check(await page.$eval('#llmzaehler', e => /^0 Anfragen/.test(e.textContent.trim())), 'Handbuch: Zähler lässt sich nullen');
    await page.keyboard.press('Escape');
    await page.click('#resetbtn');
    check(await page.evaluate(() => localStorage.getItem('mgp-key')) === 'test', '„Neues Team“ behält den Schlüssel');
    await ctxN.close();
  }

  // Vorlesen (Web Speech API, Schalter mgp-tts)
  {
    const mock = () => {
      window.__gesprochen = [];
      window.__abgebrochen = 0;
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: u => window.__gesprochen.push(u.text), getVoices: () => [{ lang: 'de-DE', name: 'Test' }], cancel() { window.__abgebrochen++; } } });
      window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    };
    const ctxT = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const pT = await ctxT.newPage();
    await pT.addInitScript(mock);
    await pT.addInitScript(() => { try { if (!sessionStorage.getItem('tts-init')) { localStorage.setItem('mgp-tts', '1'); sessionStorage.setItem('tts-init', '1'); } } catch (e) {} });
    await pT.goto('file://' + DIST);
    await pT.click('#safetyok');
    await pT.waitForTimeout(1500);
    const gesp = await pT.evaluate(() => window.__gesprochen);
    check(gesp.length >= 1, 'Vorlesen: Blase wird gesprochen');
    check(gesp.length >= 1 && gesp[0].indexOf('<') === -1, 'Vorlesen: ohne HTML-Tags');
    // Neuladen liest den Verlauf nicht noch einmal vor
    await pT.evaluate(() => { window.__gesprochen.length = 0; });
    await pT.reload();
    await pT.waitForTimeout(800);
    check((await pT.evaluate(() => window.__gesprochen.length)) === 0, 'Vorlesen: Verlauf nach Neuladen bleibt still');
    // Schalter im Handbuch spiegelt mgp-tts und schreibt zurück
    await pT.click('#coachbtn');
    await pT.waitForTimeout(350);
    check(await pT.$eval('#ttsbox', e => e.checked), 'Vorlesen: Schalter zeigt „an“');
    await pT.click('#ttsbox');
    check(await pT.evaluate(() => localStorage.getItem('mgp-tts')) === '0', 'Vorlesen: Schalter schreibt mgp-tts');
    await pT.keyboard.press('Escape');
    await pT.click('#resetbtn');
    check(await pT.evaluate(() => localStorage.getItem('mgp-tts')) === '0', '„Neues Team“ lässt den Vorlese-Schalter stehen');
    await ctxT.close();
    check(await page.evaluate(() => localStorage.getItem('mgp-tts')) === null, 'Vorlesen: standardmäßig aus');
  }

  // Betreuer-Handbuch
  await page.click('#coachbtn');
  await page.waitForTimeout(350);
  check(await page.$eval('#coach', e => e.classList.contains('open')), 'Betreuer-Handbuch öffnet');
  const hb = await page.$eval('#coach', e => e.textContent);
  const hbn = hb.replace(/ /g, ' ');
  check(['Zählfahrt', 'Minute 15', 'geblitzt', '10 cm', '30 cm'].every(w => hbn.includes(w)), 'Handbuch: Abschnitt Grand Prix vollständig');
  await page.keyboard.press('Escape');

  // Reset
  await page.click('#resetbtn');
  await page.waitForTimeout(200);
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 0), '"Neues Team" setzt Abzeichen zurück');
  check(await page.$eval('#tval', e => e.textContent) === '120:00', '"Neues Team" stellt 120:00');
  check(await page.$eval('#safety', e => !e.hidden), '"Neues Team" zeigt das Sicherheitsfenster wieder');

  check(errors.length === 0, 'keine JavaScript-Fehler' + (errors.length ? ': ' + errors.join(' | ') : ''));

  await browser.close();
  console.log(failures ? '\n' + failures + ' Prüfung(en) fehlgeschlagen' : '\nalles grün');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
