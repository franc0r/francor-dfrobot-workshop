# MakeCode-Tutorials

Die Tutorials liegen in einem eigenen Repo:
<https://github.com/franc0r/makecode-maqueen-tutorials>. MakeCode lädt ein GitHub-Tutorial
nur, wenn im Hauptordner des Repos eine `pxt.json` liegt — in einem Unterordner dieses
Repos ging es nicht (`failed to fetch pxt.json; 404`, 29.10.2026).

| Tutorial | Station | Link |
|---|---|---|
| `erster-kontakt.md` | 1 | <https://makecode.microbit.org/#tutorial:github:franc0r/makecode-maqueen-tutorials/erster-kontakt> |

Entstanden aus dem Probelauf vom 28.10.2026 (`docs/04-probelauf-2026-10-28.md`).
Noch nicht in der Workshop-Seite verlinkt.

Mit Netz geprüft (29.10.2026): Der Link startet das Tutorial, Oberfläche deutsch.
MakeCode zeigt oben „Nicht genehmigter Inhalt“, weil das Repo nicht auf Microsofts
Freigabeliste steht.

## Inhalt testen, ohne zu pushen

`tutorial-test.html` per Doppelklick in Chrome öffnen, warten bis MakeCode da ist,
`.md` wählen → **Tutorial starten**. Die Seite bettet MakeCode ein (`?controller=1`) wie
<https://makecode.com/tutorial-tool>. Nur mit Netz: Ohne Netz startet eingebettetes
MakeCode nicht (Martin, 29.10.2026).

## Offline-Test (offen)

MakeCode legt ein GitHub-Tutorial nach dem ersten Laden in der IndexedDB ab und nimmt es
ohne Netz von dort (pxt `webapp/src/idbworkspace.ts`, `loadTutorialMarkdown`).
Prüfen: Link mit Netz öffnen, WLAN aus, Chrome neu starten, Link erneut öffnen.
Geht das, gehört „Tutorial-Link einmal öffnen“ in die Aufbau-Liste im Handbuch.
