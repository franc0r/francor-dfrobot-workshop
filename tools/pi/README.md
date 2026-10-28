# Raspberry Pi und Linux als Arbeitsplatz

Kleinkram, damit ein Pi 4 (4 GB+) oder ein Linux-Notebook als Arbeitsplatz taugt. Hintergrund und
Begründungen stehen im Betreuer-Handbuch (`../../website/src/handbuch.html`).

- `50-microbit.rules`: udev-Regel für den micro:bit (VID `0d28` / PID `0204`),
  damit WebUSB ohne root funktioniert. Auf jedem frisch installierten Linux nötig
  (auf Ubuntu 26.04 nachgestellt, 28.10.2026). Die Regel gibt das Gerät der Gruppe
  `plugdev` frei, also muss der Benutzer auch drin sein:

  ```sh
  sudo cp 50-microbit.rules /etc/udev/rules.d/
  sudo udevadm control --reload && sudo udevadm trigger
  sudo groupadd -f plugdev && sudo usermod -aG plugdev $USER
  # ab- und wieder anmelden, mit `groups` prüfen, micro:bit neu anstecken
  ```

  Chromium als Snap (Ubuntu) braucht zusätzlich `sudo snap connect chromium:raw-usb`.

Noch fehlt:

- ein Skript, das eine `.hex` auf das Laufwerk `MICROBIT` kopiert — Weg B,
  der immer geht, wenn WebUSB klemmt

