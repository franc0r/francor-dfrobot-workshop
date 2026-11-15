# Station 05 — Grand Prix

Lauf auf Zeit über die Grand-Prix-Strecke (Matte 100 × 200 cm, Skizze in Station 5 und in
`tools/grand-prix-druck.html`). Das Programm baut auf dem Projekt „Linie“ aus Station 3 und 4 auf
und braucht nur die Erweiterung FRANCOR Maqueen. Der Kreuzungszähler steckt in der Erweiterung (Kategorie Maqueen, Gruppe V3).

Hier liegen:

- `loesung.js` (normal) und `loesung-profi.js` (Profi) — MakeCode-JavaScript. Die Fassung mit der
  Bibliothek „Grand Prix“ ist am 05.11.2026 von Martin auf der Strecke gefahren, die Fassung mit der
  FRANCOR-Erweiterung noch nicht; Knopf B (Not-Aus) und das rote Licht beim Laser-Stopp
  sind am 09.11.2026 aus Station 3 und 4 dazugekommen und noch nicht gefahren. Einfügen: Vorlage öffnen, oben auf **JavaScript**
  umschalten, alles ersetzen, zurück auf **Blöcke**. Beide Dateien entsprechen den Stationsprogrammen
  aus `geraetetest/08-stationen.ts` der Erweiterung (v0.1.4).

Nach dem Trockenlauf kommen dazu:

- `loesung.hex` und `bloecke.png` (normal)
- `loesung-profi.hex` und `bloecke-profi.png` (Profi)

Erst danach, weil der Trockenlauf die Zählnummern und die Höchststufe noch verschieben kann
(siehe `docs/02-offline-und-trockenlauf.md`, Block H).

## Zählfolge (Normalweg, gilt bis zum Trockenlauf)

| Nr. | Stelle | Typ aus Sicht des Roboters | Regel |
|---|---|---|---|
| 1 | Abzweig von der Startgeraden (K1) | Abzweig rechts + geradeaus | `an Abzweig rechts` `rechts`; bei Kreuzung 1 auf `geradeaus` umstellen |
| 2 | Stummel mit Kiste | Abzweig rechts + geradeaus | steht schon auf `geradeaus` → geradeaus vorbei |
| 3 | Tempo-Schild (Querstrich) | Kreuzung (+) | `an Kreuzung` `geradeaus`; bei Kreuzung 3 `Linien-Tempo 1` und `zeige Zahl 1` |
| 4 | Ziel | T | `an T-Kreuzung` `halt`; bei Kreuzung 4 Siegesmelodie |

`an Abzweig links` steht auf `geradeaus` und kommt auf dem Normalweg
nicht vor.

## Was die Musterlösung tut (normal)

- **beim Start:** `starte Maqueen`, dann `LiDAR einschalten`. Sonst nichts — die Regeln stehen in
  Knopf A.
- **wenn Knopf A geklickt:** `setze Kreuzungszähler zurück`, die vier Kreuzungsregeln
  (Kreuzung `geradeaus`, Abzweig links `geradeaus`, Abzweig rechts `rechts`, T-Kreuzung `halt`),
  `Linien-Tempo 2`, Startampel (`Scheinwerfer beide` rot, 1 s, gelb, 1 s, grün),
  dann `Linienverfolgung an`. Jeder Druck auf A ist so ein sauberer Neustart, auch nach einem
  Halt durch den Laser.
- **wenn Knopf B geklickt:** `Linienverfolgung aus` — der Not-Aus aus Station 3.
- **wenn Kreuzung Nummer 1 erreicht:** Abzweig rechts auf `geradeaus` — der Roboter fährt am
  Stummel (2) geradeaus vorbei.
- **wenn Kreuzung Nummer 3 erreicht:** `Linien-Tempo 1` und `zeige Zahl 1`
  (Tempo-Zone bis ins Ziel; ohne „1“ auf dem Display ist das Team geblitzt).
- **wenn Kreuzung Nummer 4 erreicht:** `spiele Melodie … im Hintergrund` (Siegesmelodie). Das
  T steht auf `halt`, der Roboter hält von selbst.
- **dauerhaft:** wenn `Abstand vorne (mm) < 200`, dann
  `Linienverfolgung aus` und `Scheinwerfer beide` rot (der Laser-Stopp aus Station 4). Auf dem
  richtigen Weg greift das nie; es fängt die Sackgasse und den
  Stummel ab.

## Was die Musterlösung tut (Profi)

Wie normal, dazu:

- **Funktion „Regeln setzen“:** setzt alle vier Regeln. Den Abzweig rechts aber abhängig vom
  Zähler: `rechts`, solange `Kreuzungen gezählt` 0 ist, danach `geradeaus`. Knopf A ruft die
  Funktion statt der vier Einzelblöcke auf. Grund: `Linienverfolgung aus` löscht die Regeln
  (Reset-Fallstrick, im Handbuch), und eine Funktion mit festem `rechts` würde nach einem Halt
  zwischen 1 und dem Stummel wieder in den Stummel biegen.
- **wenn Kreuzung Nummer 4 erreicht:** etwa 500 ms warten, bis er steht. Nur wenn der Weg
  vorn frei ist (`Abstand vorne` nicht unter 200 mm): `Linienverfolgung aus`,
  `fahre 20 cm vorwärts warte bis fertig` über die Lücke, „Regeln setzen“
  aufrufen, Merker `gesprungen` auf wahr, `Linienverfolgung an` — bis zur Kiste am Pro-Ziel.
  Ist der Weg nicht frei, spielt er die Siegesmelodie wie im Normalweg.
  `fahre 20 cm vorwärts warte bis fertig` wartet selbst (Gerätetest 05 der Erweiterung
  bestanden), eine Pause danach braucht es nicht. Ob der Profi-Sprung mit dem neuen Block am
  Gerät auf der Strecke klappt, ist noch offen (Gerätetest 08).
- **Merker `gesprungen`:** Variable nicht `pause` nennen — den Namen hat MakeCode schon
  (eingebaute Funktion), dann meldet es „Cannot redeclare block-scoped variable“ (Martin,
  05.11.2026).
- **Siegesmelodie am Pro-Ziel:** Im `dauerhaft` spielt der Laser-Stopp die Melodie, wenn
  `gesprungen` wahr ist, und setzt den Merker zurück. Knopf A setzt ihn ebenfalls zurück.
- **Startampel** wie normal; 500 ms nach dem Losfahren geht rechts der Blinker an (gelb,
  leuchtet dauerhaft).
- **Blinker:** bis Kreuzung 1 das rechte Licht gelb, danach beide grün.

Ob das Überfahren des T-Balkens mit `fahre 20 cm` als Kreuzung zählt, ist für diese Lösung egal: Das
Pro-Ziel erkennt sie am Laser-Stopp, nicht an einer Nummer (Block H, Punkt 5).

## Wo die Zählnummern stehen

Verschiebt der Trockenlauf eine Nummer, müssen **alle** diese Stellen zusammen geändert werden.
Die Strecke ist viermal gezeichnet — Spec-Skizze, Station 5, Druckblatt Seite 1 und Seite 2 —,
und jede Zeichnung trägt die Nummern 1–4 an denselben Koordinaten.

1. `docs/superpowers/specs/2026-11-04-grand-prix-parcours-skizze.html` — die maßgebliche
   Zeichnung aus der Sitzung (und die Zählfolge-Tabelle im Spec daneben,
   `2026-11-04-grand-prix-parcours-design.md`).
2. Station 5 als Gespräch: `website/src/karten/05-grand-prix.html` und
   `website/src/drehbuch/05-grand-prix.js`
   - Karte `k5-gpmap`, Skizze `#gpmap`: die vier `.gp-k`-Nummern und der Hinweis
     „Gut hinschauen: Für den Roboter sehen 1 und 2 gleich aus“
   - Schritt `kreuzungen` („An Kreuzung 1 stellt ihr um“) und Karte `k5-kreuzungen` mit dem
     Block `wenn Kreuzung Nummer 1 erreicht`
   - die `???`-Blöcke `wenn Kreuzung Nummer ??? erreicht` in `k5-tempo` (Tempo-Zone = 3) und
     `k5-melodie` (Siegesmelodie = 4) — die Nummer steht nicht da, aber der Lösungsweg hängt daran
   - Profi-Plan `k5-plan` „Am Ziel 4 kurz warten“ und im Schritt `profi` „Die Melodie kommt
     schon am Ziel 4?“
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
