# Station 03 — Fahrschule

Erweiterung geladen, Motorblöcke, erste Fahrt.

## Musterlösungen als JavaScript

- `loesung.js`: „Geradeaus und anhalten“ — 1 s mit Geschwindigkeit 120, dann stop.
- `loesung-quadrat.js`: das Quadrat wie auf der Seite, `4 -mal wiederholen` auf Knopf A,
  Drehung 650 ms.
- `loesung-funktionen.js`: Martins Fassung mit `fahreGeradeaus` und `dreheRechts` (unten).

Einfügen: in MakeCode oben auf **JavaScript** umschalten, alles ersetzen, zurück auf **Blöcke**. Noch nicht in MakeCode umgewandelt oder am Gerät gefahren (Stand 05.11.2026).
Martins Funktionen-Fassung ist als Blöcke am Gerät getestet, die JavaScript-Abschrift nicht.

## Musterlösung: Quadrat mit Funktionen

![Blöcke](bloecke.png)

Martins Lösung der Quadrat-Challenge (08.10.2026), am Gerät getestet.

- **wenn Knopf A geklickt**: ruft viermal abwechselnd `dreheRechts` und `fahreGeradeaus` auf.
  Der Roboter startet erst auf Knopfdruck, also nicht schon beim Flashen.
- **Funktion fahreGeradeaus**: `steuere beide Räder vorwärts, Geschwindigkeit 100`,
  `pausiere (ms) 1000`, `stop beide Räder`.
- **Funktion dreheRechts**: `steuere linkes Rad vorwärts, Geschwindigkeit 100`,
  `steuere rechtes Rad rückwärts, Geschwindigkeit 100`, `pausiere (ms) 650`, `stop beide Räder`.

Werte: **650 ms** ergeben bei Geschwindigkeit 100 etwa eine 90°-Drehung (Untergrund und
Akkustand verschieben das). Die Hilfe auf der Seite nennt deshalb 500–800 ms.

Funktionen kommen auf der Workshop-Seite nicht vor. Auf der Seite steht als Gerüst die
einfachere Fassung mit `4 -mal wiederholen`. Diese Lösung ist für Betreuende gedacht: Sie zeigen
sie schnellen Teams als Ausblick („einem Stück Programm einen Namen geben“).

Noch nachzureichen: `loesung.hex` (in MakeCode herunterladen und hier ablegen).
