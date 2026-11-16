# Vorlagenprojekt

Ein MakeCode-Projekt, das auf unsere Erweiterung **FRANCOR Maqueen** verweist:
`github:franc0r/pxt-francor-maqueen#v0.1.4`. Die Version steht als Konstante
`FRANCOR_MAQUEEN` in `vorlage.py` (und als `VORLAGE_ERWEITERUNG` in `../../website/build.py`,
das beides gegeneinander prüft). Die Erweiterung wird nur verwiesen, nicht eingebettet.
Der Laserscanner (Kategorie LiDAR) ist Teil derselben Erweiterung.

In `beim Start` steht nur der Block **starte Maqueen**, sonst nichts. Er gehört in jedes
Roboterprogramm (setzt die Roboterplatine zurück und wartet, bis sie antwortet:
blinkendes X = keine Verbindung, Haken = verbunden).

Der Kreuzungszähler steckt jetzt in der Erweiterung (Kategorie Maqueen, Gruppe V3):
`wenn Kreuzung Nummer 1 erreicht`, `Kreuzungen gezählt` und `setze Kreuzungszähler zurück`.
Die Kreuzungsregeln der Linienverfolgung fasst er bewusst nicht an, die setzen die Teams
selbst in Station 5. Eine eigene `custom.ts` gibt es nicht mehr; `build.py` bricht ab,
wenn die Vorlage eine DFRobot-Erweiterung oder `custom.ts` enthält.

Warum: MakeCode cacht sich beim ersten Laden vollständig, nur das *Nachladen*
einer Erweiterung braucht Netz. Ohne Vorlage stehen die Maqueen-Blöcke auf der
Messe nicht zur Verfügung.

## Dateien

- `vorlage.mkcd`: das Projekt, wie MakeCode es exportiert. `build.py` packt es als
  Base64 in den Knopf **Neues Roboter-Projekt starten** in Station 3
  (`https://makecode.microbit.org/#project:…`). Die Datei lässt sich auch von Hand importieren.
- `vorlage.py`: schreibt `vorlage.mkcd` neu.
- `vorlage.hex`: dieselbe Fassung zum direkten Flashen, falls MakeCode klemmt (fehlt noch).

## Neue Version der Erweiterung

`FRANCOR_MAQUEEN` in `vorlage.py` anpassen (und `VORLAGE_ERWEITERUNG` in `build.py`),
`python3 vorlage.py` ausführen, Offline-Datei neu bauen. Danach jeden Arbeitsplatz einmal
**mit Netz** über den Knopf öffnen, damit MakeCode die Erweiterung in den Cache lädt;
auch Plätze, die früher schon vorbereitet waren. Vor jedem Workshop einmal ohne Netz prüfen,
ob die Maqueen-Blöcke da sind.
