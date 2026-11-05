# Grand Prix: Parcours, Aufgaben und Bibliothek — Entwurf

Stand 04.11.2026. Ergebnis der Brainstorming-Sitzung mit Martin (03./04.11.2026).
Ersetzt die bisherige Station 6 (Tuning-Werkstatt + Rennen).

## Absicht

Station 6 soll der Abschluss sein, in dem **alles wiederkommt, was die Teams
vorher gelernt haben**: Lichter und Knöpfe (Station 2), Motoren (3),
Linienverfolgung (4), Laser und Bedingung (5). Bisher war Station 6 eine
Tuning-Werkstatt mit drei losen Ideen; der Lauf war ohne echte Aufgabe.

Neu: Die Teams sehen eine **Skizze der Strecke**, planen vorher (für Ausprobieren
ist keine Zeit), stellen die Kreuzungsregeln der Maqueen-Firmware passend ein und
fahren einen Lauf auf Zeit. Am Ziel liegen Gummibärchen.

**Kein harter Wettbewerb.** Alle Teams bekommen die Gummibärchen; die Zeit wird
nur gestoppt, um zu vergleichen. Es gibt keine Rangliste und keine Pokale.

## Ziele

- Jedes normale Team schafft den Pflichtteil in 30 Minuten und hört am Ziel seine
  Siegesmelodie.
- Die Teams müssen **aus Sicht des Roboters** denken: Was für eine Kreuzung ist das
  für ihn, und was soll er dort tun?
- Schnelle Teams haben eine Profi-Stufe, die sichtbar „Level 2“ ist (Pro-Ziel
  hinter einer Lücke).

## Nicht-Ziele

- Kein Rennen gegen andere Teams, keine Pokale („schnellste Runde“, „schönster
  Auftritt“ fallen weg).
- Kein Anhalten-und-Weiterfahren am Hindernis im Pflichtteil (gestrichen).
- Kein Boxenstopp, kein Discomodus.
- Keine Schleifen, Umwege oder Rätsel mit mehreren gültigen Routen. Martin hat
  Varianten mit Umwegen verworfen, weil sie zu kompliziert wurden.

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Ein normales Team kommt nicht ins Ziel, weil der Pflichtteil zu viel ist.
- Die Bibliothek nimmt den Teams den Reset-Fallstrick ab (siehe unten). Der soll
  bleiben.
- Die Skizze lässt sich falsch lesen. Im ersten Entwurf wurden die Zielpunkte für
  Kreuzungen gehalten. Nummern und Typen müssen eindeutig sein.

## Rahmen

- **Station 6 dauert 30 Minuten** statt 15, inklusive Planen. Alle anderen
  Stationen behalten ihre Minuten. **Der Workshop dauert 120 Minuten** (Martin,
  04.11.2026): 105 Minuten Stationen (5 + 13 + 15 + 14 + 18 + 10 + 30) plus
  **15 Minuten Puffer** ohne eigene Station. Regel 5 der CLAUDE.md („90 Minuten
  exakt“) wird zu „120 Minuten = 105 Stationen + 15 Puffer“. Betroffen:
  - Eyebrow in `06-grand-prix.html` und `STATIONS` in `app.js` (`m:"30 Min"`)
  - `TOTAL` in `app.js` (Timer 120:00, auch „Neues Team“), Anzeige in `topbar.html`
  - die Prüfung in `build.py`: Stationsminuten = 105, Gesamtzeit = 105 + Puffer = 120
  - der Zeitplan im Handbuch: neue Zeiten ab Station 6, Überschrift „90-Minuten-Slot“
    und eine eigene Zeile „Puffer, 15 Min“
  - die CLAUDE.md (Titel „90-Minuten“, Regel 5, Stationstabelle, Timer-Erwähnungen),
    der Kommentar „stellt wieder 90:00“ in `app.js`, `docs/02-offline-und-trockenlauf.md`
    und jede weitere Stelle mit „90 Minuten“
- **Station 5 (Reflexe) wird Pflicht** (Martin, 04.11.2026). Bisher war sie „Bonus,
  streichbar“. Station 6 setzt den Laser voraus. Anzupassen: CLAUDE.md
  (Stationstabelle, „Bonus, streichbar“), Handbuch (Zeitplan-Zeile „Bonus-Station:
  bei Zeitdruck überspringen“ und Hinweise für zu schnelle oder zu langsame
  Teams), `microbit/stations/05-reflexe/README.md` und das Eyebrow-Etikett „Bonus“ in
  `05-reflexe.html`. Die Staubsauger-Challenge innerhalb von Station 5 bleibt
  Bonus.
- Regeln 1–6 der CLAUDE.md gelten weiter (offline, eine Datei, nur Blöcke, deutsch
  Klasse 7, Blocktexte mit Handbuch gemeinsam ändern).

## Die Strecke

Weiße Matte 100 × 200 cm (hochkant), schwarzes Isolierband 19 mm. Martin hat die
Strecke am 03./04.11.2026 geklebt und gefahren. Statt gedruckter Kurven nimmt er
kurze schräge Stücke, und das klappt mit der Linienverfolgung. Die maßgebliche
Zeichnung ist die Skizze aus der Sitzung
([2026-11-04-grand-prix-parcours-skizze.html](2026-11-04-grand-prix-parcours-skizze.html), ein HTML-Fragment ohne Seitenrahmen). Martins eigener Aufbau hat
eine zusätzliche „Kreuzungs-Falle“, **final gilt die Skizze**.

Ungefähre Lage (x von links, y von oben, cm):

| Element | Lage | Hinweis |
|---|---|---|
| Start | (10, 186), fährt nach oben | lange Startgerade am linken Rand |
| Sackgasse oben | Startlinie läuft bis y ≈ 10 weiter, **Kiste** am Ende | wer an K1 geradeaus fährt |
| ① K1 | (10, 40) | Abzweig nach rechts → zweite Gerade x ≈ 36 nach unten. So tief, dass die Kiste der Sackgasse ≈ 30 cm entfernt ist und der Laser (< 200 mm) an K1 nicht auslöst (Martin, 04.11.2026) |
| ② Stummel | (36, 75), 10 cm Linie nach links, **Kiste** bei x 20–26 | Falle, ≈ 35 cm unter K1; Kiste ≥ 10 cm neben der Startgeraden |
| Unterer Bogen | y ≈ 147, x 36 → 52, dann x ≈ 52 hoch | |
| ③ Tempo-Schild | Querstrich über x ≈ 52 bei y ≈ 64, x 46–58, Papierschild „1“ daneben | ab hier Tempo 1 bis ins Ziel |
| Oberkante + Bauch | y ≈ 44 von x 52 bis 72, großer Bogen rechts herum bis y ≈ 147, zurück nach x ≈ 66 | die „Kurve“ |
| ④ Ziel-T | Stiel x ≈ 66 hoch bis y ≈ 51, Querbalken x 60–72 (≥ 8 cm Luft zu x = 52) | normales Ziel |
| Pro-Ziel | Strich x ≈ 66 von y ≈ 34 bis 12, **Kiste** am Ende. Der PID-Sprung (≈ 20 cm) führt über die Oberkante y = 44 hinweg; die Linie beginnt ≥ 10 cm darüber | nur Profis |

**Bauregeln** (Review 05.11.2026): Keine Kiste und kein Bandende näher als 10 cm
neben einer befahrenen Linie. Sonst streift der Roboter (≈ 11 cm breit, äußere
Sensoren ≈ 4 cm neben der Mitte) die Kiste oder zählt ein Bandende als Abzweig.

**Sackgassen sind Linien, die an einer Kiste enden.** Es sind keine T-Kreuzungen
mehr (Martin, 04.11.2026). Der Roboter hält per Laser davor. Das einzige T auf der
Strecke ist das Ziel.

### Zählfolge (Normalweg)

| Nr. | Stelle | Typ aus Sicht des Roboters | Programm |
|---|---|---|---|
| 1 | K1 | Abzweig rechts + geradeaus | `At Right Turn and Straight Intersection Right`, im Ereignis „Kreuzung 1“ auf `Straight` umstellen |
| 2 | Stummel | Abzweig rechts + geradeaus | (schon `Straight`) geradeaus vorbei |
| 3 | Tempo-Schild | Kreuzung (+) | `At Crossroads Straight`, im Ereignis „Kreuzung 3“ `Line Following Settings Speed 1` |
| 4 | Ziel | T | `At T-junction Stop`, im Ereignis „Kreuzung 4“ Siegesmelodie |

Was bei Fehlern passiert:
- An K1 `Straight` → Sackgasse oben, Kiste. Abbruch, neuer Versuch.
  „Lauf vorbei“ heißt immer: Das Team **trägt den Roboter zurück an den Start**,
  neuer Versuch, die Zeit läuft neu (Martin, 04.11.2026).
- Nicht umgestellt → biegt in den Stummel, Kiste. Abbruch.
- Kreuzung (+) auf `Stop` → bleibt am Tempo-Schild stehen.
- Falsche Nummer im Ereignis → keine Melodie oder kein Tempowechsel.
- Im Bogen zu schnell → „geblitzt“, der Betreuer gibt +3 s.

## Aufgaben in Station 6

**Wo die Regeln stehen:** Die vier Kreuzungsregeln, `Line Following Settings Speed`
und `setze Kreuzungszähler zurück` stehen in `wenn Knopf A geklickt`, **vor**
`Line patrolling ON`, nicht in `beim Start`. Jeder Druck auf A ist ein sauberer
Neustart, auch nach einem Fehlversuch, bei dem der Laser `OFF` geschaltet hat.
In `beim Start` stehen nur `initialisiere Maqueen Plus V2` und die
Laser-Initialisierung.

**Schritt 0:** Den `dauerhaft`-Block mit dem Rot-Blau-Blinken aus Station 4
löschen. Sonst überschreibt er die Ampel und bremst die Laserabfrage aus.

**Pflicht für alle**, in dieser Reihenfolge auf der Seite, damit der erste Lauf
früh kommt (Ziel: Minute 10–12):
1. **Kreuzungen planen und einstellen** nach Skizze, aus Sicht des Roboters, in
   Knopf A (siehe oben). Alle vier Regeln setzen, auch die, die auf dem Normalweg
   nicht vorkommen: Kreuzung `Straight`, Abzweig links `Straight`, Abzweig rechts
   `Right`, T `Stop`.
2. **An K1 umstellen** mit `wenn Kreuzung Nummer 1 erreicht` (Bibliothek).
3. **Siegesmelodie** am Ziel (Kreuzung 4). → **Erster Lauf.**
4. **Tempo-Zone:** Ab Kreuzung 3 mit Tempo 1 fahren und zur Kontrolle `zeige Zahl 1`.
   Der Betreuer sieht am Schild, ob die Zone geschaltet hat. Keine „1“ = geblitzt,
   +3 s.
5. **Startampel:** In Knopf A vor `ON`: RGB rot, gelb, grün.
6. **Am Hindernis anhalten:** Laser-Initialisierung in `beim Start`, in `dauerhaft`
   Daten holen und `wenn Entfernung < 200 → Line patrolling OFF`. Nur anhalten,
   nicht weiterfahren. Auf dem richtigen Weg wird er nie gebraucht, deshalb steht
   er zuletzt.
7. **Langsam starten:** `Line Following Settings Speed` zuerst 1 oder 2, höher
   erst, wenn der Lauf sauber geklappt hat. 5 nur, wenn alles funktioniert.

**Minute-15-Regel** (Handbuch): Wer bis dahin keinen ersten Lauf hatte, bekommt
vom Betreuer Hilfe mit der Musterlösung für die Schritte 1–3.

**Profi (schnelle Teams):**
- **Pro-Ziel:** Am T (Kreuzung 4) kurz warten (≈ 500 ms, bis er steht), per Laser
  prüfen, dass der Weg frei ist, dann `Line patrolling OFF`, mit
  `PID Distance Control` ≈ 20 cm geradeaus über die Lücke, Linienverfolgung wieder
  an, bis zur Kiste am Pro-Ziel.
- **Blinker:** vor dem Abbiegen leuchtet das passende Licht.

### Der Reset-Fallstrick (bewusst)

`Line patrolling OFF` löscht in der Firmware alle Kreuzungsregeln (Martin am
Gerät, 03.11.2026). Nach `ON` gelten Standardregeln. Wer im Profi-Teil nach dem
PID-Sprung nur `ON` schaltet, hat seine Regeln verloren. Das ist **gewollt**. Die
Teams sollen hineinlaufen und es lösen, indem sie die Regeln vor jedem `ON` neu
setzen, am besten in einer Funktion. Auf der Stationsseite steht dazu höchstens
ein aufklappbarer Tipp. Ins Handbuch kommt für die Betreuenden: woran man es
erkennt (Roboter ignoriert nach einem Halt seine Regeln) und welche Frage
weiterhilft („Was passiert mit euren Einstellungen, wenn ihr die
Linienverfolgung ausschaltet?“).

Zweite Stufe davon, in Martins Testprogramm gesehen: Setzt die Funktion fest
`Right` für den Abzweig, schlägt nach einem Halt zwischen K1 und dem Stummel die
Falle wieder zu. Die Musterlösung macht es richtig (Regel abhängig von
`Kreuzungen gezählt`).

## Bibliothek „Grand Prix“

Eine `custom.ts` im MakeCode-Projekt, eigene Kategorie. Nur Kreuzungszählen,
**sonst nichts**, also auch kein Neu-Setzen der Regeln.

- `wenn Kreuzung Nummer (n) erreicht` (Ereignis, läuft parallel)
- `Kreuzungen gezählt` (Zahl)
- `setze Kreuzungszähler zurück`

`beiKreuzung` trägt `//% afterOnStart=true`. Sonst startet die Zählschleife vor
`initialisiere Maqueen Plus V2` und zählt während des Resets der Platine womöglich
einen Phantom-Treffer.

Technik: Hintergrundschleife fragt alle 20 ms `maqueenPlusV2.intersectionDetecting()`
ab. Gezählt wird der Wechsel 0 → ≠0, mit 300 ms Sperrzeit. Prototyp: `microbit/bibliothek/custom.ts`, von Martin am Gerät erfolgreich
genutzt (04.11.2026).

Farbe `#3C3C3C` (Graphit, wie die Zielflagge). Das ursprünglich gewählte Orange
`#E07A00` war praktisch gleich `.b-var{#E07000}` in `styles.css`, und diese Klasse
nutzt der Parcours-Simulator in `app.js` für „Licht an“. Graphit unterscheidet sich
von allen Farben in Regel 3. Neue Klasse `.b-gp{background:#3C3C3C}`; die Farbe
kommt in Regel 3 der CLAUDE.md.

**In die Vorlage:** `vorlage.py` nimmt die `custom.ts` in `files` und `pxt.json`
auf. Damit hat jedes Projekt ab Station 3 die Kategorie, auch das Projekt „Linie“
aus Station 4, in dem Station 6 weiterarbeitet (Martin, 04.11.2026: dass die
Kategorie schon vorher zu sehen ist, macht nichts; sie wird vor Station 6 nicht erklärt).

## Stationsseite und Ausdruck

- `06-grand-prix.html` wird neu geschrieben: Skizze der Strecke als Inline-SVG
  (wie die Maqueen-Figuren, mit festen Farben für Band und Matte). Dazu die
  Zählstellen nummeriert, **ohne Typ**: Den Typ aus Sicht des Roboters finden die Teams selbst heraus (Martin, 05.11.2026), der Pflicht-Teil als
  Schritte mit `.mcb`-Blöcken, der Profi-Teil abgesetzt, die Laufregeln (Start auf
  Stufe 1–2, Blitzer +3 s, Kiste = Lauf vorbei, alle bekommen Gummibärchen).
- Kein Emoji auf der Seite (Raspberry Pi OS zeigt oft Kästchen). Flagge und
  Kisten als Inline-SVG.
- Auf der Skizze sind Ziel und Pro-Ziel klar als **Ziel** beschriftet, nicht als
  Buchstaben, damit sie niemand für Kreuzungen hält.
- **A4-Blatt zum Drucken**, Maßstab 1:10 (Matte 100 × 200 mm, passt hochkant auf
  A4): als Teamskizze am Tisch und als Klebeplan für den Aufbau mit cm-Angaben.
- Handbuch: neuer Zeitplan, Aufbau der Strecke (Material, Kisten, Schild „1“),
  Fallstrick-Hinweis, Blitzer- und Gummibärchen-Regel.
- `microbit/stations/06-grand-prix/`: Musterlösung normal und Profi (`.hex`,
  `bloecke.png`, README mit Zählfolge).

## Material

Matte 100 × 200 cm; eine Rolle Isolierband 19 mm; drei Kisten als Hindernisse
(Sackgasse oben, Stummel, Pro-Ziel), schwer genug oder festgeklebt, damit ein
anfahrender Roboter sie nicht verschiebt; Papierschild „1“; Gummibärchen.

## Offen für den Trockenlauf

0. **Zählfahrt** beim Aufbau: Ein Programm mit `dauerhaft → zeige Zahl (Kreuzungen
   gezählt)` fährt die Strecke einmal ab. Die Nummern müssen 1–4 ergeben. Das kommt
   als fester Aufbauschritt ins Handbuch.

1. Wird jede Zählstelle genau einmal gezählt? Gilt das auch für den Querstrich mit
   nur ≈ 6 cm Armen und für das T direkt unter der Oberkante des Bogens (5–7 cm
   Abstand)?
2. Wirkt `Straight`, gesetzt im Ereignis „Kreuzung 1“, erst ab der nächsten
   Kreuzung und nicht schon an K1?
3. Wirkt `Line Following Settings Speed`, gesetzt während der Fahrt, sofort und
   ohne OFF/ON?
4. Taucht die Kiste am Stummel im Laserbild auf, wenn er geradeaus vorbeifährt?
5. Wird das Überfahren des T-Balkens mit PID (Linienverfolgung aus) als Kreuzung
   gezählt? Das ändert die Nummer für die Profis.
6. Mit Stufe 1 hielt der Roboter einmal nicht sauber am T. Vermutlich lag es am
   Reset-Fallstrick, nicht am Tempo. Nachprüfen.
7. Zeiten auf Stufe 1–5 messen, damit die Höchststufe auf der Seite stimmt.
8. Wie lange bleibt Register 61 an einer Kreuzung ≠ 0, und wie lange blockiert
   eine Laser-Abfrage? Ist die Abfrage länger, verpasst die Zählschleife Treffer,
   und das `dauerhaft` braucht eine Pause.
9. Hält der Akku 120 Minuten plus Aufbau? (`docs/02-offline-und-trockenlauf.md`,
   Block G, geht noch von 90 Minuten aus.)
10. Freiraum um die Matte: Der Laser sieht auch Füße und Taschen. Im Handbuch
    30 cm frei halten, Zuschauer nicht an die Kanten.

## Was der Umsetzende entscheidet

Gestaltung der Skizze und des A4-Blatts, Texte der Stationsseite (Regel 4),
genaue Aufteilung der 30 Minuten im Handbuch, Wahl der Siegesmelodie und der
Ampel-Pausen in der Musterlösung, Aufbau der Profi-Musterlösung.

## Entscheidungen, die ich getroffen habe (bitte prüfen)

- Die Siegesmelodie ist **Pflicht** (Martin: „sie spielen dann eine
  Siegesmelodie“), der Zieleinlauf-Jubel für Profis entfällt dadurch.
- Farbe der Bibliothek `#3C3C3C`.
- Der Puffer steht im Handbuch als **letzte Zeile** des Zeitplans (1:45–2:00), mit
  dem Hinweis, dass die Betreuenden ihn dort einsetzen, wo es hakt. Meist ist das
  beim Flashen (Station 1) oder im Grand Prix.
- **Gebaut wird jetzt** auf dem Branch `feature/grand-prix-parcours`. Nach `master`
  (und damit auf GitHub Pages) geht es erst nach dem Trockenlauf. Die Zählnummern
  stehen an **einer** Stelle (Stationsseite, Skizze und Musterlösung lesen dieselbe
  Tabelle bzw. werden gemeinsam geändert), weil der Trockenlauf sie noch
  verschieben kann. `.hex` und `bloecke.png` der Musterlösung entstehen erst nach
  dem Trockenlauf, wie im README vorgesehen.
- **A4-Blätter** sind eine eigene Datei `tools/grand-prix-druck.html`, die wie
  `tools/trockenlauf.html` nicht gebaut wird. Sie hat zwei Seiten: Teamskizze
  (ohne Maße, mit Nummern, Typen tragen die Teams in eine Tabelle ein) und Klebeplan (mit cm-Maßen, nur für
  Betreuende). Die Skizze in Station 6 ist dieselbe Zeichnung wie die Teamskizze.
