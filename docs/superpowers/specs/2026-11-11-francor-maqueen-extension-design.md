# FRANCOR-Maqueen-Erweiterung für MakeCode — Design

Stand 11.11.2026, Sitzung mit Martin. Zweig `feature/maqueen-francor-extension`.

## Worum es geht

Eine eigene MakeCode-Erweiterung von FRANCOR ersetzt drei Dinge auf einmal:
die DFRobot-Erweiterung `DFRobot_MaqueenPlus_V2`, die LiDAR-Erweiterung
`Matrix LiDAR Entfernung` und unsere Bibliothek „Grand Prix“ (`microbit/bibliothek/custom.ts`).

Warum (Martin): Mit DFRobots Erweiterung ist er „überhaupt nicht zufrieden“.

- **Sprache:** Die Blöcke sind teils deutsch, teils englisch, und die Übersetzung ist schlecht.
  Ursachen laut Quellcode: Die Gruppe „V3“ hat gar keine Übersetzung, die Schlüssel für die
  Liniensensoren passen nicht zum Code (`L1` statt `SensorL1`), der LED-Schalter ist
  vermutlich verdreht (`Close` = „an“), dazu Tippfehler und Sie-Form beim LiDAR.
- **Lichter unten:** Die vier RGB-LEDs lassen sich praktisch nur gemeinsam schalten. Der Grund
  ist vermutlich der Pin: DFRobot nimmt als Vorgabe P15, das ist der Pin des V2. Beim V3
  hängen die LEDs an P1 (Martins Rust-Treiber).
- **Linienverfolgung ist eine Blackbox:** `Line patrolling ON` läuft in der Firmware der
  Platine. Für den Einstieg ist das gut, zum Verstehen nicht. Die Teams sollen sehen und selbst
  bauen können, wie ein Roboter die Linie hält.
- **Zu langsame Schleifen:** Der LiDAR muss heute in jedem `dauerhaft` erst „Daten abrufen“.
  Im Workshop half nur ein zweites `dauerhaft` mit einer Variable.

**Fertig ist die erste Version**, wenn Martin den Workshop mit der neuen Erweiterung statt
DFRobots Blöcken durcharbeiten kann. Jede Roboter-Station lässt sich nachbauen und läuft am
Gerät: Station 3, 4 und 5 einschließlich Profi-Teil (siehe `microbit/stations/*/README.md`).
Dazu kommt die selbst gebaute Linienverfolgung mit der Linienlage (unten). Das gilt, auch wenn
die Workshop-Seite selbst noch nicht umgestellt ist.

## Ziele

1. Eine Erweiterung, die DFRobot-Maqueen, DFRobot-LiDAR und Grand Prix ersetzt.
2. **Zwei Sprachen: Englisch und Deutsch** (Martin). Englisch ist die Grundsprache im Code,
   Deutsch eine vollständige Übersetzung. Kein Block, kein Auswahlwert, keine Kategorie, keine
   Hilfe bleibt unübersetzt. Das Deutsch ist für Klasse 7: kurze Blocktexte, Du-Form.
3. **Maqueen Plus V3** ist die Hauptsache. Der **Maqueen Plus V2** bekommt eine **eigene
   Gruppe**, auch wenn sich dadurch Blöcke doppeln (Martin).
4. Die Linienverfolgung lässt sich auf dem micro:bit selbst bauen (Sensoren, Linienlage,
   Motoren je Rad). Der fertige Modus der Platine bleibt daneben erhalten.
5. Offline-fähig: reines TypeScript, kein C++. Dann kompiliert MakeCode im Browser, und die
   Erweiterung läuft ohne Netz, sobald sie im Projekt steckt (Regel 1 des Workshops).

## Nicht-Ziele (erste Version)

- **Die Workshop-Seite umstellen** (Drehbücher, Karten, Musterlösungen, Handbuch, Vorlage,
  `.b-gp`-Farbe). Das kommt später als eigenes Projekt (Martin).
- **Infrarot-Fernbedienung.** Kommt in ein späteres Release (Martin), siehe „Später“.
- **Schnelle Display-Blöcke** („zeige Bild sofort“). Die Wartezeit von `zeige LEDs` und
  `zeige Symbol` stört auch, gehört aber nicht zum Roboter (Martin).
- **LiDAR-Matrixmodus** mit 64 Einzelstrahlen. Bleibt draußen, solange Martin ihn nicht
  vermisst.
- **Regenbogen-Block** für die LEDs.
- Firmware-Verhalten der Platine ändern. Zum Beispiel löscht `Line patrolling OFF` die
  Kreuzungsregeln. Die Erweiterung reicht das durch und versteckt es nicht. Dass die Teams
  die Regeln danach neu setzen müssen, ist im Grand Prix gewollt (CLAUDE.md).

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Irgendwo erscheint im deutschen MakeCode ein englischer Rest.
- Ein Block hängt sekundenlang, weil ein Sensor fehlt (heute: LiDAR bis 8 s). Einzige
  Ausnahme ist „starte Maqueen“, siehe dort.
- Ein Team muss einen Pin, eine I2C-Adresse oder einen „Daten abrufen“-Block kennen, um
  einen Wert zu bekommen.
- Die Erweiterung beißt sich mit DFRobots Erweiterung, wenn beide im selben Projekt stecken
  (zum Beispiel in alten Vorlagen).

## Grundlage

Martins Rust-Treiber ist am Gerät getestet und die Referenz für Register, Bedeutungen und
Zeiten:

- `github.com/franc0r/francor-maqueen-plus`: hardware-unabhängiger Treiber, vor allem
  `src/registers.rs`, `src/robot.rs`, `src/lidar.rs`, `src/ws2812.rs`.
- `github.com/franc0r/francor-maqueen-plus-microbit`: Pinbelegung des micro:bit und Beispiele
  (`line_patrol`, `lidar`, `neopixel`, `pid_moves`, `hardware_check`).

DFRobots TypeScript-Quellcode (`DFRobot/pxt-DFRobot_MaqueenPlus_v20`,
`DFRobot/pxt-DFRobot_matrixLidarDistanceSensor`) dient nur zum Gegenlesen. Wo er und der
Rust-Treiber sich widersprechen, gilt der Rust-Treiber.

Wichtige Fakten aus dem Rust-Treiber:

- **Platine:** I2C 0x10. Lesen geht so: Register-Index schreiben, STOP, dann lesen, nie mit
  repeated start. In MakeCode heißt das `i2cWriteNumber` + `i2cReadNumber/Buffer`.
- **Start:** Reset (Register 0x49 ← 1), 100 ms warten, dann alle 500 ms die Versionslänge
  (0x32) abfragen, bis sie nicht mehr 0 ist. Während des Neustarts (~200 ms) antwortet die
  Platine nicht. Das gilt als „noch nicht bereit“ und nicht als Fehler.
- **Motoren:** Register 0x00 (links) und 0x02 (rechts), Werte `[Richtung 0/1, Tempo 0–255]`.
  Unter etwa 30 dreht sich das Rad nicht.
- **Liniensensoren:** Status-Byte 0x1D (L2 = 0x10, L1 = 0x08, M = 0x04, R1 = 0x02,
  R2 = 0x01). Rohwerte stehen als 16 Bit little-endian in 0x1E (R2), 0x20 (R1), 0x22 (M),
  0x24 (L1) und 0x26 (L2). Typisch ist weiß ≈ 3800 und schwarz ≈ 2700.
- **Lichter unten:** 4× WS2812, **V3 an P1**, V2 an P15.
- **Scheinwerfer (V3):** 0x0B links, 0x0C rechts, Farbe 0–7 (aus, rot, grün, gelb, blau,
  lila, cyan, weiß).
- **LiDAR:** beim V3 ab Werk auf **I2C 0x33** (DIP-Schalter). Er braucht nach dem Einschalten
  etwa 3 s. Das Protokoll arbeitet mit Rahmen (siehe `lidar.rs`).

## Aufbau

- **Eigenes, öffentliches Repo** `franc0r/pxt-francor-maqueen` mit `pxt.json` im
  Hauptordner, so wie MakeCode es braucht. Anlegen ist freigegeben (Martin, 11.11.2026).
  MakeCode lädt die Erweiterung über Versions-Tags. *(Name: meine Wahl.)*
- **Eigene Namensräume** im Code, nicht `maqueen` und nicht `maqueenPlusV2`. Beide gehören
  DFRobot und würden sich im selben Projekt beißen. *(Vorschlag: `francorMaqueen` und
  `francorLidar`, Wahl des Bauenden.)*
- **Zwei Kategorien** in der Blockliste:

  | Kategorie | Farbe | Inhalt |
  |---|---|---|
  | Maqueen | `#0FBC11` | V3-Gruppe (mit Kreuzungen zählen), V2-Gruppe, Linie |
  | LiDAR | `#5B3FE8` | Abstandsblöcke |

  Die Farben entsprechen Regel 3 der Workshop-Seite. Grand Prix ist **keine eigene Kategorie
  mehr**: Das Kreuzungen-Zählen wandert in die Maqueen-Kategorie (Martin).
- **Übersetzungen** in `_locales/de/*-strings.json` und `*-jsdoc-strings.json`, mit allen
  Schlüsseln. Dazu gehört eine Prüfung (Skript oder Test), die meldet, wenn ein Block, ein
  Enum-Wert oder eine Gruppe ohne deutschen Eintrag ist. So entsteht nie wieder ein Fehler wie
  `L1`/`SensorL1`.
- Abhängigkeiten nur `core`. Für die WS2812-LEDs kommt eventuell `ws2812b` (Microsoft) dazu,
  das ist reines TypeScript plus Shim. Wahl des Bauenden, Hauptsache offline-fähig.

## Blöcke

Die Wortlaute sind Vorschläge und bleiben vorläufig, bis Martin sie am Gerät gesehen hat.
Deutsch steht vorn, die englische Grundform in Klammern.

### Maqueen · Gruppe „V3“

- **Start:** „starte Maqueen“ (`start Maqueen`). Gehört in `beim Start`. Ablauf wie heute:
  Während die Erweiterung auf die Platine wartet, blinkt ein X, danach kommt ein Haken
  (Station 3 baut darauf). **Antwortet die Platine nie, blinkt das X endlos, wie heute bei
  DFRobot.** Das gilt auch im MakeCode-Simulator, wo die Platine nie antwortet. Beides ist so
  gewollt (Martin, 11.11.2026).
- **Motoren:**
  - „fahre links … rechts …“ (`drive left … right …`), je −100 bis +100 %, negativ heißt
    rückwärts (Martin).
  - „fahre … %“ für beide Räder gleich.
  - „stopp“.
  - Wie die %-Werte auf 0–255 umgerechnet werden und ob die tote Zone unter ~30 ausgeglichen
    wird, entscheidet der Bauende nach einem Versuch am Gerät. Martin will das Ergebnis sehen.
- **Fertige Linienverfolgung** (Firmware der Platine):
  - „Linienverfolgung an/aus“
  - „Linien-Tempo 1–5“
  - die vier Kreuzungsregeln: Kreuzung / T-Kreuzung / links-oder-geradeaus /
    rechts-oder-geradeaus → geradeaus / links / rechts / halt (je nur die erlaubten Werte)
  - „erkannte Kreuzung“ (keine / Kreuzung / T / links-geradeaus / rechts-geradeaus)
- **Kreuzungen zählen** (bisher Bibliothek „Grand Prix“, Verhalten unverändert wie in
  `microbit/bibliothek/custom.ts`):
  - „wenn Kreuzung Nummer … erreicht“
  - „Kreuzungen gezählt“
  - „setze Kreuzungszähler zurück“
  - Hintergrund-Abfrage alle 20 ms, zählt den Wechsel keine → Kreuzung, Sperrzeit 300 ms.
- **Scheinwerfer:** „Scheinwerfer [links/rechts/beide] Farbe …“ mit den 8 Farben der Platine,
  „aus“ eingeschlossen.
- **PID-Fahrten:**
  - „fahre … cm [vorwärts/rückwärts]“ und „drehe … Grad“ (−180…180), jeweils mit der Wahl
    „warten bis fertig / sofort weiter“.
  - „PID stopp“.
  - **Bekannter Fehler:** Bei DFRobot wartet „No interruptions allowed“ nicht wirklich
    (Martin am Gerät, 05.11.2026, Station 5). Vermutlich liest DFRobot das Busy-Flag (87),
    bevor die Platine es gesetzt hat. „warten bis fertig“ muss hier wirklich warten: erst
    warten, bis das Flag 1 wird, dann bis es 0 wird, mit Zeitlimit. Am Gerät prüfen.
- **Unter „mehr“:** Radgeschwindigkeit links/rechts in cm/s (Register 76, Wert/5),
  Umgebungslicht links/rechts (78), Firmware-Version.

### Maqueen · Gruppe „Linie“ (V2 und V3)

Beide Modelle haben dieselben fünf Sensoren an denselben Registern.

- **„Sensor [L2/L1/M/R1/R2] sieht Linie“** (wahr/falsch) aus dem Status-Byte. Den gibt es
  schon heute, er bleibt (Martin).
- **„Rohwert Sensor …“** (Zahl, 16 Bit).
- **„Linienlage“ (neu, Martin):** eine Zahl. Jeder Sensor hat einen festen Platz:

  | L2 | L1 | M | R1 | R2 |
  |---|---|---|---|---|
  | 2 | 1 | 0 | −1 | −2 |

  - Der Block liefert den **Mittelwert der Plätze aller Sensoren, die die Linie sehen**.
    Beispiele von Martin: M = 0, M+L1 = 0,5, L1 = 1, L1+L2 = 1,5, L2 = 2, M+R1 = −0,5.
  - Positiv heißt „Linie liegt links“, negativ heißt „rechts“.
  - **Sieht kein Sensor die Linie, liefert er 100** (Martin).
  - Breites Klebeband (L1+M+R1) ergibt 0, also Mitte. Das ist gewollt. Eine Kreuzung mit
    allen fünf ergibt ebenfalls 0.
  - Grundlage ist das Status-Byte, also die Schwarz/Weiß-Grenze der Platine nach der
    Kalibrierung mit der Calc-Taste. *(Meine Wahl.)*
- Zweck: Die Teams bauen damit auf dem micro:bit eine eigene Linienverfolgung. Entweder mit
  Wenn-dann-Regeln aus den Einzelsensoren oder als Rechnung, etwa
  „fahre links 40 − 20 × Linienlage, rechts 40 + 20 × Linienlage“ (Vorzeichen am Gerät prüfen).

### Maqueen · Gruppe „Lichter“ (die vier RGB-LEDs unten)

- „setze Licht [1/2/3/4/alle] auf Farbe …“ mit derselben Farbauswahl wie in MakeCode.
- „Farbe rot … grün … blau …“ (0–255) als Wertblock.
- „Helligkeit …“ und „alle Lichter aus“.
- **Kein Pin zum Auswählen.** V3 nimmt P1, V2 P15. Welcher gilt, entscheidet der Startblock
  („starte Maqueen“ oder „starte Maqueen V2“). *(Meine Wahl. Ohne Startblock gilt V3.)*
- Welche Nummer welche LED ist, legt der Bauende am Gerät fest und schreibt es in die Hilfe.

### Maqueen · Gruppe „V2“

Nur, was der V2 kann. Doppelte Blöcke sind ausdrücklich erlaubt (Martin).

- „starte Maqueen V2“ (ohne Reset-Register, falls der V2 es nicht kennt; am Gerät prüfen).
- Motoren wie beim V3 (dieselben Register).
- „rote LED [links/rechts/beide] an/aus“ (0x0B/0x0C), diesmal richtig herum.
- „Ultraschall-Abstand in cm“ (TRIG P13, ECHO P14).
- Die Liniengruppe und die Lichtergruppe gelten auch für den V2.
- Es gibt **keine** Firmware-Linienverfolgung, keine Kreuzungsregeln, kein PID und keinen
  LiDAR.

### LiDAR

- **„LiDAR einschalten“** in `beim Start` (Martin). Erst danach läuft etwas. Ohne diesen Block
  liefern alle LiDAR-Blöcke den Fehlerwert, und auf einem Roboter ohne LiDAR passiert sonst
  nichts.
- Danach fragt die Erweiterung den Sensor **im Hintergrund** dauernd ab (Ausweichmodus 4×4).
  Die Blöcke geben sofort den letzten Wert zurück (Martin: im Workshop war die Schleife sonst
  zu langsam).
- **„Abstand [vorne/links/rechts] in mm“.** Das braucht Station 4 und 5 (`< 200`).
- **„Ausweichrichtung“** (links/rechts/frei).
- **„Ausweich-Abstand auf … mm“** (100–500, Hinweis: am Maqueen höchstens 200).
- **Kein Hängen:** Kurze Zeitlimits. Antwortet der Sensor nicht, kommt der Fehlerwert. Welcher
  Wert das ist, wählt der Bauende und schreibt ihn in die Hilfe. Wichtig: Ein Fehlerwert darf
  in `Abstand vorne < 200` nicht als „Hindernis“ gelten.
- Die Adresse ist fest 0x33. Ein optionaler Parameter oder Block für andere DIP-Stellungen ist
  Wahl des Bauenden.

## Abnahme

1. Martin baut die Musterlösungen von Station 3, 4 und 5 (normal und Profi) aus
   `microbit/stations/*/README.md` mit der neuen Erweiterung nach. Sie laufen am Maqueen V3
   wie mit DFRobot, beim PID-Sprung jetzt ohne die 2000-ms-Krücke.
2. Eine selbst gebaute Linienverfolgung mit „Linienlage“ fährt den Teststreifen.
3. Im deutschen MakeCode ist kein englischer Text zu sehen (Blöcke, Auswahlwerte, Kategorien,
   Gruppen, Hilfe-Tooltips). Im englischen MakeCode ist kein deutscher Text zu sehen.
4. Mit Netz einmal geladen, dann ohne Netz: Ein Projekt mit der Erweiterung kompiliert und
   flasht.
5. Ein Roboter ohne LiDAR: Ein Programm ohne „LiDAR einschalten“ läuft, und kein Block
   blockiert.
6. Ein Maqueen V2, falls einer da ist: Motoren, Linie, Lichter (P15), rote LEDs, Ultraschall.

Was ohne Gerät prüfbar ist, wird automatisch geprüft: Übersetzungsvollständigkeit, Linienlage
für alle 32 Sensorkombinationen, Umrechnung von Prozent auf Motorwerte.

## Entscheidungen aus der Prüfung (meine Wahl, Martin prüft beim Lesen)

- **Gerätetests macht Martin.** Der Bauende hat keinen Roboter. Alles, was „am Gerät
  prüfen“ heißt, kommt gebündelt in ein Testprogramm pro Bereich, mit kurzer Checkliste. Bis
  Martins Antwort da ist, gelten vorläufige Werte, die im Code als vorläufig markiert sind.
  Betroffen sind: Prozent-Umrechnung und tote Zone, Nummern der LEDs, PID-Warten, Reset beim V2,
  Vorzeichen im Linienlage-Beispiel, LiDAR-Startzeit, Drehrichtung von „drehe … Grad“.
- **Neben DFRobot heißt: im selben Projekt kompilieren und flashen.** Beide Erweiterungen
  gleichzeitig am selben Roboter zu benutzen, wird nicht unterstützt. Für die LEDs nimmt der
  Bauende entweder genau die Version, die DFRobot festlegt (`ws2812b#v0.1.2`), oder einen Weg
  ohne diese Abhängigkeit, damit MakeCode keinen Versionskonflikt meldet. Beides muss offline
  laufen.
- **„LiDAR einschalten“ kehrt sofort zurück.** Die Hintergrundschleife wartet die Startzeit
  des Sensors ab, setzt den Modus und versucht es ohne Ausgabe immer wieder, falls kein Sensor
  antwortet. Bis der erste Wert da ist, liefern die Abstandsblöcke den Fehlerwert. Die Hilfe
  zu „LiDAR einschalten“ sagt das.
- **PID-Warten:** Vor jeder Abfrage wird der Register-Index 87 neu geschrieben. DFRobot
  schreibt ihn nur einmal, und vermutlich ist das die eigentliche Ursache des Fehlers. Dazu
  kommt das Warten auf 1 und danach auf 0, mit Zeitlimit.

## Dem Bauenden überlassen

Dateiaufteilung, interne Namen, Testaufbau, Wortlaut der Hilfetexte, Reihenfolge und Gewichte
der Blöcke, Icon, Versionierung (Start mit v0.1.0) und ob das Repo per `pxt` oder per Hand
gebaut wird.

## Später

- Infrarot-Fernbedienung (NEC, P16; Decoder in `francor-maqueen-plus/src/nec.rs`).
- Workshop-Seite auf die neue Erweiterung umstellen: Drehbücher, Karten, Musterlösungen,
  Handbuch, `vorlage.py`, Regel 3 (`.b-gp` entfällt), CLAUDE.md.
- Eventuell schnelle Display-Blöcke als eigene, kleine Erweiterung.
