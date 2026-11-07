/*
 * Smoketest für die Offline-Ausgabe.
 *
 *   npm test          (baut vorher nicht – erst `npm run build`)
 *
 * Prüft, was am Messetag weh tun würde:
 *   1. Die Datei lädt mit komplett abgeschaltetem Netzwerk, ohne JS-Fehler.
 *   2. Es gibt keine externen Verweise (Schriften, Skripte, Bilder).
 *   3. Keine Stationsseiten mehr; Rail-Minuten summieren auf 105 (+ 15 Puffer = 120)
 *      und stimmen mit den Drehbüchern überein (Testhaken window.__drehbuchMin).
 *   4. Karten: alle Pflicht-Karten liegen im versteckten Vorrat #karten; der Testhaken
 *      window.__karte holt sie ins Gespräch (nur unter file://).
 *   5. micro:bit-Simulator im Gespräch: Herz zeichnen → Erfolg, Logo oben/unten und Schütteln.
 *   6. Parcours-Simulator im Gespräch: Canvas gezeichnet, Level 1 mit "fahre 5" → im Ziel,
 *      nach Neuladen wieder im Gespräch.
 *   7. Figur (Blinzeln, Blick, reduzierte Bewegung) und Gespräch Station 0 (Verlauf, Knöpfe,
 *      Abzeichen, Neues Team).
 *   8. Betreuer-Handbuch öffnet sich, "Neues Team" setzt zurück.
 *   9. Sicherheitsfenster: beim Start da, nur der Knopf schließt, kommt nach "Neues Team" wieder.
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
  await page.mouse.move(1200, 900);
  check(await page.$eval('#figur .pupille', e => /translate\(\s*[1-9]/.test(e.getAttribute('transform') || '')), 'Figur: Pupillen folgen der Maus');
  const ctxR = await browser.newContext({ reducedMotion: 'reduce', offline: true, viewport: { width: 1280, height: 1000 } });
  const pR = await ctxR.newPage();
  pR.on('pageerror', e => errors.push(String(e)));
  await pR.goto('file://' + DIST);
  await pR.waitForTimeout(300);
  check(await pR.$eval('#figur svg', e => getComputedStyle(e).animationName) === 'none', 'Figur: reduzierte Bewegung hält den Körper still');
  check(await pR.$eval('#figur .lid', e => getComputedStyle(e).animationName) === 'figur-blinzeln', 'Figur: blinzelt auch bei reduzierter Bewegung');
  // Reduzierte Bewegung: kein Tipp-Effekt, alle Blasen des ersten Schritts sofort da (Drehbuch 0 hat dort 4)
  await pR.click('#safetyok');
  check(await pR.$$eval('#chat .blase', l => l.length) === 4 && await pR.$('#antworten button[data-fertig]') !== null, 'Gespräch: reduzierte Bewegung zeigt den ersten Schritt sofort');
  await ctxR.close();

  // Struktur: keine Stationsseiten mehr, die Rail trägt die Minuten, die Drehbücher stimmen damit überein
  check((await page.$$('.station')).length === 0, 'keine Stationsseiten mehr (alles läuft im Gespräch)');
  const railMins = await page.$$eval('.stepbtn .min', s => s.map(x => parseInt(x.textContent, 10)));
  check(railMins.length === 7 && railMins.reduce((a, b) => a + b, 0) === 105, 'Rail: sieben Stationen, Minuten summieren auf 105 (' + railMins.join('+') + ')');
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
    await ctx2.close();
  }

  // Karten sind im Vorrat versteckt, bis das Gespräch sie holt
  check(await page.$('#karten #mqmap') !== null, 'Karten: Vorrat trägt die Maqueen-Übersicht');
  for (const id of ['k0-mqmap', 'k0-quiz', 'k0-klemmt', 'k1-start', 'k1-herz', 'k1-quiz', 'k1-klemmt', 'k2-mbsim', 'k2-knoepfe', 'k2-neigen', 'k2-tabelle', 'k2-quiz', 'k2-wuerfel', 'k2-klemmt', 'k3-mqinsert', 'k3-sim', 'k3-motor', 'k3-dreh', 'k3-quadrat', 'k3-klemmt', 'k4-bloecke', 'k4-licht', 'k4-quiz', 'k4-klemmt', 'k5-laser', 'k5-logik', 'k5-bauen', 'k5-pause', 'k5-quiz', 'k5-klemmt', 'k6-gpmap', 'k6-final', 'k6-klemmt'])
    check(await page.$('#karten [data-karte="' + id + '"]') !== null, 'Karten: ' + id + ' im Vorrat');

  // Station 2: micro:bit-Simulator
  await page.click('.stepbtn[data-go="2"]'); await page.waitForTimeout(400);
  await page.evaluate(() => window.__karte(2, 'k2-mbsim'));   // Testhaken, nur unter file://
  check(await page.$('#chat #mbmatrix') !== null, 'Karte: micro:bit-Simulator im Gespräch');
  const heart = '0101011111111110111000100';
  for (let i = 0; i < 25; i++) if (heart[i] === '1') await page.click('#mbmatrix .led[data-i="' + i + '"]');
  await page.waitForTimeout(200);
  check(await page.$eval('#mbstatus', e => e.classList.contains('ok')), 'micro:bit: Herz gezeichnet → Erfolg');
  await page.click('#mbtabs button:nth-child(3)');
  const shown = () => page.$$eval('#mbmatrix .led', l => l.map(e => e.classList.contains('on') ? '1' : '0').join(''));
  await page.fill('#mbtilt', '-700');
  await page.dispatchEvent('#mbtilt', 'input');
  check(await page.$eval('#mbxval', e => e.textContent) === '-700', 'micro:bit: Neigung -700 angezeigt');
  check(await shown() === '0010001110101010010000100', 'micro:bit: Logo nach oben → Pfeil Norden');
  await page.fill('#mbtilt', '100');
  await page.dispatchEvent('#mbtilt', 'input');
  check(await shown() === '0010001110101010010000100', 'micro:bit: unter der Grenze bleibt die Anzeige stehen');
  await page.fill('#mbtilt', '700');
  await page.dispatchEvent('#mbtilt', 'input');
  check(await shown() === '0010000100101010111000100', 'micro:bit: Logo nach unten → Pfeil Süden');
  await page.click('#mbshake');
  await page.waitForTimeout(900);
  check(await shown() === '0111010101111110111001110', 'micro:bit: Schütteln zeigt Totenkopf');
  check(await page.$eval('#mbstatus', e => e.classList.contains('ok')), 'micro:bit: alle drei Ereignisse → Erfolg');

  // Station 3: Parcours-Simulator
  await page.click('.stepbtn[data-go="3"]'); await page.waitForTimeout(400);
  await page.evaluate(() => window.__karte(3, 'k3-sim'));
  check(await page.$eval('#chat #cv', e => e.getBoundingClientRect().width) > 100, 'Karte: Parcours-Canvas sichtbar und gezeichnet');
  await page.click('.pb:has-text("fahre")');
  const plus = page.locator('.prow .chip .step', { hasText: '+' }).first();
  for (let i = 0; i < 4; i++) await plus.click();
  await page.click('#runbtn');
  await page.waitForTimeout(2600);
  check(await page.$eval('#status', e => e.classList.contains('ok')), 'Parcours: Level 1 mit "fahre 5" im Ziel');
  await page.click('#levsel button:nth-child(2)');
  check(await page.$eval('#levsel button:nth-child(2)', e => e.getAttribute('aria-pressed') === 'true'), 'Parcours: Levelwahl im Gespräch klickbar');
  await page.reload(); await page.waitForTimeout(400);
  check(await page.$('#chat #cv') !== null, 'Karte: Parcours nach Neuladen wieder im Gespräch');
  check(await page.$('#karten #cv') === null, 'Karte: Parcours liegt nicht doppelt im Vorrat');

  // Keine Punkteanzeige mehr
  check((await page.$('#ptsval')) === null, 'keine Punkteanzeige');
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
    await page.waitForTimeout(3200);
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf', 'Figur: nach dem Schritt Leerlauf');
    const n0 = await page.$$eval('#chat .blase', l => l.length);
    await page.reload(); await page.waitForTimeout(300);
    check(await page.$$eval('#chat .blase', l => l.length) === n0, 'Gespräch: Neuladen zeigt den Verlauf, nichts doppelt');
    check(await page.$('#antworten button[data-fertig]') !== null, 'Gespräch: Antwortknöpfe nach Neuladen da');
    check(await page.$('#antworten button[data-frage]') !== null, 'Gespräch: Knopf „Geht nicht“ da');
    // „Zeig mir“: Zusatz-Erklärung ohne Schrittwechsel
    const vorZeig = await page.$$eval('#chat .blase', l => l.length);
    await page.click('#antworten button[data-zeig]'); await page.waitForTimeout(2200);
    check(await page.$$eval('#chat .blase', l => l.length) === vorZeig + 3, 'Gespräch: „Zeig mir“ zeigt Antwort und Erklärung');
    check(await page.$eval('#chat .blase.me', e => e.textContent) === 'Nochmal einfacher', 'Gespräch: eigene Antwort als Blase rechts');
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
    // Station ohne Drehbuch: Station 6 hat noch keins (Task 9 schreibt es und streicht diese Prüfung)
    await page.click('.stepbtn[data-go="6"]'); await page.waitForTimeout(300);
    check(/schreibe ich gerade noch/.test(await page.$eval('#chat', e => e.textContent)), 'Gespräch: Station ohne Drehbuch sagt Bescheid');
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
    let r1 = 0;
    while (!(await page.$('#chat [data-karte="k1-herz"]')) && r1++ < 5) await weiter();
    check(await page.isVisible('#chat [data-karte="k1-herz"]'), 'Station 1: Karte k1-herz sichtbar');
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
    let r2 = 0, klemmtNeigen = false, grenzeFertig = '';
    while (!(await page.$('#antworten button[data-skip]')) && await page.$('#antworten button[data-fertig]') && r2++ < 12) {
      // Schritt erkennen am Fertig-Knopf (die Drehbücher liegen nicht global)
      const fk = await page.$eval('#antworten button[data-fertig]', e => e.textContent);
      if (fk === 'Pfeile und Totenkopf ✓' && !klemmtNeigen) {
        await page.click('#antworten button[data-zeig="Es klappt nicht"]'); await page.waitForTimeout(50);
        klemmtNeigen = await page.$('#chat [data-karte="k2-klemmt"]') !== null;
      }
      if (await page.$('#chat [data-karte="k2-tabelle"]') && !grenzeFertig) grenzeFertig = fk;
      await weiter();
    }
    check(klemmtNeigen, 'Station 2: „Es klappt nicht“ beim Neigen zeigt k2-klemmt');
    check(grenzeFertig === 'Verstanden ✓', 'Station 2: Grenze 200 als eigener Schritt mit Tabelle (' + grenzeFertig + ')');
    check(await page.$('#chat #mbmatrix') !== null, 'Station 2: micro:bit-Simulator im Gespräch');
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

  // Station 3 bis 5 als Gespräch. Reduzierte Bewegung; Schritte erkennt der Test am Fertig-Knopf.
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

    // Station 3: Einsetzen, Vorlage, Simulator, Motorblöcke, Quadrat als Extra
    await page.click('.stepbtn[data-go="3"]'); await page.waitForTimeout(100);
    check(await page.$('#chat [data-karte="k3-mqinsert"] #mqinsert') !== null, 'Station 3: Einsetz-Figur im Gespräch');
    let r3 = 0, klemmt3 = false;
    while (!(await page.$('#antworten button[data-skip]')) && await page.$('#antworten button[data-fertig]') && r3++ < 12) {
      if (await page.$('#antworten button[data-zeig="Es klappt nicht"]') && !klemmt3) {
        await page.click('#antworten button[data-zeig="Es klappt nicht"]'); await page.waitForTimeout(50);
        klemmt3 = await page.$('#chat [data-karte="k3-klemmt"]') !== null;
      }
      await weiter();
    }
    check(await page.$('#chat .blase.karte a[href^="https://makecode.microbit.org/#project:"]') !== null, 'Station 3: Knopf „Neues Roboter-Projekt starten“ im Gespräch');
    check(await page.$('#chat [data-karte="k3-sim"] #cv') !== null && await page.$eval('#cv', c => c.getBoundingClientRect().width > 100), 'Station 3: Parcours-Simulator im Gespräch');
    check(/Bonus für Schnelle/.test(await page.$eval('#chat', e => e.textContent)), 'Station 3: Level 3 als Bonus für Schnelle');
    const k3 = await klammern();
    check(k3.includes('beim Start:4'), 'Station 3: Geradeaus-Blöcke als Klammer (' + k3.join(', ') + ')');
    check(await page.$$eval('#chat .mcb.b-mq', l => l.length > 0 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(15, 188, 17)')), 'Station 3: Maqueen-Blöcke hellgrün');
    check(klemmt3, 'Station 3: „Es klappt nicht“ zeigt k3-klemmt');
    check(await page.$('#antworten button[data-skip]') !== null, 'Station 3: Quadrat als Extra mit „Überspringen“');
    const v3 = await abzeichen();
    await page.click('#antworten button[data-skip]'); await page.waitForTimeout(100);
    check(await abzeichen() === v3 + 1 && await page.$eval('.stepbtn[data-go="3"]', e => e.classList.contains('done')), 'Station 3: Abzeichen trotz übersprungenem Quadrat');
    check(await page.$('#antworten button[data-extra]') !== null && await page.$eval('#antworten button[data-extra]', e => e.textContent) === 'Extra: Quadrat', 'Station 3: Extra heißt „Extra: Quadrat“');
    await page.click('#antworten button[data-extra]'); await page.waitForTimeout(100);
    check(/500 und 800/.test(await page.$eval('#chat', e => e.textContent)), 'Station 3: Quadrat-Tipp 500 bis 800 ms');
    await page.click('#antworten button[data-zeig="Wir kommen nicht weiter"]'); await page.waitForTimeout(50);
    check((await klammern()).some(k => /4 -mal wiederholen:6/.test(k)), 'Station 3: Quadrat-Gerüst mit Schleife');
    await weiter();
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('mgp-v1')).bonus.quadrat === 1), 'Station 3: Quadrat erledigt');

    // Station 4: Projekt Linie, Zahlen, Blöcke, Fahren mit verbindlichen Chips, Quiz
    await page.click('.stepbtn[data-go="4"]'); await page.waitForTimeout(100);
    check(/Linie/.test(await page.$eval('#chat', e => e.textContent)) && await page.$('#chat .blase.karte a[href^="https://makecode.microbit.org/#project:"]') !== null, 'Station 4: neues Roboter-Projekt „Linie“');
    let r4 = 0, chips4 = null;
    while (await page.$('#antworten button[data-fertig]') && r4++ < 10) {
      if (await fertigText() === 'Er fährt!' && !chips4) {
        await page.click('#antworten button[data-frage]'); await page.waitForTimeout(50);
        chips4 = await page.$$eval('#frage .chip', l => l.map(e => e.textContent));
        await page.click('#frage button[data-zurueck]'); await page.waitForTimeout(50);
      }
      await weiter();
    }
    const txt4 = await page.$eval('#chat', e => e.textContent);
    check(/3800/.test(txt4) && /2700/.test(txt4), 'Station 4: Weiß ≈ 3800, Schwarz ≈ 2700');
    const k4 = await klammern();
    check(k4.includes('beim Start:2') && k4.includes('wenn Knopf A geklickt:1') && k4.includes('wenn Knopf B geklickt:1'), 'Station 4: Linienfolger-Blöcke als Klammer (' + k4.join(', ') + ')');
    check(JSON.stringify(chips4) === JSON.stringify(['Der micro:bit zeigt nur ein X', 'Er fährt von der Linie runter', 'Er fährt gar nicht los', 'Wo ist der Block Line patrolling?']), 'Station 4: Chips beim Fahren (' + JSON.stringify(chips4) + ')');
    check(await page.$('#chat [data-karte="k4-quiz"] .quiz[data-quiz="q3"]') !== null, 'Station 4: Quiz als Karte');
    check(await page.$eval('.stepbtn[data-go="4"]', e => e.classList.contains('done')), 'Station 4 durchgespielt → Abzeichen');

    // Station 5: Laser, wenn/ansonsten, Pausenknopf, Quiz, Staubsauger als Extra
    await page.click('#antworten button[data-go="5"]'); await page.waitForTimeout(100);
    let r5 = 0;
    while (!(await page.$('#antworten button[data-skip]')) && await page.$('#antworten button[data-fertig]') && r5++ < 10) await weiter();
    check(await page.$$eval('#chat [data-karte="k5-logik"] .mcc[data-c="b-logic"] > .mcbody', l => l.length) === 2, 'Station 5: wenn/ansonsten in k5-logik mit zwei Armen');
    check(await page.$$eval('#chat .mcc[data-c="b-logic"] > .mcbody', l => l.length) === 4, 'Station 5: beide wenn/ansonsten-Stapel ganz geklammert');
    check(await page.$$eval('#chat .mcb.b-var', l => l.length === 2 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(220, 20, 60)')), 'Station 5: zwei Variablenblöcke in Rot');
    check(await page.$$eval('#chat .mcb.b-lidar', l => l.length > 0 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(91, 63, 232)')), 'Station 5: Laserblöcke lila');
    check(await page.$('#chat [data-karte="k5-quiz"] .quiz[data-quiz="q4"]') !== null, 'Station 5: Quiz als Karte');
    check(await page.$('#antworten button[data-skip]') !== null, 'Station 5: Staubsauger als Extra mit „Überspringen“');
    await page.click('#antworten button[data-skip]'); await page.waitForTimeout(100);
    check(await page.$eval('.stepbtn[data-go="5"]', e => e.classList.contains('done')), 'Station 5: Abzeichen trotz übersprungenem Staubsauger');
    check(await page.$('#antworten button[data-extra]') !== null && await page.$eval('#antworten button[data-extra]', e => e.textContent) === 'Extra: Staubsauger', 'Station 5: Extra heißt „Extra: Staubsauger“');
    await ctxT.close();
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
    await page.click('#safetyok'); await page.waitForTimeout(3300);
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
    await ctxF.close();
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
    await page.click('#safetyok'); await page.waitForTimeout(3300);
    await page.click('#antworten button[data-frage]');
    await page.click('#frage .chips button');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'gruebeln', 'Frage: Figur grübelt, solange das LLM antwortet');
    await page.waitForTimeout(900);
    check((await letzteBlase(page)).includes('A drücken'), 'Frage: LLM-Antwort als Blase');
    check(await page.$eval('#chat', e => !e.innerHTML.includes('<b>x</b>')), 'Frage: Antwort des Modells wird nicht als HTML gedeutet');
    check(anfrage && anfrage.auth === 'Bearer test' && anfrage.body.model === 'anthropic/claude-haiku-4.5' && anfrage.body.max_tokens === 200, 'Frage: Anfrage trägt Schlüssel, Modell, max_tokens');
    check(anfrage.body.messages[0].role === 'system' && /höchstens drei Sätze/i.test(anfrage.body.messages[0].content) && anfrage.body.messages.reduce((n, m) => n + m.content.length, 0) < 6000, 'Frage: Systemprompt mit Regeln, unter ca. 2000 Token');
    check(anfrage.body.messages[anfrage.body.messages.length - 1].role === 'user' && anfrage.body.messages.length <= 6, 'Frage: höchstens 4 Verlaufseinträge plus Frage');
    check(await page.$eval('#figur', e => e.dataset.zustand) === 'leerlauf' && await page.$('#antworten button[data-nochfrage]') !== null, 'Frage: danach Leerlauf und „Noch eine Frage“');
    check(JSON.parse(await page.evaluate(() => localStorage.getItem('mgp-llm'))).anfragen === 1, 'Zähler: eine Anfrage');
    await page.click('#coachbtn');
    check(await page.$eval('#llmzaehler', e => /1 Anfrage/.test(e.textContent)), 'Handbuch: Zähler sichtbar');
    check(await page.$eval('#orkeystate', e => /gesetzt/.test(e.textContent)), 'Handbuch: Schlüssel gesetzt angezeigt');
    check(await page.$eval('#orkey', e => e.type === 'password' && e.value === ''), 'Handbuch: Schlüsselfeld ist ein Passwortfeld und leer');
    await page.keyboard.press('Escape');
    check(!html.includes('sk-or-'), 'kein Schlüssel in der Datei');
    // Serverfehler: Rückfallantwort, Zähler bleibt
    await page.unroute('https://openrouter.ai/**');
    await page.route('https://openrouter.ai/**', r => r.fulfill({ status: 500, body: 'kaputt' }));
    await page.click('#antworten button[data-nochfrage]');
    await page.fill('#frageeingabe', 'Es geht nicht');
    await page.press('#frageeingabe', 'Enter');
    await page.waitForTimeout(500);
    check((await letzteBlase(page)).includes('Wink den Betreuer'), 'Frage: Serverfehler 500 → Rückfallantwort');
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
