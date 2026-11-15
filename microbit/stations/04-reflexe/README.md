# Station 04 — Reflexe

Laser-Stopp im Projekt „Linie“ aus Station 3. Pflicht; Station 5 baut darauf auf.

`loesung.js` (MakeCode-JavaScript, noch nicht am Gerät gefahren): wie Station 3, dazu in
`beim Start` nach `starte Maqueen` der Block `LiDAR einschalten` (misst danach im Hintergrund;
die ersten 2–3 s ist der Abstand 9999, das zählt nie als Hindernis). In `dauerhaft`: wenn
`Abstand vorne (mm) < 200`, dann `Linienverfolgung aus` und `Scheinwerfer beide Farbe rot`. Kein `ansonsten`, keine Variable —
Knopf A startet nach einem Halt einfach neu (Ampel, dann grün).

Hinweis fürs Nachbauen in MakeCode: zuerst den Vergleichsblock `0 < 0` (Logik) in das Loch
von `wenn … dann` schieben, erst dann passt der Abstandsblock in dessen linke Seite
(`docs/04-probelauf-2026-10-28.md`, Punkt 13).

Bis 09.11.2026 hatte diese Station einen Pausenknopf mit der Variablen `pausiert`; den Merker
lernen die Teams jetzt erst im Profi-Teil des Grand Prix (`gesprungen`).

Nach dem Trockenlauf hier ablegen:

- `loesung.hex`
- `bloecke.png`

und darunter notieren, was das Programm tut und welche Werte darin stecken.
