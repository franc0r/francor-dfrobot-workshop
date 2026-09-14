# Raspberry Pi als Arbeitsplatz

Kleinkram, damit ein Pi 4 (4 GB+) als Arbeitsplatz taugt. Hintergrund und
Begründungen stehen im Betreuer-Handbuch (`../../website/src/handbuch.html`).

Hier hinein gehört:

- die udev-Regel für den micro:bit (VID `0d28` / PID `0204`), damit WebUSB
  ohne root funktioniert
- ein Skript, das eine `.hex` auf das Laufwerk `MICROBIT` kopiert — Weg B,
  der immer geht, wenn WebUSB klemmt

Noch leer; wird beim Aufsetzen der Arbeitsplätze gefüllt.
