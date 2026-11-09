# Parcours first: ab dem Roboter nur, was der Grand Prix braucht

Entwurf vom 09.11.2026. Auslöser: Rückmeldung aus dem Workshop (Martin, 07. und 09.11.2026):

> Zu viel Text. Es gibt Aufgaben, die für den Parcours nutzlos sind, zum Beispiel die Räder
> drehen zu lassen. Es sollte nur Zeug vorgestellt werden, das für die Abschlussprüfung
> notwendig ist. Wir lassen den Roboter ein Quadrat über den manuellen Modus fahren und
> verwenden dann einfach Line Following und benötigen die Befehle nicht mehr.

Und die Einschränkung dazu (Martin, 09.11.2026): An den Stationen ohne Roboter, nur mit
micro:bit, bleiben Neigungssensor und Schütteln, um den micro:bit kennenzulernen. Die
Parcours-Regel gilt für die Abschnitte, die zum Roboter gehören.

Status: Entwurf, wartet auf Martins Freigabe. Die mit **(mein Vorschlag)** markierten
Entscheidungen sind Vorschläge von Claude, nicht von Martin bestätigt.

## Absicht

Der Workshop hat zwei Hälften. Die erste (Station 0 bis 2) macht mit dem micro:bit vertraut:
Hier darf gespielt werden, Neigung, Schütteln, Würfel bleiben. Die zweite Hälfte (ab dem
Moment, in dem der micro:bit in den Roboter kommt) ist Vorbereitung auf den Grand Prix. Jede
Roboter-Station darf nur noch das üben, was im Grand-Prix-Programm vorkommt. Alles andere
fliegt raus, auch wenn es hübsch ist. Dazu wird die ganze Seite kürzer: weniger Absätze,
weniger Kästen, ein Textbudget je Station.

Warum: Die Schüler haben 120 Minuten. Jede Minute mit Motorblöcken, Drehungen oder Quadraten
fehlt am Ende beim Rennen, und die Schüler merken selbst, dass sie das Gelernte im Rennen nie
wiedersehen. Das demotiviert mehr als es hilft.

## Was das Grand-Prix-Programm braucht

Rückwärts aus `microbit/stations/06-grand-prix/loesung.js` und `loesung-profi.js` gelesen.
Das ist die vollständige Liste der Blöcke und Handgriffe, die vorher geübt sein müssen:

| Block oder Handgriff | Heute geübt in | Künftig geübt in |
|---|---|---|
| MakeCode öffnen, Block ziehen, Zahl ändern, löschen | St. 1 | St. 1 |
| Herunterladen, Gerät koppeln, `.hex` ziehen | St. 1 | St. 1 |
| `beim Start` (einmal) und `dauerhaft` (ohne Ende) | St. 1 | St. 1 |
| `pausiere (ms)`, `Bildschirminhalt löschen` | St. 1 | St. 1 |
| `wenn Knopf A geklickt`, `wenn Knopf B geklickt` | St. 2 | St. 2 |
| `zeige Zahl` | St. 2 (Würfel) | St. 2 (Würfel) |
| Vorlage öffnen, micro:bit einstecken, beide Schalter | St. 3 | St. 3 |
| `initialisiere Maqueen Plus V2`, X blinkt / Haken | St. 3 | St. 3 |
| `Line patrolling ON/OFF`, `Line Following Settings Speed` | St. 4 | St. 3 |
| `RGB Car Lights All color …` | St. 4 (Blinken) | St. 3 (Startampel) |
| Laser initialisieren, `Hindernisvermeidungsdaten abrufen` | St. 5 | St. 4 |
| `wenn … dann` mit Vergleich `Entfernung Vorne (mm) < 200` | St. 5 | St. 4 |
| Kreuzungsblöcke, Grand-Prix-Blöcke, `spiele Melodie` | St. 6 | St. 5 |
| Nur Profis: Variable, `wenn … dann … ansonsten`, `PID Distance Control` | St. 5 / St. 6 | St. 5 (Profi-Teil) |

Der Laser-Stopp im Grand Prix ist `Line patrolling OFF`, kein Motorblock. Die Lösung enthält
keinen einzigen `steuere`- oder `stop`-Block, keine Schleife und keinen Ton außer der Melodie.

## Was bleibt (micro:bit-Hälfte)

- **Station 0 Boxenstopp:** wie heute, Text halbiert.
- **Station 1 Erster Kontakt:** wie heute (Herz blinkt, flashen), Text gekürzt.
- **Station 2 micro:bit allein:** alle Aufgaben bleiben: `zeige LEDs`, Knopf A/B, Logo nach
  oben/unten, Schütteln, Würfel als Team-Challenge. Der Text schrumpft (Kästen „Warum das
  clever ist“ und „Der wichtigste Satz des Workshops“ werden auf je einen Satz gekürzt oder
  gehen ins Handbuch).

### Der micro:bit-Simulator der Seite kommt weg (Martin, 09.11.2026: „Streichen“)

Rückmeldung (Martin, 09.11.2026): Der Simulator war verwirrend. Die Knöpfe oben wurden nicht
gefunden, der Sinn hat sich nicht erschlossen. Ursache im Aufbau: Die drei Reiter „1 · Zeichnen /
2 · Knöpfe / 3 · Neigen“ sitzen klein in der Kopfzeile des Kastens, die gezeichneten Knöpfe A
und B reagieren nur im Reiter 2, der Regler nur im Reiter 3. Dazu steht in MakeCode direkt
neben den Blöcken bereits ein echter Simulator, der genau dasselbe kann: A und B drücken,
Neigen mit der Maus über der Platine, ein Knopf „SHAKE“ erscheint, sobald `wenn geschüttelt`
im Programm ist. Zwei Simulatoren nebeneinander erklären sich nicht.

Deshalb: Der Simulator-Kasten in Station 2 wird gestrichen, samt Code in `app.js`
(Abschnitt micro:bit SIMULATOR, bis auf `PAT` und `nestStack()`, die die Blockbilder auf der
Seite brauchen) und den Klassen in `styles.css`. Station 2 verweist stattdessen auf den
MakeCode-Simulator („links neben den Blöcken“) und auf das echte Gerät. Den einen Gedanken,
den unser Simulator besser zeigte als MakeCode, die Zahl y gegen die Grenze 200, übernimmt das
echte Gerät: Schritt 3 bekommt als kleines Extra den Block `zeige Zahl Beschleunigung (mg) y`
in `dauerhaft`. Die Schüler kippen den micro:bit in der Hand und sehen die Zahl laufen. Das
ist die Tabelle „flach ≈ 0, gekippt über 200“ zum Anfassen, statt eines Reglers im Browser.

## Was wegfällt (Roboter-Hälfte)

Nichts davon kommt im Grand-Prix-Programm vor:

- **Station 3 Fahrschule, Fahrteil:** Parcours-Simulator, `steuere … Räder`,
  `stop beide Räder`, Drehung auf der Stelle, Quadrat-Challenge, `-mal wiederholen`,
  Zahlengefühl 0–255, Extra „So entsteht die Erweiterung“. Die Musterlösungen
  `loesung-quadrat.js` und `loesung-funktionen.js` und der Funktionen-Tipp im Handbuch gehen
  mit. Was bleibt: Vorlage öffnen, micro:bit einstecken, Schalter, `initialisiere`, Haken.
- **Station 4 Augen:** der `dauerhaft`-Block mit Rot-Blau-Blinken. Station 6 lässt ihn heute in
  Schritt 0 wieder löschen; an seine Stelle tritt die Startampel, die der Grand Prix braucht.
  Der Rest von Station 4 (Linientabelle, Kalibrieren, Knopf A → ON, Knopf B → OFF, Speed)
  wird mit dem Rest von Station 3 zu einer Station zusammengelegt.
- **Station 5 Reflexe:** Bremsassistent mit Motorblöcken, `ansonsten`, `SET PIN P1 RGB`,
  `setze die Helligkeit`, `oder`-Block, Pausenknopf mit Variable als Pflicht,
  Staubsauger-Bonus, Extra zum `spiele Ton`. Was bleibt: Laser einschalten, Daten abrufen,
  `wenn Entfernung Vorne < 200 dann Line patrolling OFF`, im Projekt „Linie“.
- **Station 6 Grand Prix:** Schritt 0 (Blinken löschen) und der Abschnitt Startampel, weil
  beides schon in der neuen Station 3 richtig steht. Der Absatz „Wo das wirklich fährt“ geht
  ins Handbuch.
- **Parcours-Simulator:** wird aus `app.js` und `styles.css` entfernt (Abschnitt SIMULATOR,
  `LEVELS`, Canvas, Bausteine). Er gehört zum Fahrteil mit Motorblöcken, der wegfällt.

## Die neue Stationsfolge

Sechs Stationen statt sieben: Fahrschule und Augen werden eine Station, weil die Fahrschule
ohne Motorblöcke nur noch aus Einstecken und Haken besteht **(mein Vorschlag)**.

| Nr | Datei | Min | Kern | Abzeichen |
|---|---|---|---|---|
| 0 | 00-boxenstopp | 5 | Regelkreis, Bauteile am Maqueen | Rookie |
| 1 | 01-erster-kontakt | 15 | MakeCode, Herz blinkt (`beim Start`/`dauerhaft`), flashen | Ersteinschalter |
| 2 | 02-microbit-allein | 15 | LEDs, Knöpfe, Neigung, Schütteln, Würfel; Sensor = Zahl | Pixelkünstler |
| 3 | 03-fahrschule | 20 | Vorlage, einstecken, Schalter, Haken; dann Linie: Knopf A → Startampel + `Line patrolling ON`, Knopf B → `OFF`, `Speed`; Projekt heißt „Linie“ | Spurhalter |
| 4 | 04-reflexe | 10 | Im Projekt Linie: Laser-Stopp in `dauerhaft`, `wenn Entfernung Vorne < 200 dann Line patrolling OFF` und rotes Licht | Bremsassistent |
| 5 | 05-grand-prix | 40 | Strecke lesen, Kreuzungen, Kreuzung 1 umstellen, Tempo-Zone, Melodie, Läufe auf Zeit; Profi: Pro-Ziel mit Variable und PID | Champion |
| – | Puffer | 15 | wie heute | – |

Summe 105 + 15 = 120, Regel 5 aus `CLAUDE.md` bleibt unverändert. Die Minuten sind mein
Vorschlag **(mein Vorschlag)**: Station 1 wächst von 13 auf 15, weil dort das erste Flashen
hakt; der Grand Prix wächst von 30 auf 40 und nimmt die frei gewordene Zeit. Das Abzeichen
„Fahrlehrer“ entfällt, „Spurhalter“ gehört zur zusammengelegten Station 3.

Roter Faden bleibt wie heute: Station 1 lehrt „einmal“ gegen „ohne Ende“, Station 2 lehrt
„Ereignis“ und „ein Sensor liefert Zahlen, die Grenze ist 200“, Station 3 greift beides an der
Linientabelle auf (weiß ≈ 3800, schwarz ≈ 2700) und lässt den Roboter zum ersten Mal selbst
fahren, Station 4 setzt die erste eigene Grenze (200 mm), Station 5 baut alles zusammen.

Das Programm aus Station 3 neu ist bereits der Anfang des Grand-Prix-Programms:

```
beim Start
  initialisiere Maqueen Plus V2
wenn Knopf A geklickt
  RGB Car Lights All color red
  pausiere (ms) 1000
  RGB Car Lights All color yellow
  pausiere (ms) 1000
  RGB Car Lights All color green
  Line Following Settings Speed 1
  Line patrolling ON
wenn Knopf B geklickt
  Line patrolling OFF
```

Station 4 hängt den Laser an:

```
beim Start
  …
  Laser-Entfernungsmesser I2C-Adresse 0x33 Matrix-Modus Hindernisvermeidung initialisieren
dauerhaft
  Hindernisvermeidungsdaten abrufen
  wenn Hindernisvermeidungsmodus Entfernungsmessung Vorne (mm) < 200 dann
    Line patrolling OFF
    RGB Car Lights All color red
```

Station 5 schiebt die Kreuzungsregeln und den Zähler-Reset in Knopf A vor die Ampel. Die
Teams bauen also ab Station 3 durchgehend an einem Projekt.

Die Musterlösung `loesung.js` des Grand Prix wächst dafür um zwei Zeilen, die heute nur auf
der Seite vorausgesetzt werden: `wenn Knopf B geklickt → Line patrolling OFF` (Not-Aus) und
das rote Licht beim Laser-Stopp. Beide Blöcke sind am Gerät bestätigt (08.10.2026), Regel 6
ist damit nicht berührt.

## Textbudget

Zählung: Tags entfernen, alle Wörter zählen, die übrig bleiben. Blockbeschriftungen,
Quiz-Antworten und SVG-Beschriftungen zählen mit. Das ist eine einzige, stumpfe Regel, die
`build.py` ohne Klassenwissen anwenden kann. Heute ergibt sie 271 bis 1103 Wörter je Station.
Budget **(mein Vorschlag)**:

| Station | Wörter heute | Budget neu |
|---|---|---|
| 0 | 271 | 200 |
| 1 | 423 | 350 |
| 2 | 798 | 550 |
| 3 (neu, aus 3 + 4) | 829 + 572 | 500 |
| 4 (neu, aus 5) | 675 | 300 |
| 5 (neu, aus 6) | 1103 | 800 |

Station 5 trägt heute rund 175 Wörter allein in Blöcken; das Budget lässt ihr also etwa
600 Wörter Prosa, etwa zwei Drittel von heute.

Schreibregeln, die das erreichen:

- Kein Einleitungsabsatz über einen Satz hinaus. Der Titel sagt, worum es geht.
- Jeder Schritt: ein Satz Anweisung, der Blockstapel, eine Zeile „Testen“.
- Keine „Warum das clever ist“-Kästen und keine Technikvergleiche (Lagerroboter, Marsrover,
  selbstfahrende Autos). Was die Betreuenden davon erzählen sollen, steht im Handbuch.
- „Wenn es klemmt“ höchstens zwei Punkte je Station, der Rest ins Handbuch unter Störungen.
- Kontrollfragen bleiben, eine je Station, höchstens drei Antworten.
- `build.py` prüft das Budget je Station und bricht ab, wenn es gerissen wird
  (`TEXTBUDGET`, Zählung wie oben).

## Was sich außerhalb der Stationen ändert

Alles, was heute an sieben Stationen hängt:

- `website/src/app.js`: `STATIONS`-Array auf sechs Einträge, Parcours-Simulator raus,
  micro:bit-Simulator raus (`PAT` und `nestStack()` bleiben).
- `website/src/styles.css`: Simulator-Klassen beider Simulatoren raus.
- `website/src/stations/`: `03-fahrschule.html` und `04-augen.html` werden
  `03-fahrschule.html` (Einsetz-Animation `#mqinsert` bleibt darin), `05-reflexe.html` →
  `04-reflexe.html`, `06-grand-prix.html` → `05-grand-prix.html`, `data-st` 0–5.
- `website/build.py`: Reihenfolgeprüfung läuft weiter; neu `TEXTBUDGET`.
- `website/test/smoke.cjs`: „sieben Stationen“ wird „sechs“, die Tests beider Simulatoren
  entfallen (dafür: Station 2 nennt den MakeCode-Simulator und zeigt den Block
  `zeige Zahl Beschleunigung`); die Prüfungen zu Station 5 (`wenn/sonst`-Fächer,
  Variablenfarbe) ziehen in den Profi-Teil von Station 5 neu um; Stationsnummern in den
  Selektoren nachziehen.
- `website/src/handbuch.html`: Zeitplan auf sechs Zeilen plus Puffer; Absatz zu Funktionen und
  Quadrat in der Fahrschule raus (der „Reset-Fallstrick“ im Grand-Prix-Abschnitt darf die
  Funktion weiter empfehlen, er richtet sich an Betreuende); „Aufbocken“ bleibt als
  Sicherheitsregel in Material und `sicherheit.html`, weil nicht belegt ist, was die Firmware
  bei `Line patrolling ON` ohne Linie tut; neu in der Materialliste je Tisch ein
  **Teststreifen**: ein Blatt A3 oder ein Stück Matte mit 60 cm geradem Isolierband, damit
  Station 3 und 4 am Tisch getestet werden und nicht an der Matte Schlange stehen; die
  herausgenommenen Erklärungen (Lagerroboter, Bremsassistent im Auto, 33 Millionen Bilder)
  kommen als kurzer Abschnitt „Was ihr nebenbei erzählen könnt“ hinein; „Extras für schnelle
  Teams“ nennt nur noch Würfel (Station 2) und den Profi-Teil des Grand Prix.
- `microbit/stations/`: `03-fahrschule/` verliert `loesung-quadrat.js`,
  `loesung-funktionen.js`, `bloecke.png` und bekommt die Lösung aus `04-augen/` (Programm
  oben); `04-augen/` entfällt, `05-reflexe/` → `04-reflexe/`, `06-grand-prix/` →
  `05-grand-prix/`. Die README der Grand-Prix-Mappe nennt Stationsnummern (Station 4,
  Station 5) und muss nachgezogen werden.
- `CLAUDE.md`: Stationstabelle, Regel 1 (Knopf „Neues Roboter-Projekt“ Station 3 und 4, als
  Rückfall 5), Abschnitt „Was der Simulator-Code kann“ (beide Simulator-Absätze raus, Block-Optik
  bleibt), Roter Faden,
  offener Punkt „Station 2 auf 12 Min kürzen“ erledigt, gemessener Wert „ms für 90°“ wird
  nicht mehr gebraucht.
- `docs/02-offline-und-trockenlauf.md`: Blockliste bereinigen (Motor, Schleife raus),
  Stationsnummern nachziehen, neuer Prüfpunkt: Was tut der Maqueen bei `Line patrolling ON`
  ohne Linie?

Nicht betroffen: Strecke, Klebeplan, Druckblatt, Bibliothek „Grand Prix“, Vorlage, Stückliste,
Sicherheitsfenster, Messebildschirm, QR-Handzettel, das MakeCode-Tutorial zu Station 1.

## Ziele

- Jeder Block, den eine Roboter-Station (3 bis 5) zeigt, steht auch im Grand-Prix-Programm
  (normal oder Profi).
- Ab Station 3 arbeiten die Teams in einem einzigen Projekt „Linie“ weiter.
- Jede Station hält ihr Textbudget; `build.py` erzwingt es.
- `python3 build.py && npm test` grün, Offline-Datei neu gebaut.

## Nicht-Ziele

- Keine Änderung an Strecke, Zählnummern, Bibliothek oder Vorlage.
- Keine inhaltliche Änderung an Station 0 bis 2 über das Kürzen des Textes hinaus.
- Kein neues Tutorial, keine Fotos, kein neues Bildmaterial.
- Keine Änderung der Workshop-Gesamtdauer (120 Minuten) oder des Puffers (15).

## Anti-Ziele

- Eine Station, die nur Text ohne eigenen Blockstapel ist.
- Ein Block in Station 3 bis 5, der eine Fähigkeit lehrt, die der Grand Prix nicht braucht
  (Motor steuern, Schleife, Ton).
- Erklärungen für Betreuende in den Stationen.

## Festlegungen nach der Gegenlese

Ein frischer Agent hat die erste Fassung als Umsetzender gelesen. Diese Punkte habe ich
daraufhin selbst entschieden; Martin kann jeden kippen:

1. **Aufbocken bleibt, Teststreifen kommt dazu** (siehe Handbuch oben). Ob der Maqueen bei
   `Line patrolling ON` ohne Linie losfährt, ist nicht belegt; der Trockenlauf klärt es.
2. **Musterlösung wächst** um Knopf B (Not-Aus) und rotes Licht beim Laser-Stopp, damit
   Seite und Lösung in beide Richtungen übereinstimmen.
3. **Profi-Teil in Station 5** führt die Variable `gesprungen` mit einem kleinen Blockstapel
   ein (`setze gesprungen auf wahr`, Abfrage im `dauerhaft`); die Funktion `regelnSetzen`
   bleibt nur in `loesung-profi.js` und im Handbuch, auf der Seite wird sie nicht gelehrt.
4. **Textbudget** zählt stumpf alle Wörter nach dem Entfernen der Tags (siehe oben).

## Dem Umsetzenden überlassen

- Wortlaut aller Stationstexte innerhalb des Budgets und der Schreibregeln.
- Wie die Kontrollfragen der zusammengelegten Station 3 verschmolzen werden.
- Reihenfolge der Commits (sinnvoll: erst Stationen und Umbenennen, dann Simulator, dann
  Handbuch und Docs).

## Offen für Martin

1. Minutenverteilung 5 / 15 / 15 / 20 / 10 / 40 plus 15 Puffer?
2. Freigabe zum Bauen.

Entschieden: Station 0 bis 2 bleiben inhaltlich (Martin, 09.11.2026); micro:bit-Simulator der
Seite wird gestrichen (Martin, 09.11.2026).
