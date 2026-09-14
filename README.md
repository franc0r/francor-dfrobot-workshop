# Maqueen Grand Prix

Workshop-Material für einen 90-Minuten-Robotik-Workshop (micro:bit V2 + Maqueen Plus V3,
Schüler ab Klasse 7, Messe, offline). Träger ist FRANCOR e. V.

## Was liegt wo

| Ordner | Inhalt |
|---|---|
| `website/` | die Workshop-Seite. Wird zu einer einzigen Offline-HTML-Datei gebaut |
| `microbit/` | Programme für die Hardware: Vorlagenprojekt, Musterlösungen, MicroPython |
| `tools/` | Prüfprotokoll für den Trockenlauf, Kleinkram für den Raspberry Pi |
| `docs/` | Konzept, Offline-Recherche, Review-Notizen |

`website/` und `microbit/` haben nichts miteinander zu tun außer dem Thema: das eine wird
gebaut, das andere geflasht. Unter `microbit/` sagt in jedem Ordner eine `README.md`,
was dort hineingehört.

Entscheidungen, Konventionen und der Stand der Dinge stehen in `CLAUDE.md`.

## Die Seite bauen

```bash
cd website
npm install            # holt Playwright (nur für den Test)
npx playwright install chromium
python3 build.py       # erzeugt offline-, pages- und artifact-Fassung in dist/
npm test               # Smoketest mit abgeschaltetem Netzwerk
```

`website/dist/maqueen-grand-prix-offline.html` ist die Datei für die Arbeitsplätze:
kopieren, per Doppelklick öffnen, fertig. Braucht kein Internet.

## Aus der Ferne ansehen

Wer per SSH auf dem Rechner arbeitet, hat keinen Desktop zum Doppelklicken.
Dafür gibt es einen kleinen Webserver (baut vorher neu, damit nie eine alte
Fassung ausgeliefert wird):

```bash
cd website && npm run serve      # http://<ip-des-rechners>:8000/maqueen-grand-prix-offline.html
```

Beenden mit Ctrl-C. Der Server liefert nur `website/dist/` aus, nichts anderes aus dem Repo.

Nur zum Ansehen und Entwickeln — für die Messe zählt weiter die Datei selbst,
nicht der Server. Über `http://` liegt der Fortschritt in einem anderen
`localStorage`-Bereich als über `file://`, Punkte wandern also nicht mit.

## Online-Fassung (GitHub Pages)

Jeder Push auf `master`, der `website/` anfasst, baut die Seite neu, lässt den Smoketest
laufen und veröffentlicht sie — schlägt der Test fehl, wird nichts veröffentlicht
(`.github/workflows/pages.yml`).

- <https://franc0r.github.io/francor-dfrobot-workshop/> — die Seite
- `…/maqueen-grand-prix-offline.html` daneben — die Datei zum Herunterladen

Gehostet wird das Ziel `pages`: inhaltsgleich mit der Offline-Fassung, nur ohne deren
Zusatz im Titel, und ebenfalls ohne jeden externen Aufruf.

Die Online-Fassung ist zum Vorbereiten, Briefen und Herumzeigen. **Auf der Messe gibt es
kein Netz** — die Arbeitsplätze bekommen weiterhin die Datei.

## Ändern

Alles unterhalb von `website/`:

- Text einer Station: `src/stations/NN-*.html` bearbeiten, dann `python3 build.py && npm test`.
- Minuten einer Station: an **drei** Stellen — Eyebrow in der Stationsdatei, `STATIONS`-Array
  in `src/app.js`, Zeitplan in `src/handbuch.html`. Der Build meckert, wenn die ersten beiden
  auseinanderlaufen oder die Summe nicht 90 ist.
- Simulator-Level: `LEVELS` in `src/app.js`.
- Bild einbauen: Datei nach `src/assets/`, im HTML `src="assets/datei.png"` schreiben.
  Der Build bettet sie ein – nie eine URL verwenden, sonst bricht der Offline-Build ab.

Ändert sich ein Blocktext, gehört die Musterlösung unter `microbit/stations/NN-*/`
mit angefasst — gleiche Nummer, gleicher Name.
