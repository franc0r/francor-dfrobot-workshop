/*
 * Smoketest für die Offline-Ausgabe.
 *
 *   npm test          (baut vorher nicht – erst `npm run build`)
 *
 * Prüft, was am Messetag weh tun würde:
 *   1. Die Datei lädt mit komplett abgeschaltetem Netzwerk, ohne JS-Fehler.
 *   2. Es gibt keine externen Verweise (Schriften, Skripte, Bilder).
 *   3. Sieben Stationen, Minuten summieren auf 105 (+ 15 Puffer = 120), Rail und Eyebrows passen.
 *      Dazu die Stückliste als Seite oben in der Leiste – ohne Minuten, Timer und Abzeichen.
 *   4. Keine eigenen Simulatoren; Station 2 verweist auf den MakeCode-Simulator.
 *   5. Betreuer-Handbuch öffnet sich, "Neues Team" setzt zurück.
 *   6. Sicherheitsfenster: beim Start da, nur der Knopf schließt, kommt nach "Neues Team" wieder.
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

  // Struktur
  const n = await page.$$eval('.station:not(.page)', s => s.length);
  check(n === 6, 'sechs Stationen (gefunden: ' + n + ')');
  const mins = await page.$$eval('.station:not(.page) .eyebrow span:nth-child(2)', s => s.map(x => parseInt(x.textContent, 10)));
  const sum = mins.reduce((a, b) => a + b, 0);
  check(sum === 105, 'Stationsminuten summieren auf 105 (' + mins.join('+') + ' = ' + sum + ')');
  check(JSON.stringify(mins) === '[5,15,15,20,10,40]', 'Minuten 5/15/15/20/10/40 (' + mins.join('/') + ')');
  const railMins = await page.$$eval('.stepbtn:not(.page) .min', s => s.map(x => parseInt(x.textContent, 10)));
  check(JSON.stringify(railMins) === JSON.stringify(mins), 'Rail-Minuten = Eyebrow-Minuten');

  // Stückliste: Seite oben in der Leiste, keine Station
  check(await page.$eval('#rail .stepbtn:first-of-type', e => e.classList.contains('page') && e.textContent.includes('Stückliste')), 'Stückliste: erster Knopf in der Leiste');
  check(await page.$$eval('.stepbtn .min', s => s.filter(x => /\d/.test(x.textContent)).length) === 6, 'Stückliste: zählt nicht zu den Stationsminuten');
  await page.click('.stepbtn[data-go="teile"]');
  check(await page.$eval('.page[data-st="teile"]', e => !e.hidden) && await page.$eval('.station[data-st="0"]', e => e.hidden), 'Stückliste: öffnet und blendet die Stationen aus');
  check(await page.$eval('#tval', e => e.textContent) === '120:00', 'Stückliste: startet den Timer nicht');
  const teile = (await page.$eval('.page[data-st="teile"]', e => e.textContent)).replace(/\u00a0/g, ' ');
  for (const w of ['micro:bit V2', 'Maqueen Plus V3', 'DFRobot', '18650', '4 × AA', 'Datenkabel', 'Button Top'])
    check(teile.includes(w), 'Stückliste: nennt "' + w + '"');
  check(await page.$$eval('.page[data-st="teile"] a[href]', l => l.every(a => a.getAttribute('href').startsWith('https://makecode.microbit.org/#'))), 'Stückliste: kein Shop-Link, nur MakeCode');
  check(!/\p{Extended_Pictographic}/u.test(teile), 'Stückliste: kein Emoji');
  await page.reload(); await page.waitForTimeout(300);
  check(await page.$eval('.page[data-st="teile"]', e => !e.hidden), 'Stückliste: bleibt nach Neuladen offen');
  await page.click('.page[data-st="teile"] [data-go="0"]');
  check(await page.$eval('.station[data-st="0"]', e => !e.hidden), 'Stückliste: Knopf „Zum Workshop“ führt zu Station 0');
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 0), 'Stückliste: vergibt kein Abzeichen');

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

  // Station 3: Einsetz-Animation
  await page.click('.stepbtn[data-go="3"]');
  const insH = await page.$eval('#mqinsert svg', e => e.getBoundingClientRect().height).catch(() => 0);
  check(insH > 120, 'Station 3: Einsetz-Figur wird gezeichnet (Höhe ' + Math.round(insH) + ')');
  const anim = await page.$eval('#mqinsert .mb-slide', e => getComputedStyle(e).animationName).catch(() => 'none');
  check(anim !== 'none', 'Station 3: micro:bit gleitet per CSS-Animation (' + anim + ')');
  check(/Lämpchen nach vorn/.test(await page.$eval('#mqinsert', e => e.textContent).catch(() => '')), 'Station 3: Figur sagt "Lämpchen nach vorn"');

  // Station 3: zusammengelegt aus Fahrschule und Augen (09.11.2026)
  const st3 = await page.$eval('.station[data-st="3"]', e => e.textContent);
  check(/Line patrolling ON/.test(st3) && /RGB Car Lights/.test(st3) && !/steuere/.test(st3) && !/wiederholen/.test(st3), 'Station 3: Linie und Ampel, keine Motorblöcke');
  check((await page.$('#mqinsert')) !== null && (await page.$('.station[data-st="3"] table.fix')) !== null, 'Station 3: Einsetz-Figur und Sensortabelle');

  // Station 4: Reflexe = nur der Laser-Stopp im Projekt Linie (09.11.2026)
  const st4 = await page.$eval('.station[data-st="4"]', e => e.textContent);
  check(/Line patrolling OFF/.test(st4) && !/ansonsten/.test(st4) && !/steuere/.test(st4) && !/pausiert/.test(st4), 'Station 4: Laser-Stopp ohne Motorblöcke, ohne ansonsten, ohne Variable');
  check(await page.$$eval('.station[data-st="4"] .mcc[data-c="b-logic"]', l => l.length) === 1, 'Station 4: genau ein wenn-Block');
  check((await page.$$('.station[data-st="4"] .mcb.b-var')).length === 0, 'Station 4: keine Variablen-Blöcke');

  // Station 5: Grand Prix baut auf Station 3 und 4 auf (09.11.2026)
  const st5 = await page.$eval('.station[data-st="5"]', e => e.textContent);
  check(!/Schritt 0/.test(st5) && !/Rot-Blau/.test(st5), 'Station 5: kein Schritt 0, kein Blinken mehr');
  check(/Station 3 und 4/.test(st5) && !/Station 6/.test(st5), 'Station 5: verweist auf Station 4, nicht mehr auf 6');
  check(await page.$$eval('.station[data-st="5"] .mcb.b-var', l => l.length >= 1 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(220, 20, 60)')), 'Station 5: Variablen-Block im Profi-Teil in Rot');

  // Station 5: Streckenskizze und Grand-Prix-Blöcke
  await page.click('.stepbtn[data-go="5"]');
  check((await page.$eval('#gpmap', e => e.getBoundingClientRect().height).catch(() => 0)) > 120, 'Station 5: Streckenskizze wird gezeichnet');
  check(JSON.stringify(await page.$$eval('#gpmap .gp-k', l => l.map(e => e.textContent.trim()))) === '["1","2","3","4"]', 'Station 5: Skizze nummeriert 1–4');
  const gpText = await page.$eval('#gpmap', e => e.textContent).catch(() => '');
  check(gpText.includes('Ziel') && gpText.includes('Pro-Ziel') && gpText.includes('Start'), 'Station 5: Start, Ziel und Pro-Ziel beschriftet');
  check(await page.$$eval('.station[data-st="5"] .mcb.b-gp', l => l.length >= 2 && l.every(e => getComputedStyle(e).backgroundColor === 'rgb(60, 60, 60)')), 'Station 5: Grand-Prix-Blöcke in Graphit');
  check(!/\p{Extended_Pictographic}/u.test(await page.$eval('.station[data-st="5"]', e => e.textContent)), 'Station 5: kein Emoji');

  // Station 5 im Dunkelmodus auf Handybreite
  const ctx2 = await browser.newContext({ offline: true, colorScheme: 'dark', viewport: { width: 360, height: 800 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => errors.push(String(e)));
  await p2.goto('file://' + DIST);
  await p2.waitForTimeout(300);
  check(await p2.evaluate(() => { const b = document.querySelector('#safety .sbox').getBoundingClientRect(); return b.left >= 0 && b.right <= window.innerWidth; }), 'Sicherheit: Fenster passt auf 360 px (dunkel)');
  await p2.click('#safetyok');
  await p2.click('.stepbtn[data-go="5"]');
  check(await p2.$eval('#gpmap .gp-mat', e => getComputedStyle(e).fill).catch(() => '') === 'rgb(255, 255, 255)', 'Station 5: Matte bleibt im Dunkelmodus weiß');
  check(await p2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Station 5: kein waagerechter Scroll bei 360 px');
  await ctx2.close();

  // Station 2 und 3: keine eigenen Simulatoren mehr (Martin, 09.11.2026)
  check((await page.$('#mbsim')) === null && (await page.$('#sim')) === null, 'keine Simulator-Kästen auf der Seite');
  check(!/Reiter/.test(await page.$eval('.station[data-st="2"]', e => e.textContent)), 'Station 2: kein Verweis auf Simulator-Reiter');
  check(/MakeCode/.test(await page.$eval('.station[data-st="2"] .block', e => e.textContent)), 'Station 2: verweist auf den MakeCode-Simulator');

  // Keine Punkteanzeige mehr
  check((await page.$('#ptsval')) === null, 'keine Punkteanzeige');
  await page.click('.stepbtn[data-go="0"]');
  await page.click('.station[data-st="0"] [data-next="1"]');
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 1), 'Station 0 abgeschlossen → Abzeichen');

  // Betreuer-Handbuch
  await page.click('#coachbtn');
  await page.waitForTimeout(350);
  check(await page.$eval('#coach', e => e.classList.contains('open')), 'Betreuer-Handbuch öffnet');
  const hb = await page.$eval('#coach', e => e.textContent);
  const hbn = hb.replace(/ /g, ' ');
  check(['Zählfahrt', 'Minute 15', 'geblitzt', '10 cm', '30 cm'].every(w => hbn.includes(w)), 'Handbuch: Abschnitt Grand Prix vollständig');
  await page.keyboard.press('Escape');

  // alter Fortschritt aus der Siebener-Fassung
  await page.evaluate(() => localStorage.setItem('mgp-v1', JSON.stringify({done:[0,1,2,3,4,5,6], quiz:{}, bonus:{}, cur:6, safe:true})));
  await page.reload(); await page.waitForTimeout(300);
  check(await page.$$eval('.station:not(.page)', s => s.some(e => !e.hidden)), 'alter Fortschritt (cur 6): eine Station ist sichtbar');
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length) <= 6, 'alter Fortschritt: höchstens sechs Abzeichen');

  // Reset
  await page.click('#resetbtn');
  await page.waitForTimeout(200);
  check(await page.$eval('#badges', e => e.querySelectorAll('.badge.on').length === 0), '"Neues Team" setzt Abzeichen zurück');
  check(await page.$eval('.station[data-st="0"]', e => !e.hidden), '"Neues Team" springt zu Station 0');
  check(await page.$eval('#tval', e => e.textContent) === '120:00', '"Neues Team" stellt 120:00');
  check(await page.$eval('#safety', e => !e.hidden), '"Neues Team" zeigt das Sicherheitsfenster wieder');

  check(errors.length === 0, 'keine JavaScript-Fehler' + (errors.length ? ': ' + errors.join(' | ') : ''));

  await browser.close();
  console.log(failures ? '\n' + failures + ' Prüfung(en) fehlgeschlagen' : '\nalles grün');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
