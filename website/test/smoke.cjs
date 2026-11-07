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
  for (const id of ['k0-mqmap', 'k0-quiz', 'k0-klemmt', 'k1-klemmt', 'k2-mbsim', 'k2-klemmt', 'k3-mqinsert', 'k3-sim', 'k3-klemmt', 'k4-klemmt', 'k5-klemmt', 'k6-gpmap', 'k6-final', 'k6-klemmt'])
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
    // Weiter zu Station 1: noch ohne Drehbuch, aber ohne Fehler
    await page.click('#antworten button[data-go="1"]'); await page.waitForTimeout(300);
    check(/schreibe ich gerade noch/.test(await page.$eval('#chat', e => e.textContent)), 'Gespräch: Station ohne Drehbuch sagt Bescheid');
    check(await page.$eval('#timer', e => e.classList.contains('running')), 'Gespräch: Weiter startet den Timer');
    // Neues Team leert das Gespräch, Franco wartet wieder auf das Sicherheitsfenster
    await page.click('#resetbtn'); await page.waitForTimeout(200);
    check((await page.$$('#chat .blase')).length === 0, '"Neues Team" leert das Gespräch');
    await page.click('#safetyok'); await page.waitForTimeout(100);
    check(await page.$$eval('#chat .blase', l => l.length) >= 1, '"Neues Team": Franco begrüßt nach dem Sicherheitsfenster');
    await ctxG.close();
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
