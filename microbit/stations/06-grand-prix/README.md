# Station 06 — Grand Prix

Lauf auf Zeit über die Grand-Prix-Strecke (Matte 100 × 200 cm, Skizze in Station 6 und in
`tools/grand-prix-druck.html`). Das Programm baut auf dem Projekt „Linie“ aus Station 4 auf
und braucht die Bibliothek „Grand Prix“ (`microbit/bibliothek/custom.ts`, steckt in der Vorlage).

Hier liegen:

- `loesung.js` (normal) und `loesung-profi.js` (Profi) — MakeCode-JavaScript, am 05.11.2026
  von Martin auf der Strecke gefahren. Einfügen: Vorlage öffnen, oben auf **JavaScript**
  umschalten, alles ersetzen, zurück auf **Blöcke**. Die Bibliothek „Grand Prix“ muss im
  Projekt sein, sonst gehen die Blöcke nicht.

Nach dem Trockenlauf kommen dazu:

- `loesung.hex` und `bloecke.png` (normal)
- `loesung-profi.hex` und `bloecke-profi.png` (Profi)

Erst danach, weil der Trockenlauf die Zählnummern und die Höchststufe noch verschieben kann
(siehe `docs/02-offline-und-trockenlauf.md`, Block H).

## Zählfolge (Normalweg, gilt bis zum Trockenlauf)

| Nr. | Stelle | Typ aus Sicht des Roboters | Regel |
|---|---|---|---|
| 1 | Abzweig von der Startgeraden (K1) | Abzweig rechts + geradeaus | `At Right Turn and Straight Intersection` `Right`; bei Kreuzung 1 auf `Straight` umstellen |
| 2 | Stummel mit Kiste | Abzweig rechts + geradeaus | steht schon auf `Straight` → geradeaus vorbei |
| 3 | Tempo-Schild (Querstrich) | Kreuzung (+) | `At Crossroads` `Straight`; bei Kreuzung 3 `Line Following Settings Speed 1` und `zeige Zahl 1` |
| 4 | Ziel | T | `At T-junction` `Stop`; bei Kreuzung 4 Siegesmelodie |

`At Left Turn and Straight Intersection` steht auf `Straight` und kommt auf dem Normalweg
nicht vor.

## Was die Musterlösung tut (normal)

- **beim Start:** `initialisiere Maqueen Plus V2`, dann den Laser initialisieren
  (I2C-Adresse 0x33, Matrix-Modus Hindernisvermeidung). Sonst nichts — die Regeln stehen in
  Knopf A.
- **wenn Knopf A geklickt:** `setze Kreuzungszähler zurück`, die vier Kreuzungsregeln
  (Kreuzung `Straight`, Abzweig links `Straight`, Abzweig rechts `Right`, T `Stop`),
  `Line Following Settings Speed 2`, Startampel (`RGB Car Lights` rot, 1 s, gelb, 1 s, grün),
  dann `Line patrolling ON`. Jeder Druck auf A ist so ein sauberer Neustart, auch nach einem
  Halt durch den Laser.
- **wenn Kreuzung Nummer 1 erreicht:** Abzweig rechts auf `Straight` — der Roboter fährt am
  Stummel (2) geradeaus vorbei.
- **wenn Kreuzung Nummer 3 erreicht:** `Line Following Settings Speed 1` und `zeige Zahl 1`
  (Tempo-Zone bis ins Ziel; ohne „1“ auf dem Display ist das Team geblitzt).
- **wenn Kreuzung Nummer 4 erreicht:** `spiele Melodie … im Hintergrund` (Siegesmelodie). Das
  T steht auf `Stop`, der Roboter hält von selbst.
- **dauerhaft:** Hindernisvermeidungsdaten abrufen; wenn `Entfernung Vorne (mm) < 200`, dann
  `Line patrolling OFF`. Auf dem richtigen Weg greift das nie; es fängt die Sackgasse und den
  Stummel ab.

## Was die Musterlösung tut (Profi)

Wie normal, dazu:

- **Funktion „Regeln setzen“:** setzt alle vier Regeln. Den Abzweig rechts aber abhängig vom
  Zähler: `Right`, solange `Kreuzungen gezählt` 0 ist, danach `Straight`. Knopf A ruft die
  Funktion statt der vier Einzelblöcke auf. Grund: `Line patrolling OFF` löscht die Regeln
  (Reset-Fallstrick, im Handbuch), und eine Funktion mit festem `Right` würde nach einem Halt
  zwischen 1 und dem Stummel wieder in den Stummel biegen.
- **wenn Kreuzung Nummer 4 erreicht:** etwa 500 ms warten, bis er steht. Nur wenn der Weg
  vorn frei ist (`Entfernung Vorne` nicht unter 200 mm): `Line patrolling OFF`,
  `PID Distance Control` `CW` 20 cm über die Lücke, **2000 ms warten**, „Regeln setzen“
  aufrufen, Merker `gesprungen` auf wahr, `Line patrolling ON` — bis zur Kiste am Pro-Ziel.
  Ist der Weg nicht frei, spielt er die Siegesmelodie wie im Normalweg.
  Die Pause ist nötig: `PID Distance Control` wartet auch mit `No interruptions allowed`
  nicht, bis die Strecke gefahren ist (Martin am Gerät, 05.11.2026). Ohne Pause schaltet die
  Linienverfolgung mitten im Sprung wieder an.
- **Siegesmelodie am Pro-Ziel:** Im `dauerhaft` spielt der Laser-Stopp die Melodie, wenn
  `gesprungen` wahr ist, und setzt den Merker zurück. Knopf A setzt ihn ebenfalls zurück.
- **Startampel** wie normal; 500 ms nach dem Losfahren geht rechts der Blinker an (gelb,
  leuchtet dauerhaft).
- **Blinker:** bis Kreuzung 1 das rechte Licht gelb, danach beide grün.

Ob das Überfahren des T-Balkens mit PID als Kreuzung zählt, ist für diese Lösung egal: Das
Pro-Ziel erkennt sie am Laser-Stopp, nicht an einer Nummer (Block H, Punkt 5).

## Wo die Zählnummern stehen

Verschiebt der Trockenlauf eine Nummer, müssen **alle** diese Stellen zusammen geändert werden.
Die Strecke ist viermal gezeichnet — Spec-Skizze, Station 6, Druckblatt Seite 1 und Seite 2 —,
und jede Zeichnung trägt die Nummern 1–4 an denselben Koordinaten.

1. `docs/superpowers/specs/2026-11-04-grand-prix-parcours-skizze.html` — die maßgebliche
   Zeichnung aus der Sitzung (und die Zählfolge-Tabelle im Spec daneben,
   `2026-11-04-grand-prix-parcours-design.md`).
2. `website/src/stations/06-grand-prix.html`
   - Skizze `#gpmap`: die vier `.gp-k`-Nummern
   - Schritt „An Kreuzung 1 umstellen“ und der Block `wenn Kreuzung Nummer 1 erreicht`
   - die `???`-Blöcke `wenn Kreuzung Nummer ??? erreicht` (Siegesmelodie = 4, Tempo-Zone = 3)
     — die Nummer steht nicht da, aber der Lösungsweg hängt daran
   - Hinweis „Gut hinschauen: Für den Roboter sehen 1 und 2 gleich aus“
   - Profi-Plan „Am Ziel 4 kurz warten“
3. `website/src/handbuch.html`, Abschnitt „Grand Prix aufbauen und betreuen“
   - Lösungstabelle „Lösung: die Zählfolge“ und die typischen Fehler darunter („An 1 …“)
   - Aufbau: Schild „1“ links neben der Linie x = 36, auf Höhe des Querstrichs (Nummer 3),
     x 22–28, y 56–62 cm
   - Minute-15-Regel („an 1 umstellen“) und Reset-Fallstrick („zwischen 1 und dem Stummel“)
4. `tools/grand-prix-druck.html`
   - Seite 1 (Teamskizze): die vier Nummern in der Skizze, der Hinweis „Gut hinschauen: 1 und 2“
     und die Eintragetabelle 1–4
   - Seite 2 (Klebeplan): die vier Nummern in der Skizze, die Lösungstabelle und die Zählfahrt
5. Diese README (Zählfolge und Musterlösung oben), später `loesung*.hex` und `bloecke*.png`.

Die Tests prüfen nur die Skizzen: `website/test/smoke.cjs` (`#gpmap` trägt genau 1–4) und
`tools/grand-prix-druck-test.cjs` (beide Seiten tragen genau 1–4).
