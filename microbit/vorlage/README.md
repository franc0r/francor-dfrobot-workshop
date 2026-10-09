# Vorlagenprojekt

Ein MakeCode-Projekt, in dem die Erweiterung **DFRobot_MaqueenPlus_V2** bereits
geladen ist (gilt auch für die V3-Hardware, siehe `../../CLAUDE.md`).
Zweite Erweiterung für den Laserscanner (Station 5): **Matrix LiDAR Entfernung**
(github.com/DFRobot/pxt-DFRobot_matrixLidarDistanceSensor, reines TypeScript, läuft offline).

In `beim Start` steht schon der Block **initialisiere Maqueen Plus V2**, sonst nichts.
Er gehört in jedes Roboterprogramm (setzt die Roboterplatine zurück und wartet, bis sie
antwortet: blinkendes X = keine Verbindung, Haken = verbunden).

Warum: MakeCode cacht sich beim ersten Laden vollständig, nur das *Nachladen*
einer Erweiterung braucht Netz. Ohne Vorlage stehen die Maqueen-Blöcke auf der
Messe nicht zur Verfügung.

Hier hinein gehört:

- `vorlage.mkcd` — das exportierte Projekt zum Importieren in MakeCode
- `vorlage.hex` — dieselbe Fassung zum direkten Flashen, falls MakeCode klemmt

Vor jedem Workshop einmal auf einem Rechner ohne Netz öffnen und prüfen, ob die
Maqueen-Blöcke da sind.
