# Maqueen Grand Prix

Workshop-Seite für einen 90-Minuten-Robotik-Workshop (micro:bit V2 + Maqueen Plus V3,
Schüler ab Klasse 7, Messe, offline).

## Loslegen

```bash
npm install            # holt Playwright (nur für den Test)
npx playwright install chromium
python3 build.py       # erzeugt dist/maqueen-grand-prix-offline.html (+ artifact-Fassung)
npm test               # Smoketest mit abgeschaltetem Netzwerk
```

`dist/maqueen-grand-prix-offline.html` ist die Datei für die Arbeitsplätze:
kopieren, per Doppelklick öffnen, fertig. Braucht kein Internet.

## Aus der Ferne ansehen

Wer per SSH auf dem Rechner arbeitet, hat keinen Desktop zum Doppelklicken.
Dafür gibt es einen kleinen Webserver (baut vorher neu, damit nie eine alte
Fassung ausgeliefert wird):

```bash
npm run serve      # http://<ip-des-rechners>:8000/maqueen-grand-prix-offline.html
```

Beenden mit Ctrl-C. Der Server liefert nur `dist/` aus, nichts anderes aus dem Repo.

Nur zum Ansehen und Entwickeln — für die Messe zählt weiter die Datei selbst,
nicht der Server. Über `http://` liegt der Fortschritt in einem anderen
`localStorage`-Bereich als über `file://`, Punkte wandern also nicht mit.

## Ändern

- Text einer Station: `src/stations/NN-*.html` bearbeiten, dann `python3 build.py && npm test`.
- Minuten einer Station: an **drei** Stellen — Eyebrow in der Stationsdatei, `STATIONS`-Array
  in `src/app.js`, Zeitplan in `src/handbuch.html`. Der Build meckert, wenn die ersten beiden
  auseinanderlaufen oder die Summe nicht 90 ist.
- Simulator-Level: `LEVELS` in `src/app.js`.

Entscheidungen, Konventionen und der Stand der Dinge stehen in `CLAUDE.md`.
Hintergrund (Recherche, Review) in `docs/`.
