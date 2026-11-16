# Lokales MakeCode mit Maqueen-Simulator — Design

Stand 16.11.2026, Sitzung mit Martin. Zweig `feature/maqueen-simulator`
(abgezweigt von `feature/maqueen-francor-extension`).

## Worum es geht

Ein eigener MakeCode-Editor von FRANCOR, der drei Dinge kann:

1. Er läuft auf Workshops **ohne Internet** von einem Raspberry Pi 4. Der Pi hängt an einem
   Router, alle Arbeitsplätze (Notebooks oder Pis) hängen per LAN-Kabel daran (Martin).
2. Die Erweiterung **FRANCOR Maqueen** (`pxt-francor-maqueen`) ist fest eingebaut. Sie muss
   nicht mehr von GitHub nachgeladen und nicht mehr beim Aufbau vorab gecacht werden.
3. Neben dem micro:bit fährt ein **Maqueen-Simulator**. Man programmiert mit denselben Blöcken
   wie am Gerät und sieht den Roboter im Browser fahren, auch ohne Hardware (Martin).

Warum (Martin): schlechtes WLAN auf Messen und Workshops, und der Wunsch, ohne Roboter
programmieren zu können.

**Fertig ist die erste Version**, wenn auf einem Arbeitsplatz am Kabel, ohne Internet,

- die Workshop-Seite vom Pi kommt und ihre MakeCode-Knöpfe den lokalen Editor öffnen,
- die Vorlage mit `starte Maqueen` sofort lädt und eine `.hex` ergibt, die sich per
  „Gerät koppeln“ oder von Hand auf den micro:bit bringen lässt,
- die Musterlösung des Grand Prix (`microbit/stations/05-grand-prix/loesung.js`) im Simulator
  vom Start bis zum Ziel fährt: Linie halten, an Kreuzung 1 umstellen, ab dem Tempo-Schild
  langsam, am Ziel halten,
- dasselbe Programm in einem zweiten Lauf vor einer Kiste hält, die man auf die Linie
  schiebt (auf dem richtigen Weg löst der LiDAR-Stopp nie aus, siehe README der Station 5).

## Was schon nachgewiesen ist (Versuch vom 16.11.2026, Wegwerf-Ordner)

- `pxt staticpkg` baut aus `microsoft/pxt-microbit` (Tag v9.1.2, pxt-core 13.2.17) einen Ordner
  mit fertigen Dateien (250 MB, 45 s auf dem Mac). Hinter einem einfachen Webserver lädt der
  Editor bei gesperrtem Internet vollständig und erzeugt eine `.hex`.
- Das fertige npm-Paket `pxt-microbit` reicht dafür nicht; `staticpkg` braucht den Quelltext
  (`libs/`). `npm install` braucht `PUPPETEER_SKIP_DOWNLOAD=1`.
- Die Erweiterung lässt sich als fester Bestandteil einbauen: Kopie nach
  `libs/francor-maqueen/`, Abhängigkeiten in deren `pxt.json` auf `file:../core` und
  `file:../microphone`, Eintrag in `bundleddirs` der `pxtarget.json`. Projekte verweisen dann
  mit `"francor-maqueen": "*"` statt `github:franc0r/pxt-francor-maqueen#v…`.
- Eine eigene Simulatorseite lässt sich ohne Freigabe von Microsoft einhängen:
  `pxtarget.json` → `simulator.messageSimulators.<kanal> = { url, localHostUrl, aspectRatio,
  permanent }`. Die Erweiterung sendet mit `control.simmessages.send(kanal, Buffer, false)` und
  empfängt mit `control.simmessages.onReceived(kanal, …)`. MakeCode öffnet die Seite unter dem
  micro:bit, sobald die erste Nachricht auf dem Kanal kommt.
- Die Seite muss sich anmelden: `parent.postMessage({type:"ready", frameid:
  location.hash.slice(1)}, "*")`. Danach tauschen beide `{type:"messagepacket", channel, data:
  Uint8Array}`. Beide Richtungen sind getestet. Nachrichten vor „ready“ gehen verloren.
- `url` muss eine vollständige Adresse sein (`new URL(url)`), kein relativer Pfad.
  `localHostUrl` gilt, wenn der Editor unter `localhost` läuft und die Adresse
  `localhostmessagesims=1` enthält (gelesen in `pxtsim.js`, nicht ausprobiert).
- WebUSB ist unter `localhost` vorhanden; getestet bis zum Dialog „Connect your micro:bit“.
- Im offiziellen Editor (makecode.microbit.org) lädt eine eigene Simulatorseite nur mit
  Freigabe durch Microsoft. Deshalb der eigene Editor.

## Ziele

1. **Ein Befehl baut den Editor** aus einer festgelegten MakeCode-Version und einer
   festgelegten Version der Erweiterung. Das Ergebnis ist ein Ordner, den der Pi ausliefert.
2. **Deutsche Oberfläche**, wie die Teams sie von makecode.microbit.org kennen.
3. **Der Pi liefert alles aus einer Hand**: Workshop-Seite, Editor, Simulatorseite, über HTTPS
   unter einem Namen (Zertifikat liefert Martin).
4. **Dieselben Blöcke, derselbe Code.** Ein Programm, das im Simulator läuft, ist dasselbe
   Projekt, das als `.hex` auf den Roboter kommt. Kein Simulator-Modus zum Umschalten.
5. **Der Simulator spielt die Platine.** Er kennt die Register des Maqueen Plus V3 und tut, was
   die Platine tut. Die Logik der Erweiterung (Kreuzungen zählen, Linienlage) läuft unverändert.
6. **Eine Version der Erweiterung überall** (Martin, 16.11.2026): immer die aktuellste, heute
   v0.1.4. Lokaler Editor, Offline-Vorlage, Handbuch und Musterlösungen stehen auf demselben
   Stand. Teil 1 baut mit v0.1.4, wie sie ist. Die Simulator-Anbindung (Teil 2) ändert die
   Erweiterung und ergibt eine neue Version; mit ihr ziehen alle Stellen gemeinsam um.
7. **Die Offline-Datei bleibt unberührt**, mit ihren Links auf makecode.microbit.org.
8. **Projekte gehen mit nach Hause** (Martin, 16.11.2026). Was ein Team im lokalen Editor
   gebaut hat, lässt sich zu Hause in makecode.microbit.org öffnen und läuft dort 1:1, nur
   ohne Simulator. Siehe „Projekte in beiden Editoren“.

## Nicht-Ziele (erste Version)

- **Öffentliche Fassung** auf GitHub Pages für zu Hause. Der Bau soll es nicht verbauen, aber
  Logo, Markenname und Lizenz sind vorher zu klären (siehe „Später“).
- **Freigabe bei Microsoft** für den offiziellen Editor.
- **Maqueen Plus V2** (Gruppe „V2“) und der **Ultraschallsensor** im Simulator. Die Blöcke
  bleiben benutzbar, tun im Simulator aber nichts und liefern 0.
- **Physik**: kein Rutschen, keine Trägheit, kein leerer Akku. Der Roboter fährt, wie die
  Räder drehen.
- **Strecken selbst bauen**, mehrere Roboter, 3D, Stoppuhr und Bestenliste.
- **Eine Rückfallebene für den Ausfall des Pi** (Martin, 16.11.2026: „Wir stellen sicher,
  dass der Pi läuft“). Kein Notstart unter `localhost`.
- **Die Station-Texte der Workshop-Seite auf den Simulator umschreiben.** Die Seite bekommt
  nur die Links auf den lokalen Editor. Ob und wo der Simulator im Workshop vorkommt,
  entscheidet Martin später.

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Das Verhalten **am Gerät** ändert sich durch die Simulator-Anbindung. Der Gerätetest der
  Erweiterung ist noch offen; der Weg zur Platine bleibt Zeile für Zeile, wie er ist.
- Der Simulator **tut so, als wäre er genau**. Tempo, Kurven und Sensorwerte sind geschätzt,
  bis sie gemessen sind. Das steht sichtbar im Handbuch und nicht nur im Code.
- Ein Programm fährt im Simulator durch, weil der Simulator **netter ist als die Platine**
  (z. B. Kreuzungsregeln nach `Linienverfolgung aus` behalten). Bekannte Eigenheiten der Platine
  werden nachgebildet, nicht geglättet.
- Externe Verweise in der Workshop-Seite (Regel 1) durch die Hintertür.

## Ansätze für die Anbindung des Simulators

**A. Die Platine nachbauen (gewählt, Martin 16.11.2026).** Alles, was zur Platine geht, läuft
in der Erweiterung durch `writeReg` und `readReg` in `core.ts`. Im Simulator gehen diese
Register an die Simulatorseite statt auf den I2C-Bus. Kleinster Eingriff, die Blöcke bleiben
unverändert, eigene TypeScript-Logik läuft wie am Gerät. Preis: Die Seite muss nachbilden,
was die Firmware der Platine tut.

**B. Jeden Block einzeln anbinden.** Jeder Block schickt einen Befehl wie „Linienverfolgung an“.
Einfachere Seite, aber rund 40 Blöcke mit zweitem Weg, und Simulator und Gerät laufen
auseinander. Verworfen.

**C. Den I2C-Bus im Editor nachbauen.** Der micro:bit-Simulator des eigenen Editors fände an
Adresse `0x10` einen Maqueen. Die Erweiterung bliebe unverändert, aber man greift tief in
MakeCodes Quelltext ein und zieht das bei jeder MakeCode-Version nach. Verworfen.

## Aufbau

Vier Teile in zwei Repos. Jeder Teil ist für sich brauchbar und wird in dieser Reihenfolge
gebaut.

```
francor-dfrobot-workshop/            (dieses Repo)
  tools/makecode-lokal/              Teil 1: Bauskript für den Editor
    bauen.py                         holt MakeCode, baut Erweiterung und Simulator ein, baut
    versionen.json                   festgelegte Versionen (MakeCode-Tag, Erweiterung)
    test/                            Playwright: Editor offline, Vorlage, Grand Prix im Simulator
    README.md
    .cache/  dist/                   nicht eingecheckt (Quelltext, Bauergebnis)
  tools/pi/server/                   Teil 1: Webserver auf dem Pi (HTTPS), Einrichtung
  website/build.py                   Teil 4: viertes Ziel „lokal“
  microbit/vorlage/vorlage.py        Teil 4: zweite Vorlage für den lokalen Editor

pxt-francor-maqueen/                 (Repo der Erweiterung)
  core.ts, lidar.ts, lights.ts       Teil 2: Weg zum Simulator
  simlink.ts                         Teil 2: Verbindung zur Simulatorseite (neu)
  sim/                               Teil 2 und 3: die Simulatorseite (neu)
    index.html                       eine Seite, kein Framework, kein Bauschritt
    platine.js                       Register und Firmware-Verhalten
    welt.js                          Roboter, Strecke, Sensoren, Hindernisse
    strecken/                        Grand Prix, Teststreifen, freie Fläche
    werte.js                         alle geschätzten Werte an einer Stelle
  test-node/                         Tests für platine.js und welt.js (ohne Browser)
```

### Teil 1 — Editor und Pi

`bauen.py` tut, was im Versuch von Hand geschah:

1. `pxt-microbit` im festgelegten Tag nach `.cache/` holen, Pakete installieren.
2. Die Erweiterung aus `../pxt-francor-maqueen` im festgelegten Tag nach `libs/francor-maqueen/`
   kopieren (nur was in deren `pxt.json` unter `files` steht), Abhängigkeiten umschreiben,
   in `bundleddirs` eintragen. Mit `--arbeitsstand` nimmt es stattdessen den Stand auf der
   Platte, zum Entwickeln.
3. In `pxtarget.json` den Kanal `francor-maqueen` unter `messageSimulators` eintragen:
   `url` = `https://<name>/sim/index.html`, `localHostUrl` =
   `http://localhost:<port>/sim/index.html`. `<name>` kommt als Argument (`--name
   makecode.francor.de` oder was Martin wählt).
4. `pxt staticpkg --route mc` mit deutschen Übersetzungen.
5. `sim/` der Erweiterung und die Workshop-Seite (Ziel „lokal“, Teil 4) dazulegen.
6. Prüfen und abbrechen, wenn das Ergebnis nicht vollständig ist (Editor, `hexcache`,
   Erweiterung in `target.js`, Simulatorseite).

Ergebnis `dist/`:

```
/                 Workshop-Seite (Ziel „lokal“)
/mc/              der Editor
/sim/             die Simulatorseite
```

Der Pi liefert `dist/` über HTTPS aus. Zertifikat und Schlüssel legt Martin an einen festen
Ort; der Name wird im Router auf den Pi aufgelöst. Gebaut wird auf dem Mac, der Pi bekommt
nur den Ordner. `tools/pi/server/` enthält die Serverkonfiguration, ein Einrichtungsskript
und die Anleitung, dazu einen Befehl, der den Ordner zum Entwickeln unter `localhost`
ausliefert.

### Projekte in beiden Editoren (gehört zu Teil 1, erster Schritt)

Ein Projekt nennt seine Erweiterungen in `pxt.json`. Mit der eingebauten Erweiterung steht
dort `"francor-maqueen": "*"`; der offizielle Editor kennt aber nur
`"github:franc0r/pxt-francor-maqueen#v…"` und meldet sonst eine fehlende Erweiterung.

**Weg 1 (zuerst prüfen):** Der lokale Editor versteht den GitHub-Verweis ohne Netz. Im
Versuch fragte er dafür `https://www.makecode.com/api/gh/franc0r/pxt-francor-maqueen/v0.1.4/text`
und `api.github.com` ab. Zu klären ist, ob sich diese Antwort im Bau hinterlegen lässt
(mitgelieferter Zwischenspeicher, eigene Adresse für die Abfrage oder Ähnliches). Gelingt
das, tragen Projekte in beiden Editoren denselben Verweis und wandern in beide Richtungen
ohne Zutun. Dann entfallen die zweite Vorlage und das Einbauen über `bundleddirs`; die
Vorlage ist dieselbe wie in der Offline-Datei. Die Version im Verweis ist die eine
aktuelle (Ziel 6).

**Weg 2 (Ersatz, falls Weg 1 nicht geht):** Die Erweiterung bleibt eingebaut wie im Versuch.
Der Pi liefert eine kleine Seite „Für zu Hause speichern“: Das Team zieht seine `.hex` oder
Projektdatei hinein und bekommt eine Datei mit dem GitHub-Verweis zurück. Die Seite rechnet
im Browser, nichts wird hochgeladen. Sie gilt nur in diese eine Richtung.

Der Plan beginnt mit dem Versuch zu Weg 1 und legt danach fest, welcher Weg gebaut wird.
Die Teile 2 und 3 hängen nicht davon ab.

### Teil 2 — Verbindung zwischen Erweiterung und Simulator

**In der Erweiterung** kommt `simlink.ts` dazu, und vier Stellen bekommen eine Abzweigung:

- `writeReg(reg, bytes)`: im Simulator eine Nachricht „Register schreiben“ an die Seite.
- `readReg(reg, n)`: im Simulator Antwort aus einer **Kopie der Register**, die die Seite
  laufend schickt. Lesen ist am Gerät sofort da, Nachrichten brauchen einen Moment; deshalb
  die Kopie statt Frage und Antwort.
- LiDAR (`request()` in `lidar.ts`): liest Richtung und die drei Entfernungen aus der Kopie.
- Lichter (`showLights()` in `lights.ts`): schicken ihre zwölf Farbbytes.

Am Gerät läuft an allen vier Stellen genau der heutige Code. Ob das Programm im Simulator
läuft, entscheidet eine einzige Funktion in `simlink.ts`.

**Anmeldung.** Solange die Seite noch nichts geschickt hat, liest `readReg` Nullen. Damit
blinkt `starte Maqueen` das X, genau wie am Gerät mit ausgeschalteter Platine, und zeigt den
Haken, sobald die Seite da ist. `simlink.ts` meldet sich wiederholt, bis die erste Kopie
ankommt, und hält Schreibbefehle bis dahin zurück, damit auch Programme ohne Startblock
nichts verlieren.

**Nachrichten** (Kanal `francor-maqueen`, kurze Byte-Folgen, kein JSON):

| Richtung | Nachricht | Inhalt |
|---|---|---|
| Programm → Seite | Hallo | Version des Protokolls |
| Programm → Seite | Register schreiben | Register, Bytes |
| Programm → Seite | Lichter | Pin, 12 Bytes (GRB) |
| Programm → Seite | LiDAR | Befehl (einschalten, Ausweich-Abstand) |
| Seite → Programm | Zustand | Kopie aller lesbaren Register, LiDAR-Werte |

Die Seite schickt den Zustand als Antwort auf „Hallo“ und danach etwa 50-mal je Sekunde.
Startet MakeCode das Programm neu, setzt die Seite Platine und Roboter zurück.

**Die Seite nach Teil 2** zeigt den Roboter von oben auf leerer Fläche: Er fährt mit den
Motorblöcken, Scheinwerfer und die vier Lichter unten leuchten. Das ist der erste sichtbare
Stand.

### Teil 3 — Platine und Welt

`platine.js` bildet nach, was die Firmware tut. Grundlage sind die Register aus der
Erweiterung und Martins Rust-Treiber `franc0r/francor-maqueen-plus` (gilt vor DFRobots Code).

| Bereich | Register | Verhalten im Simulator |
|---|---|---|
| Start | `0x49`, `0x32`, `0x33` | Reset setzt alles zurück; Version ungleich 0 |
| Motoren | `0x00` | Richtung und Tempo je Rad, unter etwa 30 keine Bewegung |
| Scheinwerfer | `0x0B`, `0x0C` | Farbe links und rechts |
| Liniensensoren | `0x1D`, `0x1E`–`0x27` | fünf Sensoren aus der Strecke unter dem Roboter; weiß ≈ 3800, schwarz ≈ 2700 |
| Linienverfolgung | `60`, `63` | an (`0x05`), aus (`0x08`), Linien-Tempo 1–5 |
| Kreuzungen | `61`, `69`–`72` | Art der Kreuzung erkennen und melden; Regel anwenden (geradeaus, links, rechts, halt) |
| PID-Fahrt | `64`–`68`, `85`–`87`, `60` | Strecke fahren, drehen, „fertig“ melden, abbrechen (`0x10`) |
| Radgeschwindigkeit | `76`–`77` | Tempo je Rad (Wert = cm/s × 5) |
| Umgebungslicht | `78`–`81` | fester mittlerer Wert links und rechts; keine Lampen in der Welt |

Bekannte Eigenheit, die nachgebildet wird: `Linienverfolgung aus` löscht die Kreuzungsregeln;
nach `an` gelten wieder die Standardregeln (Martin am Gerät, 03.11.2026).

`welt.js` rechnet den Roboter (zwei Räder, Platine etwa 110 mm breit), die fünf Sensorpunkte
unter der Front, die Strecke als schwarze Linien auf Weiß, und Kisten als Hindernisse. Der
LiDAR liefert die Entfernung nach links, vorn und rechts zur nächsten Kiste oder Wand (20 bis
4000 mm).

**Strecken:**

- **Grand Prix**: die Matte 100 × 200 cm mit denselben Maßen wie
  `tools/grand-prix-druck.html` (Startgerade, Abzweig K1, Stummel mit Kiste, Tempo-Schild als
  Querstrich, Ziel als T). Die Maße werden als Daten in `sim/strecken/` abgelegt; die Quelle
  steht dabei.
- **Teststreifen**: 60 cm gerade schwarze Linie wie im Handbuch, für Station 3 und 4.
- **Freie Fläche**: keine Linie, eine Kiste, zum Ausprobieren.

**Bedienung der Seite** (Deutsch und Englisch, je nach Sprache des Editors):

```
┌──────────────────────────────────────┐
│ Strecke: [Grand Prix ▾]   [↺ Start]  │
├──────────────────────────────────────┤
│                                      │
│      Draufsicht: Matte, Linien,      │
│      Roboter mit Lichtern,           │
│      Kiste (mit der Maus schiebbar)  │
│                                      │
├──────────────────────────────────────┤
│ Linie ■■□■■   LiDAR vorn 412 mm      │
└──────────────────────────────────────┘
```

Strecke wählen, Roboter zurück an den Start, Kiste und Roboter mit Maus oder Finger
verschieben. Unten die fünf Liniensensoren und die LiDAR-Entfernung, damit man sieht, was der
Roboter „sieht“ (Station 2 und 3: ein Sensor liefert Zahlen).

**Geschätzte Werte.** Alles, was am Gerät noch nicht gemessen ist, steht in `werte.js` mit
dem Vermerk `VORLÄUFIG`: cm/s je Motorwert, cm/s je Linien-Tempo 1–5, kleinster Kurvenradius,
Standardregeln nach dem Einschalten, Verhalten von `Linienverfolgung an` ohne Linie (Annahme:
Roboter bleibt stehen), Tempo der PID-Fahrt, Zeit zum Erkennen einer Kreuzung. Der
Trockenlauf und der Gerätetest der Erweiterung liefern die echten Werte.

### Teil 4 — Workshop-Seite anbinden

- `website/build.py` bekommt ein viertes Ziel **`lokal`**. Es ist inhaltsgleich mit `offline`,
  nur zeigen `makecode:neu` und `makecode:vorlage` auf `/mc/index.html#newproject` und
  `/mc/index.html#project:…`. Das sind Pfade auf demselben Server, keine externen Verweise;
  die Prüfung aus Regel 1 bleibt unverändert scharf.
- Nur bei Weg 2: `microbit/vorlage/vorlage.py` erzeugt zusätzlich `vorlage-lokal.mkcd` mit
  `"francor-maqueen": "*"`. Das Ziel `lokal` nimmt diese Vorlage, alle anderen Ziele wie
  bisher die mit dem GitHub-Verweis.
- Das Ziel `lokal` wird nicht eingecheckt und läuft nur vom Pi. Die Offline-Datei bleibt, wie
  sie ist.
- Handbuch: ein Abschnitt „MakeCode vom Pi“ (Aufbau, Adresse, Pi vor dem Slot prüfen) und der
  Hinweis, dass der Simulator schätzt.
- Mit der neuen Version der Erweiterung (Teil 2): `FRANCOR_MAQUEEN` in `vorlage.py` und
  `build.py`, die Versionsangabe im Handbuch und die `.hex` der Musterlösungen auf den neuen
  Stand, nachdem Martin sie am Gerät geprüft hat.
- CLAUDE.md: Regel 1 um das Ziel `lokal` ergänzen, Aufbau um `tools/makecode-lokal/` und
  `tools/pi/server/`.

## Abnahme

Teil 1:

- `bauen.py` läuft auf einem frischen Rechner mit Node und Python durch.
- Playwright bei gesperrtem Netz: Editor lädt auf Deutsch, Kategorien „Maqueen“ und „LiDAR“
  sind da, die lokale Vorlage ergibt eine `.hex`.
- Ein im lokalen Editor gebautes Projekt (Vorlage plus zwei Maqueen-Blöcke) öffnet sich in
  makecode.microbit.org ohne Fehlermeldung und ergibt dort eine `.hex` – bei Weg 1 direkt,
  bei Weg 2 nach „Für zu Hause speichern“ (Martin, mit Netz).
- Auf dem Pi: Ein Arbeitsplatz am Kabel öffnet `https://<name>/`, der Browser zeigt keine
  Zertifikatswarnung, „Gerät koppeln“ flasht einen micro:bit (Martin am Gerät).

Teil 2:

- Die Tests der Erweiterung (`npm test`, `npm run build`) sind grün; die `.hex` der
  Gerätetests unterscheidet sich im Verhalten nicht (gleiche Registerfolge am Gerät).
- Im lokalen Editor: `starte Maqueen` zeigt den Haken, `fahre` bewegt den Roboter auf der
  Seite, `setze Licht` färbt die Lichter. Ein Neustart des Programms setzt den Roboter zurück.
- Im offiziellen Editor verhält sich die Erweiterung wie heute (X blinkt, kein Fehler).

Teil 3:

- Tests ohne Browser für jede Zeile der Registertabelle und für die Kreuzungsarten.
- Playwright: Die Stationsprogramme aus `geraetetest/08-stationen.ts` laufen im Simulator.
  Station 3 folgt dem Teststreifen und hält mit Knopf B. Station 4 hält vor der Kiste und
  leuchtet rot. Station 5 erreicht auf der Grand-Prix-Strecke das Ziel und hält dort; die
  Kreuzungen werden als 1–4 gezählt wie in `microbit/stations/05-grand-prix/README.md`.
  Die Profi-Lösung (`loesung-profi.js`, Lücke, PID-Fahrt, Pro-Ziel) fährt ebenfalls durch;
  sie ist der letzte Schritt von Teil 3.
- Auf einem Pi 4 als Arbeitsplatz läuft der Simulator flüssig (Martin).

Teil 4:

- `python3 build.py && npm test` wie bisher grün; das Ziel `lokal` enthält keinen externen
  Verweis und keinen Link auf makecode.microbit.org.
- Vom Pi: Der Knopf „Neues Roboter-Projekt starten“ in Station 3 öffnet den lokalen Editor
  mit der Vorlage.

## Meine Festlegungen (Martin prüft beim Lesen)

- Die Simulatorseite wohnt im Repo der Erweiterung, das Bauskript hier unter `tools/`.
- Die Simulatorseite ist einfaches JavaScript ohne Framework und ohne Bauschritt.
- Zuerst der Stand (Pi im LAN), die öffentliche Fassung später.
- Workshop-Seite, Editor und Simulator kommen vom selben Pi unter einem Namen; die
  Workshop-Seite verlinkt den Editor über Pfade.
- V2 und Ultraschall bleiben im Simulator ohne Wirkung.
- Die Version mit der Simulator-Anbindung heißt 0.2.0.
- Die Seite zeigt Sensorwerte an (Linie, LiDAR).
- Keine Zufallsstreuung in den Sensorwerten, damit Tests wiederholbar sind.
- Die Profi-Lösung gehört zur Abnahme, weil sie als einzige die PID-Fahrt von Anfang bis
  Ende prüft.
- `build.py` bekommt für die lokale Vorlage eine eigene Prüfung; `check_vorlage` verlangt
  heute den GitHub-Verweis.

## Offen und Risiken

- **Firmware-Verhalten ist ungemessen** (siehe `werte.js`). Der Simulator kann erst nach
  Gerätetest und Trockenlauf so fahren wie der Roboter. Bis dahin taugt er zum Programmieren
  und Verstehen, nicht zum Abstimmen von Zeiten.
- **Deutsche Oberfläche:** Der Versuch lief auf Englisch. `staticpkg --locs` holt die
  Übersetzungen; ob das ohne Zugangsschlüssel geht, ist nicht geprüft. Das ist der erste
  Schritt in Teil 1, weil ein englischer Editor für Klasse 7 nicht in Frage kommt.
- **Erkennen, ob das Programm im Simulator läuft:** Der Weg (voraussichtlich
  `control.deviceDalVersion() == "sim"`) ist nicht ausprobiert. Erster Schritt in Teil 2.
- **WebUSB über HTTPS im LAN** ist nicht getestet, nur unter `localhost`.
- **Fehlermeldungen beim Bau:** Der Simulator-Teil von MakeCode wirft TypeScript-Fehler, das
  Ergebnis lief trotzdem. Ursache klären, bevor man sich auf den Bau verlässt.
- **Adresse der Simulatorseite steht fest im Bau.** Anderer Name heißt neu bauen.
- **MakeCode-Version:** Der eigene Editor altert. Projekte aus einem neueren offiziellen
  Editor können sich im älteren lokalen nicht öffnen lassen. `versionen.json` wird vor jeder
  Messe geprüft.
- **LiDAR-Adresse:** `lidar.ts` nimmt `0x33`, die README des Rust-Treibers nennt `0x30`. Für
  den Simulator egal, für das Gerät beim Gerätetest ansehen.
- **Statistik-Aufrufe** des Editors an Microsoft laufen im LAN ins Leere. Wenn sie sich im
  Bau abschalten lassen, abschalten.

## Dem Bauenden überlassen

- Byte-Aufbau der Nachrichten und welche Register in der Kopie liegen.
- Webserver auf dem Pi (Caddy, nginx oder anderes) und wie er startet.
- Zeichentechnik der Seite (Canvas oder SVG), Aufteilung der Dateien unter `sim/`.
- Wie `bauen.py` die Erweiterung in einem festen Tag holt (Git-Archiv oder Arbeitskopie).
- Regler der nachgebildeten Linienverfolgung, solange die Abnahme erfüllt ist.

## Später

- Öffentliche Fassung für zu Hause (GitHub Pages): zweiter Bau mit anderem Namen; vorher
  Logo, Markenname „micro:bit“/„MakeCode“ und Lizenz klären.
- Anfrage bei Microsoft, ob der Simulator in den offiziellen Editor darf.
- Stoppuhr für Läufe auf Zeit, eigene Strecken, V2, Ultraschall.
- Der Simulator als Teil einer Station oder als Zugabe im Workshop.
