/*
 * Schemaprüfung der Drehbücher (src/drehbuch/*.js).
 *
 *   node test/drehbuch.cjs
 *
 * Lädt STATIONS aus app.js und alle Drehbücher in einem vm-Kontext und prüft:
 * genau sieben Drehbücher 0–6, Namen/Minuten/Abzeichen passen zu STATIONS, Summe 105, Schrittform,
 * keine Emoji, jeder Kartenverweis existiert in src/karten/*.html.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const ERWARTET = 7;
let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else { console.log('  FAIL ' + msg); failures++; }
}
const istText = (x) => typeof x === 'string';

// STATIONS aus app.js
const app = fs.readFileSync(path.join(SRC, 'app.js'), 'utf8');
const sm = app.match(/var STATIONS = (\[[\s\S]*?\]);/);
check(!!sm, 'STATIONS in app.js gefunden');
const STATIONS = sm ? vm.runInNewContext(sm[1]) : [];

// Drehbücher laden
const dir = path.join(SRC, 'drehbuch');
check(fs.existsSync(dir), 'src/drehbuch existiert');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort() : [];
const ctx = vm.createContext({ DREHBUCH: [] });
for (const f of files) {
  try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { check(false, f + ' lädt ohne Fehler (' + e.message + ')'); }
}
const DREHBUCH = ctx.DREHBUCH;

// Karten-Verweise einsammeln
const kdir = path.join(SRC, 'karten');
let kartenHtml = '';
if (fs.existsSync(kdir)) {
  for (const f of fs.readdirSync(kdir).filter(f => f.endsWith('.html')).sort())
    kartenHtml += fs.readFileSync(path.join(kdir, f), 'utf8') + '\n';
}
const karten = new Set([...kartenHtml.matchAll(/data-karte="([^"]+)"/g)].map(m => m[1]));

// Vollständigkeit: fehlende einzeln auflisten
for (let i = 0; i < ERWARTET; i++) check(!!DREHBUCH[i], 'Drehbuch ' + i + ' vorhanden');
check(DREHBUCH.length <= ERWARTET, 'nicht mehr als ' + ERWARTET + ' Drehbücher (gefunden ' + DREHBUCH.length + ')');

let summe = 0;
const emoji = /\p{Extended_Pictographic}/u;
for (let i = 0; i < DREHBUCH.length; i++) {
  const d = DREHBUCH[i];
  if (!d) continue;
  const st = STATIONS[i];
  check(!!st, 'Drehbuch ' + i + ': STATIONS[' + i + '] existiert');
  if (st) {
    check(d.name === st.n, 'Drehbuch ' + i + ': name "' + d.name + '" = STATIONS.n "' + st.n + '"');
    check(d.min + ' Min' === st.m, 'Drehbuch ' + i + ': min ' + d.min + ' passt zu STATIONS.m "' + st.m + '"');
    check(d.badge === st.badge, 'Drehbuch ' + i + ': badge "' + d.badge + '" = "' + st.badge + '"');
  }
  check(istText(d.titel) && d.titel, 'Drehbuch ' + i + ': titel gesetzt');
  summe += d.min || 0;
  check(Array.isArray(d.schritte) && d.schritte.length >= 1, 'Drehbuch ' + i + ': schritte mit mindestens 1 Schritt');
  const ids = new Set();
  for (const s of (d.schritte || [])) {
    const w = 'Drehbuch ' + i + ' Schritt ' + s.id;
    check(istText(s.id) && s.id, w + ': id ist ein String');
    check(!ids.has(s.id), w + ': id eindeutig');
    ids.add(s.id);
    check(Array.isArray(s.nachrichten) && s.nachrichten.length >= 1, w + ': nachrichten mit mindestens 1 Eintrag');
    // Nachrichten (auch die in zeig): String oder {karte}, jede Karte gibt es
    const nachricht = (n, wo) => {
      check(istText(n) || (n && istText(n.karte)), wo + ': Nachricht ist String oder {karte}');
      if (n && istText(n.karte) && !/^makecode:(neu|vorlage)$/.test(n.karte))
        check(karten.has(n.karte), wo + ': Karte "' + n.karte + '" existiert in src/karten');
    };
    for (const n of (s.nachrichten || [])) nachricht(n, w);
    check(istText(s.fertig), w + ': fertig ist ein String');
    // chips: 3–4 Strings, bei Bonus-Schritten optional
    if (!(s.bonus && s.chips === undefined))
      check(Array.isArray(s.chips) && s.chips.length >= 3 && s.chips.length <= 4 && s.chips.every(istText),
        w + ': chips sind 3–4 Strings');
    if (s.bonus !== undefined) check(typeof s.bonus === 'boolean', w + ': bonus ist true/false');
    if (s.titel !== undefined) check(istText(s.titel) && s.titel, w + ': titel ist ein Text');
    if (s.zeig !== undefined) {
      check(s.zeig && typeof s.zeig === 'object' && Object.values(s.zeig).every(v => Array.isArray(v) && v.length >= 1),
        w + ': zeig ist Objekt Knopftext -> Nachrichten');
      for (const [k, v] of Object.entries(s.zeig || {})) for (const n of (Array.isArray(v) ? v : [])) nachricht(n, w + ' zeig "' + k + '"');
    }
    check(!emoji.test(JSON.stringify(s)), w + ': keine Emoji');
  }
}
check(summe === 105, 'Minuten summieren auf 105 (' + summe + ')');

console.log(failures ? '\n' + failures + ' Fehler' : '\nalles grün');
process.exit(failures ? 1 : 0);
