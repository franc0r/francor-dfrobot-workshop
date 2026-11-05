/*
 * Test für das Druckblatt der Grand-Prix-Strecke.
 *
 *   node tools/grand-prix-druck-test.cjs      (läuft auch in `npm run check`)
 *
 * Prüft:
 *   1. Zwei Seiten (.sheet): Teamskizze und Klebeplan.
 *   2. Maßstab 1:10: Die Matte ist auf beiden Seiten genau 100 × 200 mm groß.
 *   3. Als A4-PDF gedruckt sind es genau 2 Seiten.
 *   4. Keine Verweise nach außen (http), läuft mit abgeschaltetem Netz.
 *   5. Gleiche Geometrie: Band, Tempo-Zone, Lücke, Kisten, Schild und Nummernkreise sind auf
 *      beiden Druckseiten genau so gezeichnet wie in Station 6 (#gpmap in der Offline-Datei).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('../website/node_modules/playwright');

const FILE = path.join(__dirname, 'grand-prix-druck.html');
const OFFLINE = path.join(__dirname, '..', 'website', 'dist', 'maqueen-grand-prix-offline.html');
let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else { console.log('  FAIL ' + msg); failures++; }
}

(async () => {
  check(fs.existsSync(FILE), 'tools/grand-prix-druck.html existiert');
  if (!fs.existsSync(FILE)) process.exit(1);

  const html = fs.readFileSync(FILE, 'utf8');
  const ext = html.match(/https?:\/\/[^\s"'<>)]*/g) || [];
  check(ext.length === 0, 'keine http-Verweise' + (ext.length ? ': ' + ext.slice(0, 3).join(', ') : ''));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 1200 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('Anfrage fehlgeschlagen: ' + r.url()));

  await page.goto('file://' + FILE);

  const sheets = await page.$$eval('.sheet', s => s.length);
  check(sheets === 2, 'zwei Seiten .sheet (gefunden: ' + sheets + ')');

  const MM = 96 / 25.4;
  const mats = await page.$$eval('rect.gp-mat', l => l.map(e => {
    const r = e.getBoundingClientRect();
    return [r.width, r.height];
  }));
  check(mats.length === 2, 'jede Seite hat eine Matte rect.gp-mat (gefunden: ' + mats.length + ')');
  mats.forEach(([w, h], i) => {
    check(Math.abs(w - 100 * MM) <= 1, 'Seite ' + (i + 1) + ': Matte 100 mm breit (' + (w / MM).toFixed(2) + ' mm)');
    check(Math.abs(h - 200 * MM) <= 1, 'Seite ' + (i + 1) + ': Matte 200 mm hoch (' + (h / MM).toFixed(2) + ' mm)');
  });

  const nums = await page.$$eval('.sheet', l => l.map(s => [...s.querySelectorAll('text.gp-k')].map(t => t.textContent.trim()).join('')));
  check(nums.every(n => n === '1234'), 'beide Skizzen tragen genau die Nummern 1–4 (' + nums.join(', ') + ')');
  const team = await page.$eval('.sheet', s => s.textContent);
  check(!/T-junction|Crossroads|Turn and Straight|Kreuzung \(\+\)/.test(team), 'Teamskizze verrät die Kreuzungstypen nicht');

  // Kein Abschneiden: Auch mit breiterer Ersatzschrift (DejaVu Sans auf Raspberry Pi OS/Ubuntu,
  // hier Verdana als Breiten-Ersatz) passt jede Seite in ihren Kasten.
  await page.emulateMedia({ media: 'print' });
  for (const font of [null, 'Verdana, "DejaVu Sans", sans-serif']) {
    const tag = font ? await page.addStyleTag({ content: 'body { font-family: ' + font + ' !important; }' }) : null;
    const fit = await page.$$eval('.sheet', l => l.map(e => [e.scrollHeight, e.clientHeight]));
    fit.forEach(([sh, ch], i) => check(sh <= ch, 'Seite ' + (i + 1) + ' passt aufs Blatt' + (font ? ' (Verdana)' : '') + ' (' + sh + ' / ' + ch + ' px)'));
    if (tag) await tag.evaluate(e => e.remove());
  }
  await page.emulateMedia({ media: null });

  // Geometrie der Strecke: Station 6 und beide Druckseiten müssen gleich sein.
  // Leerraum in d-Attributen wird vereinheitlicht, sonst zählt jedes Zeichen.
  const geo = root => {
    const norm = v => (v || '').trim().replace(/\s+/g, ' ');
    const pick = (sel, attrs) => [...root.querySelectorAll(sel)].map(e => attrs.map(a => norm(e.getAttribute(a))).join(','));
    return {
      'Band (path.gp-ln)': pick('path.gp-ln', ['d']),
      'Tempo-Zone (path.gp-zone)': pick('path.gp-zone', ['d']),
      'Lücke (path.gp-gap)': pick('path.gp-gap', ['d']),
      'Schild-Linie (path.gp-lead)': pick('path.gp-lead', ['d']),
      'Nummernkreise (circle.gp-kc)': pick('circle.gp-kc', ['cx', 'cy']),
      'Kisten (rect.gp-box)': pick('rect.gp-box', ['x', 'y', 'width', 'height']),
      'Schild (rect.gp-sign)': pick('rect.gp-sign', ['x', 'y', 'width', 'height']),
    };
  };
  const sheetsGeo = await page.$$eval('.sheet .matbox svg', (l, src) => {
    const g = new Function('return ' + src)();
    return l.map(g);
  }, geo.toString());
  check(sheetsGeo.length === 2, 'zwei Skizzen in .matbox (gefunden: ' + sheetsGeo.length + ')');
  check(fs.existsSync(OFFLINE), 'Offline-Datei vorhanden (erst python3 build.py)');
  if (fs.existsSync(OFFLINE)) {
    const st = await ctx.newPage();
    await st.goto('file://' + OFFLINE);
    const siteGeo = await st.$eval('#gpmap', (e, src) => new Function('return ' + src)()(e), geo.toString());
    await st.close();
    for (const key of Object.keys(siteGeo)) {
      check(siteGeo[key].length > 0, 'Station 6 hat ' + key);
      sheetsGeo.forEach((g, i) => {
        const same = JSON.stringify(g[key]) === JSON.stringify(siteGeo[key]);
        check(same, 'Seite ' + (i + 1) + ' = Station 6: ' + key + (same ? '' : ' (Seite: ' + JSON.stringify(g[key]) + ' / Station: ' + JSON.stringify(siteGeo[key]) + ')'));
      });
    }
  }

  const buf = await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true });
  const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  check(pages === 2, 'A4-PDF hat genau 2 Seiten (' + pages + ')');
  if (process.env.GP_PDF) fs.writeFileSync(process.env.GP_PDF, buf);

  check(errors.length === 0, 'keine Fehler beim Laden' + (errors.length ? ': ' + errors.join(' | ') : ''));

  await browser.close();
  console.log(failures ? '\n' + failures + ' Prüfung(en) fehlgeschlagen' : '\nalles grün');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
