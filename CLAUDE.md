# Maqueen Grand Prix — Robotik-Workshop

Interaktive Workshop-Seite für einen 120-Minuten-Robotik-Workshop auf einer Messe.
Zielgruppe: Schüler ab Klasse 7. Hardware: BBC micro:bit V2 + DFRobot Maqueen Plus V3.
Programmiert wird ausschließlich mit Blöcken in MakeCode.

Dieses Dokument hält die Entscheidungen fest, die vor dem Repo getroffen wurden.
Sie gelten, bis Martin sie ausdrücklich ändert.

## Harte Regeln

1. **Offline-only.** Auf der Messe gibt es kein Internet. `website/dist/maqueen-grand-prix-offline.html`
   darf keinen einzigen externen Verweis enthalten — keine Webfonts, keine CDN-Skripte, keine
   Bilder von außen. `build.py` bricht ab, wenn doch; `website/test/smoke.cjs` prüft es mit
   abgeschaltetem Netzwerk. Die Seite selbst muss immer ohne Netz vollständig funktionieren.
   Ausnahme (von Martin freigegeben, 28.10.2026): Links `href="https://makecode.microbit.org/#…"`.
   Sie laden nichts in die Seite, sondern öffnen MakeCode im zweiten Tab, das aus dem Cache läuft.
   Im Quelltext stehen sie als `href="makecode:neu"` (→ `#newproject`, Knopf „Neues Projekt
   starten“, Station 1 und 2) und `href="makecode:vorlage"` (→ `#project:` + Base64 von
   `microbit/vorlage/vorlage.mkcd`, Knopf „Neues Roboter-Projekt starten“, Station 3–5, als
   Rückfall auch 6);
   `build.py` setzt sie ein. `#project:` trägt das ganze Projekt im Link und geht offline.
   Seit 29.10.2026 (Martin: auf der Messe gibt es doch Internet, wenn auch langsam) darf ein
   solcher Link auch ein MakeCode-Tutorial von GitHub öffnen:
   `#tutorial:github:franc0r/makecode-maqueen-tutorials/<datei>`. Die Tutorials liegen in
   diesem eigenen Repo (MakeCode braucht dessen `pxt.json` im Hauptordner); Testseite und
   Notizen in `microbit/tutorial/`. Es braucht beim ersten Öffnen Netz, danach nimmt MakeCode
   es vermutlich aus dem Browser-Cache — deshalb beim Aufbau auf jedem Arbeitsplatz einmal öffnen.
   Die Station muss auch ohne das Tutorial gehen: Die Anleitung bleibt auf der Seite.
   `#pub:`-Teilen-Links nicht verwenden. Eingebettetes MakeCode (iframe) bleibt verboten,
   es startet offline nicht (getestet 29.10.2026).
2. **Eine Datei.** Die Offline-Ausgabe ist eine einzelne HTML-Datei, die per Doppelklick
   aus dem Dateisystem läuft (`file://`). Keine Build-Abhängigkeit zur Laufzeit.
   Bilder gehören deshalb nach `website/src/assets/` und werden im Quelltext als
   `src="assets/datei.png"` (doppelte Anführungszeichen) geschrieben; `build.py` ersetzt das
   durch eine `data:`-URI und bricht ab, wenn danach noch ein `assets/` übrig ist.
   Nie ein Bild von einer URL einbinden.
3. **Nur Blöcke, kein Textcode.** Codebeispiele auf der Seite sind MakeCode-Blöcke,
   nachgebildet mit den `.mcb`-Klassen. Jeder Block trägt die Farbe seiner Kategorie, genau wie
   in MakeCode (am Gerät abgelesen 02.11.2026): Grundlagen `#1E90FF`, Eingabe `#D400D4`,
   Musik `#E63022`, Schleifen `#00AA00`, Logik `#00A4A6`, Mathematik `#9400D3`,
   Maqueen `#0FBC11` (hellgrün), Matrix LiDAR `#5B3FE8`, Grand Prix `#3C3C3C` (Graphit;
   unsere eigene Bibliothek aus `microbit/bibliothek/`, in den Stationen `.b-gp`; Martin,
   05.11.2026). Die Rollenfarben in Station 0 (`.r-*`) folgen denselben Werten.
4. **Deutsch, Klasse 7.** Kurze Sätze, Du-Anrede an die Schüler, keine Fachbegriffe ohne
   Bild dazu. Erklärungen an die Betreuenden gehören ins Handbuch (`website/src/handbuch.html`),
   nicht in die Stationen.
5. **120 Minuten = 105 Stationsminuten + 15 Puffer** (Martin, 03./04.11.2026). Eyebrow-Minuten
   der Stationen, das `STATIONS`-Array in `website/src/app.js` und der Zeitplan im Handbuch
   müssen übereinstimmen. Der Puffer hat keine eigene Station; er steht als letzte Zeile im
   Zeitplan (1:45–2:00). `build.py` prüft die ersten beiden und dass die Stationen zusammen
   genau 105 Minuten ergeben (`STATIONSMINUTEN`, `PUFFER`).
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
    topbar.html       Kopfzeile: 120-Min-Timer, Betreuer, Neues Team
    rail.html         linke Stationsleiste (Knöpfe werden aus STATIONS in app.js erzeugt)
    stations/NN-*.html  eine Datei pro Station, data-st muss zur Nummer passen
    assets/           Bilder; build.py bettet sie als data:-URI ein
    handbuch.html     Betreuer-Handbuch (Drawer): Zeitplan, Material, Offline, Pi, Störungen
    app.js            Fortschritt/Abzeichen (localStorage), Quiz, Timer, beide Simulatoren
  build.py            baut dist/…-offline.html, …-pages.html und …-artifact.html
  test/smoke.cjs      Playwright-Smoketest gegen die Offline-Datei
  dist/               Bauergebnis; die Offline-Datei ist eingecheckt
microbit/             was auf den Roboter kommt — wird nicht gebaut
  vorlage/            MakeCode-Startprojekt (vorlage.mkcd, erzeugt von vorlage.py); build.py baut es in den Link in Station 3
  bibliothek/         custom.ts: Bibliothek „Grand Prix“ (Kreuzungen zählen); kommt über vorlage.py in die Vorlage
  stations/NN-name/   Musterlösung je Station: loesung.hex, bloecke.png, README.md
  python/             MicroPython: Hardware-Check, Zugabe für Schnelle
tools/                Werkzeuge für Stand und Arbeitsplätze
  trockenlauf.html    Prüfprotokoll (läuft nur als claude.ai-Artefakt, siehe unten)
  grand-prix-druck.html  A4-Blatt 1:10: Teamskizze (Seite 1), Klebeplan (Seite 2); wird nicht gebaut,
                      grand-prix-druck-test.cjs prüft Maßstab und Nummern (`npm run check`)
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

## Die Stationen (Stand 05.11.2026)

| Nr | Datei | Min | Kern | Abzeichen |
|---|---|---|---|---|
| 0 | 00-boxenstopp | 5 | Regelkreis wahrnehmen → entscheiden → handeln | Rookie |
| 1 | 01-erster-kontakt | 13 | MakeCode-Bedienung, beim Start (einmal) vs. dauerhaft (ohne Ende), erstes Flashen | Ersteinschalter |
| 2 | 02-microbit-allein | 15 | LED-Matrix, Knopf-Ereignisse, Logo oben/unten + Schütteln; Würfel ist Team-Challenge | Pixelkünstler |
| 3 | 03-fahrschule | 14 | Vorlage öffnen (Erweiterung ist schon geladen), Parcours-Simulator, Motorblöcke | Fahrlehrer |
| 4 | 04-augen | 18 | Linienverfolgung auf Knopf A — der Wow-Moment; Kalibrieren macht der Betreuer beim Aufbau, Schüler nur bei Bedarf | Spurhalter |
| 5 | 05-reflexe | 10 | Laserscanner, wenn/dann/ansonsten — Pflicht, der Grand Prix braucht den Laser-Stopp | Bremsassistent |
| 6 | 06-grand-prix | 30 | Strecke lesen, Kreuzungen einstellen, Tempo-Zone, Laser-Stopp, Lauf auf Zeit — nie streichen | Champion |
| – | Puffer | 15 | keine Station; die Betreuenden setzen ihn ein, wo es hakt | – |

Roter Faden: Station 1 führt „einmal" (beim Start) vs. „ohne Ende" (dauerhaft) hands-on ein;
Station 2 setzt „ein Sensor liefert Zahlen, die Grenze legt euer Programm fest" — auf dem
Gerät mit fertigen Ereignissen (Logo nach oben/unten), im Simulator sieht man die Zahl y und
die Grenze 200, die die micro:bit-Erfinder gesetzt haben;
Station 4 greift beides wieder auf — die Linienverfolgung läuft dauerhaft, die Grenze ist
weiß ≈ 3800 / schwarz ≈ 2700.

Entlastung vom 15.09.2026 (siehe Cowork-Projekt „Anfänger Robotik Workshop",
`claude/vorschlag-entlastung-stationen.md`): Zeitplan neu verteilt, Station 2 gekürzt
(Bedingung am Neigungssensor ist jetzt Extra statt Pflicht), Station 3 startet mit fertiger
Vorlage statt eigenem Erweiterung-Laden, Station 6 auf drei Tuning-Ideen reduziert. Im Gegenzug
baut Station 1 jetzt explizit eine dauerhaft-Schleife neben beim Start, damit jedes Team das
im Pflichtteil einmal selbst sieht (vorher nur im überspringbaren Bonus in Station 5 erklärt).

Grand Prix vom 03.–05.11.2026 (Martin; Entwurf in
`docs/superpowers/specs/2026-11-04-grand-prix-parcours-design.md`): Station 6 dauert 30 statt
15 Minuten, der Workshop 120 statt 90 (Martin, 03./04.11.2026). Station 5 ist Pflicht statt
Bonus (Martin, 04.11.2026); nur die Staubsauger-Challenge darin bleibt Bonus. Die Teams lesen
eine Skizze der Strecke, stellen die Kreuzungsregeln ein, schalten an Kreuzung 1 um, fahren ab
dem Tempo-Schild langsam und hören am Ziel ihre Siegesmelodie. Kein Wettbewerb: Gummibärchen
für alle, die Zeit nur zum Vergleichen. Die Zählnummern 1–4 gelten bis zum Trockenlauf; jede
Stelle, die sie nennt, steht in `microbit/stations/06-grand-prix/README.md`.

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
  Hauptweg (USB-Berechtigung). Für Weg A braucht jedes frische Linux die udev-Regel
  (VID 0d28 / PID 0204, `GROUP="plugdev"`, `tools/pi/50-microbit.rules`) **und** den Benutzer in
  `plugdev` — von Martin auf Ubuntu 26.04 nachgestellt (28.10.2026); beides steht im Handbuch.
- Maqueen: Tempo 0–255, unter ~30 keine Bewegung; zwei Schalter (Akkubrett + Bodenplatte);
  Kalibrierung Calc-Key ~2 s auf Schwarz; Linienverfolgung (`Line patrolling ON/OFF`, Tempo über `Line Following Settings Speed 1–5`) läuft im Hintergrund;
  was sie an Kreuzungen tut, stellen die Kreuzungsblöcke `At Crossroads / T-junction /
  Left Turn and Straight / Right Turn and Straight Intersection` ein (Gruppe V3, Auswahl
  `Straight`/`Left`/`Right`/`Stop`); `Line patrolling OFF` löscht die Kreuzungsregeln (Martin am
  Gerät, 03.11.2026), nach `ON` gelten wieder die Standardregeln — im Grand Prix gewollt, die
  Bibliothek „Grand Prix“ nimmt das den Teams absichtlich nicht ab;
  Laserscanner 8×8, 20–4000 mm, eigene Erweiterung (siehe Offen).
- Arbeitsplätze: Laptop oder **Raspberry Pi 4 (4 GB+)**; Raspberry Pi OS ist von der micro:bit
  Foundation offiziell unterstützt. 2–4 Plätze pro Slot, je zwei Schüler.

## Was der Simulator-Code kann und was nicht

- **Parcours-Simulator** (`website/src/app.js`, Abschnitt SIMULATOR): Gitter, Roboter, Bausteine per Klick
  (kein Drag & Drop — auf Messe-Touchscreens robuster), `-mal wiederholen`-Block mit einer Ebene
  Verschachtelung, drei Level in `LEVELS`. Koordinaten: x nach rechts, y nach unten, dir 0=rechts,
  1=unten, 2=links, 3=oben. Level 3 ist mit 5 Bausteinen lösbar (Schleife), sonst 16.
- **micro:bit-Simulator** (Abschnitt micro:bit SIMULATOR): 5×5-LEDs als Buttons, Muster als
  25-Zeichen-Strings in `PAT`, drei Modi (Zeichnen / Knöpfe / Neigen). Der Neigungsregler
  liefert y in -1023..1023 wie der echte Sensor; unter -200 meldet er „Logo nach oben“
  (Pfeil Norden), über 200 „Logo nach unten“ (Pfeil Süden), dazwischen bleibt die Anzeige.
  200 ist die Tilt-Toleranz der micro:bit-Firmware (CODAL) — bis zum Trockenlauf
  (Block F) nicht am Gerät bestätigt, ebenso das Vorzeichen. Schütteln spielt ein
  Mittleres C (0,5 s) und zeigt den Totenkopf. Die Platine ist dem MakeCode-Simulator
  nachgezeichnet: Grafik als Inline-SVG (viewBox 400×320), LEDs und Knöpfe A/B als
  HTML-Buttons darüber, positioniert in Prozent derselben Koordinaten. Beim Neigen kippt
  sie per CSS (`--tilt`), beim Schütteln wackelt sie.
- **Block-Optik**: In den Stationen stehen die `.mcb`-Blöcke flach untereinander, eingerückt
  mit `i1`/`i2`. `nestStack()` in `app.js` baut daraus beim Laden die Klammer-Form wie in
  MakeCode (Kopf, Arm, Fuß); ein `sonst` direkt nach seinem `wenn` wird dessen Mittelsteg.
  Die Einrückung ist also die Struktur — sie muss stimmen. `.mcstack.flat` bleibt flach
  (die Regelkreis-Treppe in Station 0). Symbole wie das Herz sind 5×5-Bildchen aus `PAT`
  (`<b data-led="heart">`), kein Emoji.
- Fortschritt liegt in `localStorage` unter `mgp-v1`. „Neues Team" löscht ihn — das ist der
  Knopf zwischen zwei Messe-Slots.
- **Maqueen-Figuren**: die Übersicht in Station 0 (`#mqmap`, Draufsicht mit nummerierter
  Legende) und die Einsetz-Animation in Station 3 (`#mqinsert`, leicht erhöhter Blick von
  vorn, micro:bit gleitet per CSS in den Schlitz, danach beide Schalter auf ON) sind
  handgezeichnete Inline-SVGs. Umriss und Bauteillage sind seit 12.10.2026 aus den
  DFRobot-Produktfotos des Maqueen Plus V3.1 abgeleitet (Platine ≈ 110 mm breit → 2,1 px/mm):
  schmale Front mit zwei weißen RGB-Kuppeln und Stützkugel darunter, Schrägen mit den
  Lichtsensoren, Schlitz im vorderen Drittel, Calc-Taste und RST links, Schalter und
  Akkustecker rechts (rechts aus Sicht des Roboters — in der Vorderansicht also links), Summer rechts der Mitte, Motoren vor den Rädern im Einschnitt, Stiftleiste
  hinten. Das Akkubrett ist ein eigenes Deck auf Abstandshaltern über dem Heck (in der
  Draufsicht gestrichelt, damit die Platine sichtbar bleibt), der Laserscanner steht hochkant
  darauf. Unterseite-Teile (5 Liniensensoren: 3 vorn, 2 außen; Stützkugel; 4 RGB) sind
  gestrichelt. Platinenfarben sind feste Hex-Werte (schwarze Platine), nur Marker, Leitlinien
  und Schalter nutzen Tokens; die `.mk`-Marker tragen die Rollenfarben der Legende. Beide
  Figuren teilen sich die `.mqfig`-Klassen in `styles.css`. Steckrichtung und Schalterlage sind
  bestätigt (Martin, 29.10. und 02.11.2026): Bodenplatte vorn am Rand vor dem Rad, Akkubrett
  hinter dem Batteriehalter — beide auf der rechten Seite des Roboters.

## Offen (nach dem Trockenlauf einarbeiten)

- Blocktexte: am Gerät bestätigt. Die Schleife heißt `4 -mal wiederholen` (Zahl vorn, darunter
  „mache“; Screenshot Martin, 02.11.2026). `zeige Pfeil` liegt direkt in Grundlagen, ganz
  unten (Screenshot 02.11.2026). Rechtsklick-Menü: „Duplizieren“
  (Kürzel D), „Blöcke löschen“ (Entf) — bestätigt 02.11.2026.
  Motor ist bestätigt (Screenshot 08.10.2026): `steuere [beide Räder] [vorwärts], Geschwindigkeit 120`
  und `stop [beide Räder]`, einzeln `linkes Rad` / `rechtes Rad`. Kategoriefarbe: siehe Regel 3.
  Quellcode der Erweiterung (github.com/DFRobot/pxt-DFRobot_MaqueenPlus_v20, master am
  08.10.2026) bestätigt: Kategoriefarbe `#0fbc11`; `initialisiere Maqueen Plus V2` gehört in
  jedes Roboterprogramm (setzt die V3-Platine zurück, wartet mit blinkendem X auf Antwort,
  dann Haken) und steht in allen Stationen ab 3. Die Linienverfolgung heißt
  `Line patrolling ON/OFF` plus `Line Following Settings Speed 1–5` (Gruppe „V3“ unter „Mehr“,
  ohne deutsche Übersetzung); von Martin am Gerät bestätigt (08.10.2026), Stationen 4 und 6
  sind umgestellt. Laserscanner: eigene Erweiterung **Matrix LiDAR Entfernung**
  (github.com/DFRobot/pxt-DFRobot_matrixLidarDistanceSensor, reines TypeScript, Farbe `#5b3fe8`,
  in den Stationen `.b-lidar`); muss mit in die Vorlage. Laser- und Lichtblöcke
  (`RGB Car Lights`, `SET PIN P1 RGB show color`) in Station 4/5 am Gerät bestätigt
  (Screenshot 08.10.2026); die 3-s-Pause nach dem Einschalten war dabei nicht nötig.
  MakeCode-Logik heißt deutsch `wenn … dann … ansonsten`; `nestStack()` kennt beides.
  Der Melodieblock heißt `spiele [Melodie …] [im Hintergrund]` (Martin am Gerät, 05.11.2026).
  Noch vorläufig (Liste in `docs/02-offline-und-trockenlauf.md`): die drei Grand-Prix-Blöcke,
  die vier Kreuzungsblöcke, `PID Distance Control`.
- Gemessene Werte: cm bei Tempo 120 in 1 s, ms für 90° (erster Wert von Martin, 08.10.2026:
  ~650 ms bei Geschwindigkeit 100 — die Quadrat-Hilfe in Station 3 nennt deshalb 500–800), sichere Linienstufe, kleinster Kurvenradius
- Entscheidung: Station 2 auf 12 Min kürzen, damit der Roboter früher fährt? (Review-Punkt, offen)
- Danach: Parcours-Bauplan mit dem gemessenen Radius gegenprüfen (Klebeplan steht in
  `tools/grand-prix-druck.html`, Seite 2), Stand-Paket zum Drucken
  (Handzettel mit QR-Code auf die Offline-Datei, Tischaufsteller)
- Fotos vom echten Gerät neben die beiden SVG-Figuren, falls die Zeichnung am Tisch nicht
  reicht (erst nach dem Trockenlauf möglich). Eine USB-Animation für Station 1 ist
  verworfen: Kabel einstecken kennt jeder, das echte Problem (reine Ladekabel) zeigt kein Bild.

## Was nicht in dieses Repo gehört

- `tools/trockenlauf.html` ist nur als Referenz hier. Die lebende Fassung ist ein
  claude.ai-Artefakt mit Datenablage, in das Martin die Messwerte einträgt; das Cowork-Projekt
  „Anfänger Robotik Workshop" liest sie aus. Änderungen am Protokoll dort machen, nicht hier.
- Die Artefakt-Fassung (`website/dist/…-artifact.html`) ist nur zum Teilen/Planen. Für die Messe zählt
  ausschließlich die Offline-Datei.
