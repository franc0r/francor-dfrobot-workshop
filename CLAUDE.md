# Maqueen Grand Prix — Robotik-Workshop

Interaktive Workshop-Seite für einen 90-Minuten-Robotik-Workshop auf einer Messe.
Zielgruppe: Schüler ab Klasse 7. Hardware: BBC micro:bit V2 + DFRobot Maqueen Plus V3.
Programmiert wird ausschließlich mit Blöcken in MakeCode.

Dieses Dokument hält die Entscheidungen fest, die vor dem Repo getroffen wurden.
Sie gelten, bis Martin sie ausdrücklich ändert.

## Harte Regeln

1. **Offline-only.** Auf der Messe gibt es kein Internet. `website/dist/maqueen-grand-prix-offline.html`
   darf keinen einzigen externen Verweis enthalten — keine Webfonts, keine CDN-Skripte, keine
   Bilder von außen. `build.py` bricht ab, wenn doch; `website/test/smoke.cjs` prüft es mit
   abgeschaltetem Netzwerk. Diese Regel ist nicht verhandelbar.
2. **Eine Datei.** Die Offline-Ausgabe ist eine einzelne HTML-Datei, die per Doppelklick
   aus dem Dateisystem läuft (`file://`). Keine Build-Abhängigkeit zur Laufzeit.
   Bilder gehören deshalb nach `website/src/assets/` und werden im Quelltext als
   `src="assets/datei.png"` (doppelte Anführungszeichen) geschrieben; `build.py` ersetzt das
   durch eine `data:`-URI und bricht ab, wenn danach noch ein `assets/` übrig ist.
   Nie ein Bild von einer URL einbinden.
3. **Nur Blöcke, kein Textcode.** Codebeispiele auf der Seite sind MakeCode-Blöcke,
   nachgebildet mit den `.mcb`-Klassen (Farben wie in MakeCode: Grundlagen blau, Eingabe
   magenta, Schleifen grün, Logik türkis, Maqueen dunkelblau).
4. **Deutsch, Klasse 7.** Kurze Sätze, Du-Anrede an die Schüler, keine Fachbegriffe ohne
   Bild dazu. Erklärungen an die Betreuenden gehören ins Handbuch (`website/src/handbuch.html`),
   nicht in die Stationen.
5. **90 Minuten exakt.** Eyebrow-Minuten der Stationen, das `STATIONS`-Array in `website/src/app.js`
   und der Zeitplan im Handbuch müssen übereinstimmen. `build.py` prüft die ersten beiden.
6. **Blockbezeichnungen sind vorläufig**, bis der Trockenlauf sie bestätigt hat (siehe
   `docs/02-offline-und-trockenlauf.md`). Besonders unsicher: die Blöcke des
   8×8-Laserscanners (Station 5). Beim Ändern von Blocktexten immer alle Stationen und das
   Handbuch gemeinsam anfassen.

## Aufbau

Das Repo hat zwei Hälften: die Seite, die gebaut wird, und die Programme, die auf
die Hardware kommen. Sie haben nichts miteinander zu tun außer dem Thema.

```
website/              die Workshop-Seite, eigenständig (npm + build.py wohnen hier)
  src/
    styles.css        Design-Tokens (hell/dunkel), Layout, Block-Optik, Simulatoren
    topbar.html       Kopfzeile: Teamname, Punkte, 90-Min-Timer, Betreuer, Neues Team
    rail.html         linke Stationsleiste (Knöpfe werden aus STATIONS in app.js erzeugt)
    stations/NN-*.html  eine Datei pro Station, data-st muss zur Nummer passen
    assets/           Bilder; build.py bettet sie als data:-URI ein
    handbuch.html     Betreuer-Handbuch (Drawer): Zeitplan, Material, Offline, Pi, Störungen
    app.js            Fortschritt/Punkte (localStorage), Quiz, Timer, beide Simulatoren
  build.py            baut dist/…-offline.html, …-pages.html und …-artifact.html
  test/smoke.cjs      Playwright-Smoketest gegen die Offline-Datei
  dist/               Bauergebnis; die Offline-Datei ist eingecheckt
microbit/             was auf den Roboter kommt — wird nicht gebaut
  vorlage/            MakeCode-Startprojekt mit geladener DFRobot-Erweiterung
  stations/NN-name/   Musterlösung je Station: loesung.hex, bloecke.png, README.md
  python/             MicroPython: Hardware-Check, Zugabe für Schnelle
tools/                Werkzeuge für Stand und Arbeitsplätze
  trockenlauf.html    Prüfprotokoll (läuft nur als claude.ai-Artefakt, siehe unten)
  pi/                 udev-Regel, Flash-Skript für den Raspberry Pi
docs/                 Konzept, Offline-Recherche, Review-Notizen
```

Die Ordner unter `microbit/stations/` tragen dieselbe Nummer und denselben Namen wie
die Dateien unter `website/src/stations/`: `04-augen/` gehört zu `04-augen.html`.
Ändert sich ein Blocktext, werden beide zusammen angefasst — zusammen mit dem Handbuch.

Arbeitsablauf: `cd website && python3 build.py && npm test`. Erst wenn beides grün ist,
die Offline-Datei auf die Arbeitsplätze kopieren.

`.github/workflows/pages.yml` macht dasselbe bei jedem Push auf `master` und
veröffentlicht das Ziel `pages` auf GitHub Pages
(<https://franc0r.github.io/francor-dfrobot-workshop/>). Der Smoketest ist die Schranke
davor. `pages` ist inhaltsgleich mit `offline`, nur ohne den Zusatz „Offline-Ausgabe“ in
Titel und Kopfzeile, und unterliegt derselben Regel 1 — auch die gehostete Fassung lädt
nichts von außen (eine Vereinsseite soll keine Google-Fonts nachladen). Die Online-Fassung
ist zum Vorbereiten und Herumzeigen; am Messetag zählt die Datei.

## Die Stationen (Stand 15.09.2026)

| Nr | Datei | Min | Kern | Abzeichen |
|---|---|---|---|---|
| 0 | 00-boxenstopp | 5 | Regelkreis wahrnehmen → entscheiden → handeln | Rookie |
| 1 | 01-erster-kontakt | 13 | MakeCode-Bedienung, beim Start (einmal) vs. dauerhaft (ohne Ende), erstes Flashen | Ersteinschalter |
| 2 | 02-microbit-allein | 15 | LED-Matrix, Knopf-Ereignisse, Würfel; Neigung nur beobachtet (Bedingung ist Extra) | Pixelkünstler |
| 3 | 03-fahrschule | 14 | Vorlage öffnen (Erweiterung ist schon geladen), Parcours-Simulator, Motorblöcke | Fahrlehrer |
| 4 | 04-augen | 18 | Kalibrieren, Linienverfolgung auf Knopf A — der Wow-Moment | Spurhalter |
| 5 | 05-reflexe | 10 | Laserscanner, wenn/dann/sonst — **Bonus, streichbar** | Bremsassistent |
| 6 | 06-grand-prix | 15 | Tuning (3 Ideen), ein Lauf auf Zeit — nie streichen | Champion |

Roter Faden: Station 1 führt „einmal" (beim Start) vs. „ohne Ende" (dauerhaft) hands-on ein;
Station 2 setzt „ein Sensor liefert Zahlen, die Grenze legt euer Programm fest";
Station 4 greift beides wieder auf — die Linienverfolgung läuft dauerhaft, die Grenze ist
weiß ≈ 3800 / schwarz ≈ 2700.

Entlastung vom 15.09.2026 (siehe Cowork-Projekt „Anfänger Robotik Workshop",
`claude/vorschlag-entlastung-stationen.md`): Zeitplan neu verteilt, Station 2 gekürzt
(Bedingung am Neigungssensor ist jetzt Extra statt Pflicht), Station 3 startet mit fertiger
Vorlage statt eigenem Erweiterung-Laden, Station 6 auf drei Tuning-Ideen reduziert. Im Gegenzug
baut Station 1 jetzt explizit eine dauerhaft-Schleife neben beim Start, damit jedes Team das
im Pflichtteil einmal selbst sieht (vorher nur im überspringbaren Bonus in Station 5 erklärt).

## Verein und Logo

Träger des Workshops ist **FRANCOR e. V.** Der Name steht in der Kopfzeile (Wortmarke neben
dem Logo) und im Kolophon am Ende des Betreuer-Handbuchs.

`website/src/assets/francor-logo.png` (105×120) stammt von
`https://www.francor.de/wp-content/uploads/2019/11/cropped-g3811.png`. Zwei Änderungen
gegenüber dem Original: die deckend weißen Trennfugen und Kanten des Originals sind
transparent gerechnet (sonst leuchten sie im Dunkelmodus weiß auf), und die Datei ist auf
120 px Höhe verkleinert. Farbe der Marke: `#E9483F`.

## Technische Fakten (recherchiert, Quellen in docs/)

- MakeCode-Erweiterung: Suchbegriff `dfrobot` → **DFRobot_MaqueenPlus_V2**. Der offizielle
  V3-Quick-Start-Guide bestätigt: gleiche Bibliothek für V2 und V3, Name bewusst bei V2 gelassen.
  Die Erweiterung ist reines TypeScript (kein C++) → kompiliert im Browser → **funktioniert offline**,
  sobald sie einmal im Projekt ist. Sie bringt deutsche Übersetzungen mit.
- MakeCode cacht sich beim ersten Laden vollständig; nur das *Nachladen* einer Erweiterung braucht Netz.
  Lösung: Vorlagenprojekt mit geladener Erweiterung als Datei verteilen.
- Flashen: WebUSB („Gerät koppeln", Chrome/Chromium/Edge, Firmware ≥ 0249) oder `.hex` von Hand
  auf das Laufwerk `MICROBIT` ziehen. Weg B geht immer und ist auf Linux/Raspberry Pi oft der
  Hauptweg (USB-Berechtigung; optionale udev-Regel VID 0d28 / PID 0204 steht im Handbuch).
- Maqueen: Tempo 0–255, unter ~30 keine Bewegung; zwei Schalter (Akkubrett + Bodenplatte);
  Kalibrierung Calc-Key ~2 s auf Schwarz; Linienverfolgung Stufe 1–5 läuft im Hintergrund;
  Laserscanner 8×8, 20–4000 mm, ~3 s Init.
- Arbeitsplätze: Laptop oder **Raspberry Pi 4 (4 GB+)**; Raspberry Pi OS ist von der micro:bit
  Foundation offiziell unterstützt. 2–4 Plätze pro Slot, je zwei Schüler.

## Was der Simulator-Code kann und was nicht

- **Parcours-Simulator** (`website/src/app.js`, Abschnitt SIMULATOR): Gitter, Roboter, Bausteine per Klick
  (kein Drag & Drop — auf Messe-Touchscreens robuster), `wiederhole`-Block mit einer Ebene
  Verschachtelung, drei Level in `LEVELS`. Koordinaten: x nach rechts, y nach unten, dir 0=rechts,
  1=unten, 2=links, 3=oben. Level 3 ist mit 5 Bausteinen lösbar (Schleife), sonst 16.
- **micro:bit-Simulator** (Abschnitt micro:bit SIMULATOR): 5×5-LEDs als Buttons, Muster als
  25-Zeichen-Strings in `PAT`, drei Modi (Zeichnen / Knöpfe / Neigen). Der Neigungsregler
  liefert -1023..1023 wie der echte Sensor; Grenze ±300 für die Pfeile.
- Fortschritt liegt in `localStorage` unter `mgp-v1`. „Neues Team" löscht ihn — das ist der
  Knopf zwischen zwei Messe-Slots.

## Offen (nach dem Trockenlauf einarbeiten)

- Exakte Blocktexte für Motor, Licht, Linienverfolgung, Laserscanner (Wortlaut aus Protokoll C/D/E)
- Gemessene Werte: cm bei Tempo 120 in 1 s, ms für 90°, sichere Linienstufe, kleinster Kurvenradius
- Steckrichtung des micro:bit auf dem Chassis („Lämpchen nach vorn" — bestätigen)
- Entscheidung: Station 2 auf 12 Min kürzen, damit der Roboter früher fährt? (Review-Punkt, offen)
- Station 0 entschlacken: Bauteil-Tabelle nach hinten?
- Danach: Parcours-Bauplan (braucht den gemessenen Radius), Stand-Paket zum Drucken
  (Urkunde, Handzettel mit QR-Code auf die Offline-Datei, Tischaufsteller)

## Was nicht in dieses Repo gehört

- `tools/trockenlauf.html` ist nur als Referenz hier. Die lebende Fassung ist ein
  claude.ai-Artefakt mit Datenablage, in das Martin die Messwerte einträgt; das Cowork-Projekt
  „Anfänger Robotik Workshop" liest sie aus. Änderungen am Protokoll dort machen, nicht hier.
- Die Artefakt-Fassung (`website/dist/…-artifact.html`) ist nur zum Teilen/Planen. Für die Messe zählt
  ausschließlich die Offline-Datei.
