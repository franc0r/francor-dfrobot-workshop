# Programme für micro:bit und Maqueen

Alles, was am Ende auf der Hardware landet. Getrennt von `../website/`, weil
hier nichts gebaut wird — die Dateien werden geflasht oder in MakeCode geöffnet.

| Ordner | Inhalt |
|---|---|
| `vorlage/` | Startprojekt mit schon geladener DFRobot-Erweiterung — das, was die Schüler öffnen |
| `stations/` | Musterlösung je Station, für die Betreuenden |
| `python/` | MicroPython: Hardware-Check und Zugabe für Schnelle |

`.hex`-Dateien werden eingecheckt, aus demselben Grund wie die Offline-Seite:
auf der Messe gibt es kein Internet und keine Zeit, etwas neu zu bauen.

Dateinamen ohne Umlaute und Leerzeichen — sie landen auf einem FAT-Laufwerk
(`MICROBIT`) und in Pfaden, die auf dem Raspberry Pi getippt werden.
