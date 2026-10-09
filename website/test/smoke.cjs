/*
 * Smoketest für die Offline-Ausgabe.
 *
 *   npm test          (baut vorher nicht – erst `npm run build`)
 *
 * Prüft, was am Messetag weh tun würde:
 *   1. Die Datei lädt mit komplett abgeschaltetem Netzwerk, ohne JS-Fehler.
 *   2. Es gibt keine externen Verweise (Schriften, Skripte, Bilder).
 *   3. Sieben Stationen, Minuten summieren auf 90, Rail und Eyebrows passen.
 *   4. micro:bit-Simulator: Herz zeichnen → Erfolg, Logo oben/unten und Schütteln laufen.
 *   5. Parcours-Simulator: Level 1 mit "fahre 5" → im Ziel.
 *   6. Betreuer-Handbuch öffnet sich, "Neues Team" setzt zurück.
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
  const ext = html.match(/(?:src|href)="https?:\/\/[^"]*"|url\(\s*["']?https?:\/\//g) || [];
  check(ext.length === 0, 'keine externen Verweise' + (ext.length ? ': ' + ext.slice(0, 3).join(', ') : ''));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + DIST);
  await page.waitForTimeout(500);

  // Struktur
  const n = await page.$$eval('.station', s => s.length);
  check(n === 7, 'sieben Stationen (gefunden: ' + n + ')');
  const mins = await page.$$eval('.eyebrow span:nth-child(2)', s => s.map(x => parseInt(x.textContent, 10)));
  const sum = mins.reduce((a, b) => a + b, 0);
  check(sum === 90, 'Stationsminuten summieren auf 90 (' + mins.join('+') + ' = ' + sum + ')');
  const railMins = await page.$$eval('.stepbtn .min', s => s.map(x => parseInt(x.textContent, 10)));
  check(JSON.stringify(railMins) === JSON.stringify(mins), 'Rail-Minuten = Eyebrow-Minuten');

  // Station 0: Maqueen-Übersicht statt Bauteil-Tabelle
  const mapH = await page.$eval('#mqmap svg', e => e.getBoundingClientRect().height).catch(() => 0);
  check(mapH > 120, 'Station 0: Maqueen-Übersicht wird gezeichnet (Höhe ' + Math.round(mapH) + ')');
  const mapText = await page.$eval('#mqmap', e => e.textContent).catch(() => '');
  for (const w of ['Liniensensoren', 'Laserscanner', 'Lichtsensoren', 'micro:bit', 'Motoren', 'Summer', 'Schalter'])
    check(mapText.includes(w), 'Station 0: Übersicht beschriftet "' + w + '"');
  check((await page.$$('.station[data-st="0"] table')).length === 0, 'Station 0: Bauteil-Tabelle ist weg');

  // Symbole in Blöcken wie in MakeCode: 5×5-Bildchen statt Emoji
  const icoOn = await page.$$eval('.station .mcb .ledico[aria-label="Herz"]', l => l.map(e => e.querySelectorAll('span.on').length));
  check(icoOn.length >= 2 && icoOn.every(n => n === 16), 'Herz-Symbol in Blöcken als 5×5-Bild (' + icoOn.join(',') + ')');
  check(!(await page.$$eval('.mcb', l => l.some(e => e.textContent.includes('❤')))), 'kein ❤-Emoji in Blöcken');

  // Klammer-Blöcke: "dauerhaft" in Station 1 umschließt seine vier Blöcke
  const loopKids = await page.$$eval('.station[data-st="1"] .mcc', l => l.map(c => c.querySelector('.mch').textContent.trim() + ':' + c.querySelectorAll(':scope > .mcbody > .mcb').length));
  check(loopKids.includes('beim Start:1') && loopKids.includes('dauerhaft:4'), 'Station 1: Klammer-Blöcke (' + loopKids.join(', ') + ')');
  const ifElse = await page.$$eval('.station[data-st="5"] .mcc[data-c="b-logic"] > .mcbody', l => l.length).catch(() => 0);
  check(ifElse === 2, 'Station 5: wenn/sonst als ein Block mit zwei Fächern (' + ifElse + ')');

  // Station 3: Einsetz-Animation
  await page.click('.stepbtn[data-go="3"]');
  const insH = await page.$eval('#mqinsert svg', e => e.getBoundingClientRect().height).catch(() => 0);
  check(insH > 120, 'Station 3: Einsetz-Figur wird gezeichnet (Höhe ' + Math.round(insH) + ')');
  const anim = await page.$eval('#mqinsert .mb-slide', e => getComputedStyle(e).animationName).catch(() => 'none');
  check(anim !== 'none', 'Station 3: micro:bit gleitet per CSS-Animation (' + anim + ')');
  check(/Lämpchen nach vorn/.test(await page.$eval('#mqinsert', e => e.textContent).catch(() => '')), 'Station 3: Figur sagt "Lämpchen nach vorn"');

  // Station 2: micro:bit-Simulator
  await page.click('.stepbtn[data-go="2"]');
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
  await page.click('.stepbtn[data-go="3"]');
  await page.click('.pb:has-text("fahre")');
  const plus = page.locator('.prow .chip .step', { hasText: '+' }).first();
  for (let i = 0; i < 4; i++) await plus.click();
  await page.click('#runbtn');
  await page.waitForTimeout(2600);
  check(await page.$eval('#status', e => e.classList.contains('ok')), 'Parcours: Level 1 mit "fahre 5" im Ziel');

  // Keine Punkteanzeige mehr
  check((await page.$('#ptsval')) === null, 'keine Punkteanzeige');
  await page.click('.stepbtn[data-go="0"]');
  await page.click('.station[data-st="0"] [data-next="1"]');
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Station 0 abgeschlossen → Abzeichen');

  // Betreuer-Handbuch
  await page.click('#coachbtn');
  await page.waitForTimeout(350);
  check(await page.$eval('#coach', e => e.classList.contains('open')), 'Betreuer-Handbuch öffnet');
  await page.keyboard.press('Escape');

  // Reset
  await page.click('#resetbtn');
  await page.waitForTimeout(200);
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 0), '"Neues Team" setzt Abzeichen zurück');
  check(await page.$eval('.station[data-st="0"]', e => !e.hidden), '"Neues Team" springt zu Station 0');

  check(errors.length === 0, 'keine JavaScript-Fehler' + (errors.length ? ': ' + errors.join(' | ') : ''));

  await browser.close();
  console.log(failures ? '\n' + failures + ' Prüfung(en) fehlgeschlagen' : '\nalles grün');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
