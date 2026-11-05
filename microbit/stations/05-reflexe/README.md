# Station 05 — Reflexe

Laserscanner und wenn/dann/sonst. Pflicht; Station 6 baut darauf auf.

`loesung.js` (MakeCode-JavaScript, noch nicht am Gerät gefahren): Bremsassistent mit
Pausenknopf. Knopf B setzt die Variable `pausiert` auf wahr, Knopf A auf falsch; das `dauerhaft`
hält an, wenn `pausiert` wahr ist **oder** vorn etwas näher als 200 mm ist. Die Variable ist
die Vorbereitung für den Merker `gesprungen` im Profi-Teil des Grand Prix.
Nicht `pause` nennen: Den Namen hat MakeCode schon (eingebaute Funktion), dann meldet es
„Cannot redeclare block-scoped variable“ (Martin, 05.11.2026).

Nach dem Trockenlauf hier ablegen:

- `loesung.hex`
- `bloecke.png`

und darunter notieren, was das Programm tut und welche Werte darin stecken.
