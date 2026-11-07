/*
 * Schemaprüfung der Drehbücher (src/drehbuch/*.js).
 *
 *   node test/drehbuch.cjs
 *   DREHBUCH_ERWARTET=3 node test/drehbuch.cjs   (so viele Drehbücher 0..N-1 erwartet, Standard 7)
 *
 * Lädt STATIONS aus app.js und alle Drehbücher in einem vm-Kontext und prüft:
 * Namen/Minuten/Abzeichen passen zu STATIONS, Summe 105, Schrittform,
 * keine Emoji, jeder Kartenverweis existiert in src/karten/*.html.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const ERWARTET = parseInt(process.env.DREHBUCH_ERWARTET || '7', 10);
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
  // Leere schritte sind in Task 1 erlaubt; ab Task 3 hier mindestens 1 verlangen.
  check(Array.isArray(d.schritte), 'Drehbuch ' + i + ': schritte ist ein Array');
  const ids = new Set();
  for (const s of (d.schritte || [])) {
    const w = 'Drehbuch ' + i + ' Schritt ' + s.id;
    check(istText(s.id) && s.id, w + ': id ist ein String');
    check(!ids.has(s.id), w + ': id eindeutig');
    ids.add(s.id);
    check(Array.isArray(s.nachrichten) && s.nachrichten.length >= 1, w + ': nachrichten mit mindestens 1 Eintrag');
    for (const n of (s.nachrichten || [])) {
      check(istText(n) || (n && istText(n.karte)), w + ': Nachricht ist String oder {karte}');
      if (n && istText(n.karte) && !/^makecode:(neu|vorlage)$/.test(n.karte))
        check(karten.has(n.karte), w + ': Karte "' + n.karte + '" existiert in src/karten');
    }
    check(istText(s.fertig), w + ': fertig ist ein String');
    // chips: 3–4 Strings, bei Bonus-Schritten optional
    if (!(s.bonus && s.chips === undefined))
      check(Array.isArray(s.chips) && s.chips.length >= 3 && s.chips.length <= 4 && s.chips.every(istText),
        w + ': chips sind 3–4 Strings');
    if (s.zeig !== undefined)
      check(s.zeig && typeof s.zeig === 'object' && Object.values(s.zeig).every(v => Array.isArray(v) && v.every(istText)),
        w + ': zeig ist Objekt String -> Array');
    check(!emoji.test(JSON.stringify(s)), w + ': keine Emoji');
  }
}
// Summe nur prüfen, wenn alle sieben da sind
if (ERWARTET >= STATIONS.length && DREHBUCH.length === ERWARTET) check(summe === 105, 'Minuten summieren auf 105 (' + summe + ')');

console.log(failures ? '\n' + failures + ' Fehler' : '\nalles grün');
process.exit(failures ? 1 : 0);
