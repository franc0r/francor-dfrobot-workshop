# Vorlagenprojekt

Ein MakeCode-Projekt, in dem die Erweiterung **DFRobot_MaqueenPlus_V2** bereits
geladen ist (gilt auch für die V3-Hardware, siehe `../../CLAUDE.md`).
Die zweite Erweiterung für den Laserscanner (Station 5), **Matrix LiDAR Entfernung**,
bringt die Maqueen-Erweiterung als Abhängigkeit selbst mit.

In `beim Start` steht schon der Block **initialisiere Maqueen Plus V2**, sonst nichts.
Er gehört in jedes Roboterprogramm (setzt die Roboterplatine zurück und wartet, bis sie
antwortet: blinkendes X = keine Verbindung, Haken = verbunden).

Warum: MakeCode cacht sich beim ersten Laden vollständig, nur das *Nachladen*
einer Erweiterung braucht Netz. Ohne Vorlage stehen die Maqueen-Blöcke auf der
Messe nicht zur Verfügung.

## Dateien

- `vorlage.mkcd`: das Projekt, wie MakeCode es exportiert. `build.py` packt es als
  Base64 in den Knopf **Vorlage in MakeCode öffnen** in Station 3
  (`https://makecode.microbit.org/#project:…`). Die Datei lässt sich auch von Hand importieren.
- `vorlage.py`: schreibt `vorlage.mkcd` neu, z. B. für eine neuere Version der Erweiterung.
  Ein Export aus MakeCode (Zahnrad → Projekt speichern) ersetzt die Datei genauso gut.
- `vorlage.hex`: dieselbe Fassung zum direkten Flashen, falls MakeCode klemmt (fehlt noch).

Jeden Arbeitsplatz einmal **mit Netz** den Knopf klicken lassen. Dabei lädt MakeCode die
Erweiterungen in den Cache. Danach öffnet der Knopf die Vorlage auch ohne Netz.
Vor jedem Workshop einmal ohne Netz prüfen, ob die Maqueen-Blöcke da sind.
