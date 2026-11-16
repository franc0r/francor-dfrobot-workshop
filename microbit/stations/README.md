# Musterlösungen

Eine Mappe je Station. Nummer und Name sind dieselben wie bei der Seite:
`03-fahrschule/` gehört zu `../../website/src/drehbuch/03-fahrschule.js` und
`../../website/src/karten/03-fahrschule.html`. Wenn sich ein Blocktext ändert, werden
alle zusammen angefasst.

In jede Mappe gehören:

| Datei | Wozu |
|---|---|
| `loesung.hex` | fertig geflasht, wenn ein Team hängt oder die Zeit knapp wird |
| `bloecke.png` | Bildschirmfoto der Blöcke — das, was die Betreuenden zeigen |
| `README.md` | was das Programm tut und worauf zu achten ist |

Station 0 (Boxenstopp) hat keine Mappe: da wird nicht programmiert.

Die Lösungen sind für die **Betreuenden**. Sie werden den Schülern nicht
ausgeteilt — der Weg dahin ist der Workshop.

## So sind die `loesung*.hex` gebaut

`03-fahrschule`, `04-reflexe` und `05-grand-prix` (`loesung.hex`, dort auch `loesung-profi.hex`) sind mit `pxt build` aus je einem Scratch-Projekt entstanden:

- `pxt.json`: Abhängigkeiten `core`, `microphone` und `francor-maqueen` (= `github:franc0r/pxt-francor-maqueen#v0.1.4`, beim Bau als `file:` auf den Arbeitsbaum, der mit dem Tag identisch war). `radio` fehlt: Es lag nicht in `pxt_modules` der Erweiterung, ließ sich offline nicht installieren, und die Lösungen brauchen es nicht.
- `main.ts` = Inhalt der jeweiligen `loesung*.js`. `pxt_modules/core` und `microphone` wurden aus der Erweiterung kopiert, `pxtarget.json` zeigt auf `node_modules/pxt-microbit/pxtarget.json` (ohne sie baut pxt nur gegen das Ziel „core“, ohne `.hex`).
- Bau: `node <Erweiterung>/node_modules/pxt-core/built/pxt.js build`; übernommen wird `built/mbcodal-binary.hex` (nur micro:bit V2, V1 wird nicht unterstützt; kein Netz nötig, der C++-Unterbau kommt aus dem pxt-microbit-Hexcache).
- Alle `.hex` sind am Gerät geprüft (Martin, 16.11.2026).
