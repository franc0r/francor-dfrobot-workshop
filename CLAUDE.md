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
   abgeschaltetem Netzwerk. Die Seite selbst muss immer ohne Netz vollständig funktionieren.
   Ausnahme (von Martin freigegeben, 28.10.2026): Links `href="https://makecode.microbit.org/#…"`.
   Sie laden nichts in die Seite, sondern öffnen MakeCode im zweiten Tab, das aus dem Cache läuft.
   Im Quelltext stehen sie als `href="makecode:neu"` (→ `#newproject`, Knopf „Neues Projekt
   starten“, Station 1 und 2) und `href="makecode:vorlage"` (→ `#project:` + Base64 von
   `microbit/vorlage/vorlage.mkcd`, Knopf „Neues Roboter-Projekt starten“, Station 3, als
   Rückfall auch 4 und 5);
   `build.py` setzt sie ein. `#project:` trägt das Projekt im Link; die Vorlage verweist auf die Erweiterung
   `github:franc0r/pxt-francor-maqueen#v0.1.4` und bettet sie nicht ein. MakeCode lädt sie beim
   ersten Öffnen von GitHub (Netz nötig), danach aus dem Cache — deshalb beim Aufbau auf jedem
   Arbeitsplatz einmal mit Netz öffnen (Martin prüfte das Öffnen am 15.11.2026).
   Seit 29.10.2026 (Martin: auf der Messe gibt es doch Internet, wenn auch langsam) darf ein
   solcher Link auch ein MakeCode-Tutorial von GitHub öffnen:
   `#tutorial:github:franc0r/makecode-maqueen-tutorials/<datei>`. Die Tutorials liegen in
   diesem eigenen Repo (MakeCode braucht dessen `pxt.json` im Hauptordner); Testseite und
   Notizen in `microbit/tutorial/`. Es braucht beim ersten Öffnen Netz, danach nimmt MakeCode
   es vermutlich aus dem Browser-Cache — deshalb beim Aufbau auf jedem Arbeitsplatz einmal öffnen.
   Die Station muss auch ohne das Tutorial gehen: Die Anleitung bleibt auf der Seite.
   `#pub:`-Teilen-Links nicht verwenden. Eingebettetes MakeCode (iframe) bleibt verboten,
   es startet offline nicht (getestet 29.10.2026).
   Auf dem Zweig `worktree-maskottchen` ist der `fetch` an OpenRouter (`LLM_URL` in
   `maskottchen.js`) die eine erlaubte Anfrage nach außen, siehe „Maskottchen-Zweig“ —
   nicht „wegreparieren“.
2. **Eine Datei.** Die Offline-Ausgabe ist eine einzelne HTML-Datei, die per Doppelklick
   aus dem Dateisystem läuft (`file://`). Keine Build-Abhängigkeit zur Laufzeit.
   Bilder gehören deshalb nach `website/src/assets/` und werden im Quelltext als
   `src="assets/datei.png"` (doppelte Anführungszeichen) geschrieben; `build.py` ersetzt das
   durch eine `data:`-URI und bricht ab, wenn danach noch ein `assets/` übrig ist.
   Nie ein Bild von einer URL einbinden.
3. **Nur Blöcke, kein Textcode.** Codebeispiele auf der Seite sind MakeCode-Blöcke,
   nachgebildet mit den `.mcb`-Klassen. Jeder Block trägt die Farbe seiner Kategorie, genau wie
   in MakeCode (am Gerät abgelesen 02.11.2026): Grundlagen `#1E90FF`, Eingabe `#D400D4`,
   Musik `#E63022`, Schleifen `#00AA00`, Logik `#00A4A6`, Mathematik `#9400D3`, Variablen `#DC143C` (Screenshot Martin, 05.11.2026),
   Maqueen `#0FBC11` (hellgrün, `.b-mq`), LiDAR `#5B3FE8` (`.b-lidar`). Seit der
   FRANCOR-Erweiterung (15.11.2026) gibt es kein Grand-Prix-Graphit (`.b-gp`, `#3C3C3C`) mehr:
   Auch die Zählerblöcke gehören zur Kategorie Maqueen. Die Rollenfarben in Station 0 (`.r-*`)
   folgen denselben Werten.
4. **Deutsch, Klasse 7.** Kurze Sätze, Du-Anrede an die Schüler, keine Fachbegriffe ohne
   Bild dazu. Erklärungen an die Betreuenden gehören ins Handbuch (`website/src/handbuch.html`),
   nicht in die Stationen.
5. **90 Minuten = 80 Stationsminuten + 10 Puffer** (Martin, 10.11.2026: „das war auf jeden Fall
   in der Zeit machbar“; vom 03.11. bis 10.11.2026 galten 120 = 105 + 15). Die Minuten
   der Drehbücher (`min` in `website/src/drehbuch/NN-name.js`), das `STATIONS`-Array in `website/src/app.js` und der Zeitplan im Handbuch
   müssen übereinstimmen. Der Puffer hat keine eigene Station; er steht als letzte Zeile im
   Zeitplan (1:20–1:30). `build.py` prüft
   die ersten beiden und dass die Stationen zusammen genau 80 Minuten ergeben
   (`STATIONSMINUTEN`, `PUFFER`).
6. **Blockbezeichnungen**: Die Blöcke der FRANCOR-Erweiterung sind am Gerät bestätigt (Martin,
   16.11.2026, Gerätetest 03 und 08), Liste in `docs/02-offline-und-trockenlauf.md`. Vorläufig
   ist nur noch, was dort unter „Noch vorläufig“ steht: `zeige Zahl (Beschleunigung (mg) y)`
   (Station 2, Extra), Gerätetest 07 (V2-Roboter) und „Sprache und Offline“ der Erweiterung.
   Beim Ändern von Blocktexten immer alle Drehbücher, Karten und das Handbuch gemeinsam anfassen.
   Die alten Blocktexte stehen in der Sperrliste `ALTE_BLOCKTEXTE` in `website/build.py`; der
   Build bricht ab, wenn einer davon in einem Build-Ziel auftaucht.

## Maskottchen-Zweig (worktree-maskottchen)

Experiment (Entwurf `docs/superpowers/specs/2026-11-06-maskottchen-design.md`): Statt der
Stationsseiten führt das Logo als Figur „Franco“ im Gespräch durch den Workshop. `master`
bleibt unberührt; ob der Zweig gemergt wird, entscheidet Martin nach dem Trockenlauf.

- **Regel 1 ist hier aufgehoben, aber nur für den LLM-Aufruf** (Martin, 06.11.2026): „Geht
  nicht“ fragt per `fetch` bei OpenRouter (`LLM_URL`). Sonst gilt Regel 1 weiter, auch die
  Prüfung auf externe Verweise. Die Seite läuft ohne Netz und ohne Schlüssel vollständig;
  „Geht nicht“ zeigt dann die Checkliste „Wenn es klemmt“ und schickt zum Betreuer. Der
  Smoketest prüft das mit abgeschaltetem Netz.
- **Drehbuch** (`website/src/drehbuch/NN-name.js`, eins je Station; ausführlich im Kopf von
  `website/src/maskottchen.js`):
  `DREHBUCH[N] = { name, min, badge, titel, schritte:[ { id, nachrichten:[…], chips:[…], fertig } ] }`.
  `nachrichten` sind HTML-Strings (eine Blase je Eintrag) oder `{karte:"k3-bloecke"}`;
  `{karte:"makecode:neu"}` / `{karte:"makecode:vorlage"}` erzeugen die MakeCode-Knöpfe.
  `chips` sind 3–4 Vorschlagsfragen für „Geht nicht“; `fertig` ist der Text des Weiter-Knopfs.
  Optional: `bonus:true` (Zugabe, „Machen wir!“ / „Überspringen“, danach „Extra: …“),
  `titel` (Name des Extras), `zeig:{ "Knopftext":[…] }` (Nachrichten auf Klick).
  `name`, `min`, `badge` müssen zu `STATIONS` in `app.js` passen.
- **Karten** (`website/src/karten/NN-name.html`): alles, was mehr als eine Blase ist (Blöcke,
  Quiz, Figuren, Checklisten), als `<div class="karte" data-karte="…">`.
  `build.py` legt sie versteckt in `#karten`; `karte()` hängt den Knoten beim Zeigen ins
  Gespräch um (nie geklont, die IDs bleiben einmalig).
- **Konstanten** in `maskottchen.js`: `MASKOTTCHEN_NAME`, `TIPP_MS`, `STUPS_MS`, `LLM_URL`,
  `LLM_MODELL`, `LLM_MAX_TOKENS`, `LLM_TIMEOUT_MS`, `LLM_KONTEXT_ZEICHEN`,
  `LLM_CENT_PRO_MTOKEN`. **Speicher** (`localStorage`): `mgp-v1` (Fortschritt und Gespräch,
  `S.schritt`, `S.chat`, `S.skip`), `mgp-key` (OpenRouter-Schlüssel), `mgp-llm` (Zähler),
  `mgp-tts` (Vorlesen, Standard aus).
- **Zähler**: Jede erfolgreiche Anfrage zählt Anfragen und Token in `mgp-llm`; das Handbuch
  zeigt sie in `#llmzaehler` grob als Cent (Schätzung über `LLM_CENT_PRO_MTOKEN`), mit
  Knopf „Zähler nullen“. Fehler zählen nicht. Die echten Kosten stehen bei OpenRouter.
- **Kontingent**: `S.fragen` zählt die Fragen je Team; ab `LLM_FRAGEN_MAX` (30) fragt „Geht
  nicht“ das LLM nicht mehr, sondern zeigt „Mein Frage-Kontingent … ab jetzt hilft der
  Betreuer.“ und die Checkliste. „Neues Team“ setzt es mit `S` zurück. Das Handbuch rät zu
  einem eigenen Schlüssel mit kleinem Guthaben-Limit, nur in der Offline-Datei, nach der
  Messe löschen.
- **Anfrage**: immer `[system, user]`; die letzten vier Blasen gehen als Mitschrift
  („Franco: … / Team: …“) in die user-Nachricht. Anthropic-Modelle verlangen, dass nach
  `system` zuerst `user` kommt und die Rollen wechseln.
- **Betreuer**: Schlüssel trägt man über den Knopf „LLM Setup“ in der Kopfzeile ein
  (`schluessel.html`, Fenster `#keydlg`; Martin, 09.11.2026), einmal pro
  Arbeitsplatz ein; er liegt nur im Browser, nie in der Datei. „Neues Team“ löscht nur
  `mgp-v1` und lässt Schlüssel, Zähler und Vorlese-Schalter stehen.
- **Blocktexte ändern = Drehbuch + Karten + Handbuch zusammen** (dazu wie bisher
  `microbit/stations/`). Das ersetzt hier die Regel „Stationen und Handbuch gemeinsam“.
- **Testhaken**, nur unter `file://` (nicht auf GitHub Pages): `window.__karte(st, id)` holt
  eine Karte ins Gespräch, `window.__drehbuchMin` liefert die Minuten der Drehbücher.
  `test/drehbuch.cjs` prüft das Schema der sechs Drehbücher ohne Browser.


## Aufbau

Das Repo hat zwei Hälften: die Seite, die gebaut wird, und die Programme, die auf
die Hardware kommen. Sie haben nichts miteinander zu tun außer dem Thema.

```
website/              die Workshop-Seite, eigenständig (npm + build.py wohnen hier)
  src/
    styles.css        Design-Tokens (hell/dunkel), Layout, Block-Optik, Maqueen-Figuren
    topbar.html       Kopfzeile: 90-Min-Timer, Betreuer, Neues Team
    rail.html         linke Stationsleiste (Knöpfe werden aus STATIONS in app.js erzeugt)
    drehbuch/NN-*.js  ein Drehbuch pro Station (DREHBUCH[N]), Gespräch mit Franco
    karten/NN-*.html  Karten je Station (Blöcke, Quiz, Figuren), versteckt in #karten
    figur.html        die Figur (Inline-SVG aus dem Logo, Visier, Augen, Strich-Mund; Mundform je Zustand per CSS d:path())
    maskottchen.js    Figur, Gespräch, Frage-Feld, LLM, Vorlesen; build.py setzt es in app.js
                      an der Marke /* @@EINHAENGEN@@ */ ein, mit den Drehbüchern davor
    stueckliste.html  Seite „Stückliste“ (data-st="teile"): oberster Knopf in der Leiste, keine
                      Station – ohne Minuten, Timer, Abzeichen, ohne Gespräch (Figur und
                      #gespraech sind dort ausgeblendet). Für alle, die fragen, wo es den
                      Roboter gibt: micro:bit V2, Maqueen Plus V3 (18650 oder AA), Batterien,
                      Suchbegriffe, Händlerlisten der Hersteller. Bewusst kein Shop-Link (Martin,
                      08.11.2026); Regel 1 verbietet ihn ohnehin
    assets/           Bilder; build.py bettet sie als data:-URI ein
    handbuch.html     Betreuer-Handbuch (Drawer): Zeitplan, Material, Offline, Pi, Störungen
    sicherheit.html   Sicherheitsfenster beim Teamstart (nach „Neues Team“, Knopf „Sicherheit“)
    schluessel.html   Fenster „LLM Setup“ für den OpenRouter-Schlüssel (Knopf in der Kopfzeile)
    app.js            Fortschritt/Abzeichen (localStorage), Quiz, Timer, Block-Optik (nestStack)
  build.py            baut dist/…-offline.html, …-pages.html und …-artifact.html
  test/drehbuch.cjs   Schemaprüfung der Drehbücher (ohne Browser)
  test/smoke.cjs      Playwright-Smoketest gegen die Offline-Datei
  test/build_test.py  Unittests für die Prüfungen in build.py (`npm run check` führt sie zuerst aus)
  dist/               Bauergebnis; die Offline-Datei ist eingecheckt
microbit/             was auf den Roboter kommt — wird nicht gebaut
  vorlage/            MakeCode-Startprojekt mit der FRANCOR-Erweiterung (vorlage.mkcd, erzeugt von vorlage.py;
                      verweist auf `github:franc0r/pxt-francor-maqueen#v0.1.4`, `beim Start` nur `starte Maqueen`);
                      build.py baut es in den Link in Station 3 und prüft es (`check_vorlage`)
  stations/NN-name/   Musterlösung je Station (03–05): loesung.js (05 auch loesung-profi.js), loesung*.hex
                      (nur micro:bit V2, Rezept in stations/README.md), bloecke.png (05 auch bloecke-profi.png), README.md
  python/             MicroPython: Hardware-Check, Zugabe für Schnelle
tools/                Werkzeuge für Stand und Arbeitsplätze
  trockenlauf.html    Prüfprotokoll (läuft nur als claude.ai-Artefakt, siehe unten)
  grand-prix-druck.html  A4-Blatt 1:10: Teamskizze (Seite 1), Klebeplan (Seite 2); wird nicht gebaut,
                      grand-prix-druck-test.cjs prüft Maßstab und Nummern (`npm run check`)
  messe-bildschirm.html  Endlos-Präsentation für Laufkundschaft am Stand (4 Szenen, offline,
                      Logo eingebettet); wird nicht gebaut. Termine oben in CONFIG eintragen
  qr-handzettel.html  A4-Blatt, 8 Kärtchen mit QR-Code auf die Pages-Seite (Logo eingebettet,
                      QR mit segno erzeugt); wird nicht gebaut, PDF nicht einchecken
  pi/                 udev-Regel, Flash-Skript für den Raspberry Pi
docs/                 Konzept, Offline-Recherche, Review-Notizen
```

Die Ordner unter `microbit/stations/` tragen dieselbe Nummer und denselben Namen wie
die Dateien unter `website/src/drehbuch/` und `website/src/karten/`: `03-fahrschule/` gehört zu
`03-fahrschule.js` und `03-fahrschule.html`. Ändert sich ein Blocktext, werden alle zusammen
angefasst — zusammen mit dem Handbuch. `website/src/stations/` gibt es nicht mehr;
`build.py` bricht ab, wenn der Ordner wieder auftaucht.

Arbeitsablauf: `cd website && python3 build.py && npm test` (`npm test` = erst
`test/drehbuch.cjs`, dann `test/smoke.cjs`; keine Umgebungsvariablen). Erst wenn beides grün
ist, die Offline-Datei auf die Arbeitsplätze kopieren.

`.github/workflows/pages.yml` macht dasselbe bei jedem Push auf `master` und
veröffentlicht das Ziel `pages` auf GitHub Pages
(<https://franc0r.github.io/francor-dfrobot-workshop/>). Der Smoketest ist die Schranke
davor. `pages` ist inhaltsgleich mit `offline`, nur ohne den Zusatz „Offline-Ausgabe“ in
Titel und Kopfzeile, und unterliegt derselben Regel 1 — auch die gehostete Fassung lädt
nichts von außen (eine Vereinsseite soll keine Google-Fonts nachladen). Die Online-Fassung
ist zum Vorbereiten und Herumzeigen; am Messetag zählt die Datei.

## Die Stationen (Stand 16.11.2026)

| Nr | Datei | Min | Kern | Abzeichen |
|---|---|---|---|---|
| 0 | 00-boxenstopp | 5 | Regelkreis, Bauteile am Maqueen | Rookie |
| 1 | 01-erster-kontakt | 11 | MakeCode, Herz blinkt (`beim Start`/`dauerhaft`), flashen | Ersteinschalter |
| 2 | 02-microbit-allein | 11 | LEDs, Knöpfe, Neigung, Schütteln, Würfel; Sensor = Zahl | Pixelkünstler |
| 3 | 03-fahrschule | 15 | Vorlage, einstecken, Schalter, Haken; dann Linie: Knopf A → Startampel + `Linienverfolgung an`, Knopf B → `aus`, `Linien-Tempo`; Projekt heißt „Linie“ | Spurhalter |
| 4 | 04-reflexe | 8 | Im Projekt Linie: Laser-Stopp in `dauerhaft`, `wenn Abstand vorne (mm) < 200 dann Linienverfolgung aus` und Scheinwerfer rot | Bremsassistent |
| 5 | 05-grand-prix | 30 | Strecke lesen, Kreuzungen, Kreuzung 1 umstellen, Tempo-Zone, Melodie, Läufe auf Zeit; Profi: Pro-Ziel mit Variable und `fahre 20 cm … warte bis fertig` | Champion |
| – | Puffer | 10 | keine Station; die Betreuenden setzen ihn ein, wo es hakt | – |

„Datei“ meint auf diesem Zweig das Drehbuch `website/src/drehbuch/NN-name.js` mit den Karten
`website/src/karten/NN-name.html` und die Musterlösung `microbit/stations/NN-name/`.

Roter Faden: Station 1 führt „einmal" (beim Start) vs. „ohne Ende" (dauerhaft) hands-on ein;
Station 2 setzt „Ereignis“ und „ein Sensor liefert Zahlen, die Grenze ist 200“ — auf dem Gerät
mit fertigen Ereignissen (Logo nach oben/unten), im MakeCode-Simulator und im Extra
`zeige Zahl (Beschleunigung y)` sieht man die Zahl; Station 3 greift beides an der Linientabelle
auf (weiß ≈ 3800 / schwarz ≈ 2700) und lässt den Roboter zum ersten Mal selbst fahren;
Station 4 setzt die erste eigene Grenze (200 mm); Station 5 baut alles zusammen. Ab Station 3
arbeiten die Teams durchgehend an einem Projekt („Linie“).

Textbudget je Station (`TEXTBUDGET` in `build.py`, Wörter nach dem Tag-Entfernen, stumpf
gezählt): 200 / 350 / 550 / 500 / 300 / 850. Auf diesem Zweig zählen die Nachrichten des
Drehbuchs (auch hinter den Zeig-Knöpfen) plus die Karten der Station, nicht Chips und
Fertig-Knöpfe; weil ein Gespräch in ganzen Sätzen spricht, gilt das Budget mal
`GESPRAECHSFAKTOR` 1,5 (Martin, 09.11.2026). Der Build bricht ab, wenn eine Station darüber
liegt — dann kürzen, nicht das Budget heben (Martin, 09.11.2026: „Zuviel Text“).

Entlastung vom 15.09.2026 (siehe Cowork-Projekt „Anfänger Robotik Workshop",
`claude/vorschlag-entlastung-stationen.md`): Zeitplan neu verteilt, Station 2 gekürzt
(Bedingung am Neigungssensor ist jetzt Extra statt Pflicht), Station 3 startet mit fertiger
Vorlage statt eigenem Erweiterung-Laden, Station 6 auf drei Tuning-Ideen reduziert. Im Gegenzug
baut Station 1 jetzt explizit eine dauerhaft-Schleife neben beim Start, damit jedes Team das
im Pflichtteil einmal selbst sieht (vorher nur im überspringbaren Bonus in Station 5 erklärt).

Parcours first vom 09.11.2026 (Workshop-Rückmeldung; Entwurf in
`docs/superpowers/specs/2026-11-09-parcours-first-design.md`): Zu viel Text, und Aufgaben, die
der Grand Prix nicht braucht (Räder drehen, Quadrat fahren). Seitdem gilt: Die Roboter-Stationen
zeigen nur, was das Grand-Prix-Programm braucht — kein Motorblock, keine Schleife, keine Variable
außer im Profi-Teil. Die micro:bit-Stationen ohne Roboter behalten Neigung, Schütteln und Würfel
(Martin, 09.11.2026). Fahrschule und Augen sind eine Station (3), Reflexe ist Station 4 mit nur
dem Laser-Stopp (Staubsauger-Challenge und Pausenknopf gestrichen), der Grand Prix ist Station 5
mit damals 40 Minuten (seit 10.11.2026 30, Workshop 90 Minuten). Die beiden eigenen Simulatoren der Seite sind gestrichen (Martin: der
micro:bit-Simulator war verwirrend); Station 2 nutzt den Simulator in MakeCode.

Grand Prix vom 03.–05.11.2026 (Sitzung mit Martin; Entwurf in
`docs/superpowers/specs/2026-11-04-grand-prix-parcours-design.md`): Der Grand Prix (damals
Station 6) dauert 30 statt 15 Minuten, der Workshop 120 statt 90 (Martin, 03./04.11.2026). Die
Reflexe (damals Station 5) sind Pflicht statt Bonus (Martin, 04.11.2026). Die Teams lesen
eine Skizze der Strecke, stellen die Kreuzungsregeln ein, schalten an Kreuzung 1 um, fahren ab
dem Tempo-Schild langsam und hören am Ziel ihre Siegesmelodie (Melodie als Pflicht: Martin,
05.11.2026; Profis hören sie erst am Pro-Ziel). Kein Wettbewerb: Gummibärchen für alle, die Zeit
nur zum Vergleichen. Die Zählnummern 1–4 gelten bis zum Trockenlauf; jede
Stelle, die sie nennt, steht in `microbit/stations/05-grand-prix/README.md`.

## Verein und Logo

Träger des Workshops ist **FRANCOR e. V.** Der Name steht in der Kopfzeile (Wortmarke neben
dem Logo) und im Kolophon am Ende des Betreuer-Handbuchs.

`website/src/assets/francor-logo.png` (105×120) stammt von
`https://www.francor.de/wp-content/uploads/2019/11/cropped-g3811.png`. Zwei Änderungen
gegenüber dem Original: die deckend weißen Trennfugen und Kanten des Originals sind
transparent gerechnet (sonst leuchten sie im Dunkelmodus weiß auf), und die Datei ist auf
120 px Höhe verkleinert. Farbe der Marke: `#E9483F`.

## Technische Fakten (recherchiert, Quellen in docs/)

- MakeCode-Erweiterung: Der Workshop nutzt nur noch die eigene **FRANCOR Maqueen**
  (`github:franc0r/pxt-francor-maqueen#v0.1.4`, Umstellung 15.11.2026). Sie ersetzt
  DFRobot_MaqueenPlus_V2, Matrix LiDAR und die Bibliothek „Grand Prix“ (`custom.ts`, gelöscht).
  Kategorien: Maqueen (Gruppen V3, Linie, Lichter, V2) und LiDAR. Alle benutzten Blöcke liegen in
  der sichtbaren Gruppe V3, nicht unter „mehr“, und sind deutsch übersetzt.
  Reines TypeScript (v0.1.4: keine C++-Dateien) → kompiliert im Browser → läuft offline, sobald
  MakeCode sie einmal geladen hat (Cache).
- MakeCode cacht sich beim ersten Laden vollständig; nur das *Nachladen* einer Erweiterung braucht Netz.
  Die Vorlage verweist auf den GitHub-Tag der Erweiterung (bettet sie nicht ein): Beim ersten
  Öffnen lädt MakeCode sie (Netz nötig), danach läuft sie aus dem Cache.
- Flashen: WebUSB („Gerät koppeln", Chrome/Chromium/Edge, Firmware ≥ 0249) oder `.hex` von Hand
  auf das Laufwerk `MICROBIT` ziehen. Weg B geht immer und ist auf Linux/Raspberry Pi oft der
  Hauptweg (USB-Berechtigung). Für Weg A braucht jedes frische Linux die udev-Regel
  (VID 0d28 / PID 0204, `GROUP="plugdev"`, `tools/pi/50-microbit.rules`) **und** den Benutzer in
  `plugdev` — von Martin auf Ubuntu 26.04 nachgestellt (28.10.2026); beides steht im Handbuch.
- Maqueen: Tempo 0–255, unter ~30 keine Bewegung; zwei Schalter (Akkubrett + Bodenplatte);
  Kalibrierung Calc-Key ~2 s auf Schwarz; Linienverfolgung (`Linienverfolgung an`/`aus`, Tempo
  über `Linien-Tempo 1–5`) läuft im Hintergrund; was sie an Kreuzungen tut, stellen die Blöcke
  `an Kreuzung` / `an Abzweig links` / `an Abzweig rechts` / `an T-Kreuzung` ein (Auswahl
  `geradeaus`/`links`/`rechts`/`halt`); `Linienverfolgung aus` löscht die Kreuzungsregeln (Martin
  am Gerät, 03.11.2026), nach `an` gelten wieder die Standardregeln — im Grand Prix gewollt, die
  Erweiterung nimmt das den Teams absichtlich nicht ab. Die Zählerblöcke (`setze Kreuzungszähler
  zurück`, `wenn Kreuzung Nummer … erreicht`, `Kreuzungen gezählt`) fassen die Regeln nicht an.
  `fahre 20 cm vorwärts warte bis fertig` wartet selbst. Laserscanner 8×8, 20–4000 mm, Blöcke
  `LiDAR einschalten` und `Abstand vorne (mm)` (vorne ab Werk eingestellt).
- Arbeitsplätze: Laptop oder **Raspberry Pi 4 (4 GB+)**; Raspberry Pi OS ist von der micro:bit
  Foundation offiziell unterstützt. 2–4 Plätze pro Slot, je zwei Schüler.

## Block-Optik und Figuren

Die Seite hat seit 09.11.2026 keine eigenen Simulatoren mehr (Parcours- und micro:bit-Simulator
gestrichen, siehe „Parcours first“). Was in `app.js` bleibt: Fortschritt, Quiz, Timer, Block-Optik.

- **Block-Optik**: In den Karten und Blasen stehen die `.mcb`-Blöcke flach untereinander,
  eingerückt mit `i1`/`i2`. `nestStack()` in `app.js` baut daraus die Klammer-Form wie in
  MakeCode (Kopf, Arm, Fuß) — beim Laden einmal über alle Stapel in `#karten`, für Blöcke in
  einer Blase in `blase()` (`maskottchen.js`); ein `sonst` direkt nach seinem `wenn` wird dessen Mittelsteg.
  Die Einrückung ist also die Struktur — sie muss stimmen. `.mcstack.flat` bleibt flach
  (die Regelkreis-Treppe in Station 0). Symbole wie das Herz sind 5×5-Bildchen aus `PAT`
  (`<b data-led="heart">`), kein Emoji.
- **MakeCode-Film** (Station 1, Karte `k1-film`, `.mcfilm` in `styles.css`): ein nachgezeichnetes
  MakeCode-Fenster als Inline-SVG (Vorschau links, Kategorien in der Mitte, Programm rechts). Der
  Zeiger klickt Grundlagen, die Blockliste geht auf, `zeige Symbol` wird nach `beim Start` gezogen,
  rastet ein, die Vorschau zeigt das Herz. Reine CSS-Keyframes auf einer 8-s-Schleife, kein Video
  (Regel 1 und 2: kein Bild von außen, Datei bleibt klein). Der Grundzustand jedes Teils ist das
  Endbild; bei reduzierter Bewegung steht es. Der Smoketest prüft das Endbild. Aufbau und Farben
  des Fensters sind aus dem Gedächtnis gezeichnet, am Gerät noch nicht verglichen (Trockenlauf).
- Fortschritt liegt in `localStorage` unter `mgp-v1`. „Neues Team" löscht ihn — das ist der
  Knopf zwischen zwei Messe-Slots. `load()` stutzt Stände aus einer Fassung mit mehr Stationen
  zurecht (bis 09.11.2026 waren es sieben).
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
  und `stop [beide Räder]`, einzeln `linkes Rad` / `rechtes Rad` — seit 09.11.2026 auf keiner
  Station mehr. Kategoriefarbe: siehe Regel 3.
  FRANCOR-Erweiterung (github.com/franc0r/pxt-francor-maqueen, Tag v0.1.4; seit 15.11.2026):
  Kategoriefarben `#0fbc11` (Maqueen) und `#5b3fe8` (LiDAR). `starte Maqueen` gehört in jedes
  Roboterprogramm (setzt die V3-Platine zurück, wartet mit blinkendem X auf Antwort, dann Haken)
  und steht in allen Stationen ab 3. Am Gerät bestätigt (Martin, 16.11.2026): Gerätetest 03 der
  Erweiterung komplett und Gerätetest 08 (alle vier .hex auf Roboter und Strecke, Zählnummern
  1–4, Profi-Sprung ohne Pause, Vorlage + JavaScript sieht aus wie die Karten); früher
  (12./13.11.2026, v0.1.1) Gerätetest 01, 02, 04, 05, 06. `Bildschirminhalt löschen` (Station 5,
  Knopf A) liegt direkt in Grundlagen (16.11.2026). Die alten DFRobot-Blocktexte stehen in der
  Sperrliste `ALTE_BLOCKTEXTE` (`website/build.py`).
  MakeCode-Logik heißt deutsch `wenn … dann … ansonsten`; `nestStack()` kennt beides.
  Der Melodieblock heißt `spiele [Melodie …] [im Hintergrund]` (Martin am Gerät, 05.11.2026).
  Noch vorläufig (Liste in `docs/02-offline-und-trockenlauf.md`): der Block `zeige Zahl
  (Beschleunigung (mg) y)` im Extra von Station 2 (Wortlaut am Gerät prüfen); noch nicht am
  Gerät: Gerätetest 07 (V2-Roboter) und „Sprache und Offline“ der Erweiterung.
- Gemessene Werte: sichere Linienstufe (Linien-Tempo 1 auf dem Teststreifen, 2 auf der Strecke?),
  kleinster Kurvenradius. Motorwerte (cm/s, ms für 90°) braucht niemand mehr.
- Firmware-Verhalten: Was tut `Linienverfolgung an`, wenn kein Sensor Schwarz sieht — steht der
  Roboter, oder sucht er? Davon hängt ab, wie Station 3 den Start auf dem Teststreifen erklärt.
- Danach: Parcours-Bauplan mit dem gemessenen Radius gegenprüfen (Klebeplan steht in
  `tools/grand-prix-druck.html`, Seite 2), Stand-Paket zum Drucken
  (Handzettel mit QR-Code auf die Offline-Datei, Tischaufsteller)
- Maskottchen-Zweig: Name der Figur (Platzhalter „Franco“, `MASKOTTCHEN_NAME`; setzt beim
  Start Namensschild, `aria-label` der Figur, die `.figurname-ref` im Handbuch und den
  System-Prompt. Fest geschrieben steht der Name nur noch in CLAUDE.md, der Spec und den
  Testerwartungen in `smoke.cjs`) und die
  Entscheidung, ob der Zweig nach dem Trockenlauf gemergt wird. Was dabei zu prüfen ist,
  steht in `docs/02-offline-und-trockenlauf.md`, Abschnitt „Maskottchen“.
- Fotos vom echten Gerät neben die beiden SVG-Figuren, falls die Zeichnung am Tisch nicht
  reicht (erst nach dem Trockenlauf möglich). Eine USB-Animation für Station 1 ist
  verworfen: Kabel einstecken kennt jeder, das echte Problem (reine Ladekabel) zeigt kein Bild.

## Was nicht in dieses Repo gehört

- `tools/trockenlauf.html` ist nur als Referenz hier. Die lebende Fassung ist ein
  claude.ai-Artefakt mit Datenablage, in das Martin die Messwerte einträgt; das Cowork-Projekt
  „Anfänger Robotik Workshop" liest sie aus. Änderungen am Protokoll dort machen, nicht hier.
- Die Artefakt-Fassung (`website/dist/…-artifact.html`) ist nur zum Teilen/Planen. Für die Messe zählt
  ausschließlich die Offline-Datei.
