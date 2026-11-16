# Doku-Bericht 16.11.2026

## CLAUDE.md
- Regel 1 (ca. Z. 21–24): `#project:`-Satz korrigiert: Vorlage verweist auf `github:franc0r/pxt-francor-maqueen#v0.1.4`, Netz beim ersten Öffnen, Cache danach, Öffnen auf jedem Arbeitsplatz. Ausnahmen/Links unverändert.
- Regel 3 (Z. 43–51): Maqueen `.b-mq`, LiDAR `.b-lidar`; Graphit/`.b-gp` gestrichen, Zählerblöcke = Maqueen.
- Regel 6: umgeschrieben (bestätigt 16.11.2026; vorläufig nur Beschleunigungsblock, Gerätetest 07, „Sprache und Offline“); Satz zu gemeinsamem Anfassen bleibt; `ALTE_BLOCKTEXTE` ergänzt.
- Aufbau: `test/build_test.py` ergänzt, `bibliothek/` gestrichen, `vorlage/` und `stations/` neu beschrieben.
- Stationstabelle: Stand 16.11.2026, Kern Station 3, 4, 5 mit neuen Blocknamen.
- Technische Fakten: Erweiterungsabsatz und Maqueen-Absatz auf FRANCOR umgeschrieben; „Tempo 0–255“ usw. stehen gelassen (kein Widerspruch zu einem benutzten Block bekannt).
- Offen: Blocktexte-Absatz auf FRANCOR umgestellt (DFRobot-/Matrix-LiDAR-Quellcode-Absatz ersetzt), Vorläufiges auf „Noch nicht am Gerät“ reduziert; Messwerte/Firmware/Bauplan/Maskottchen/Fotos bleiben, nur Blocknamen darin (`Linien-Tempo`, `Linienverfolgung an`) angepasst.
- Block-Optik: kein `.b-gp` / keine alten Namen, nichts geändert.
- Verlaufsabsätze (Entlastung, Parcours first, Grand Prix 03.–05.11.) unverändert.

## docs/02-offline-und-trockenlauf.md
- Kopf: Stand 16.11.2026. Offline-Frage: „vollständig offline… genau eine Verbindung“ entschärft (Netz bei der Vorbereitung je Arbeitsplatz; Hinweis auf Netz auf der Messe seit 29.10.). Fakt 2 neu gefasst (DFRobot-Recherche historisch, FRANCOR löst ab). Hürde-Absatz: Vorlage verweist auf GitHub-Tag, erstes Öffnen Netz, Cache, auf jedem Platz einmal öffnen; „Sprache und Offline“ ungetestet. Tabelle „geht offline“ und Konsequenz-Liste (check_vorlage, check_handbuch_version) angepasst.
- Block-Tabelle C/H und Rückfluss-Liste: Blocknamen aktuell (`Linienverfolgung an`, Zählerblöcke).
- Block H: Ergebnisse vom 05.11. (datierter Befund) mit „heute“-Klammern für Namen; Punkte 2, 3, 5, 6, 13 auf neue Namen; Punkt 15 als erledigt, Befund im Halbsatz erhalten.
- „Vorläufige Blocktexte (Grand Prix)“ -> „Blocktexte der FRANCOR-Erweiterung“: neue Namen mit „früher“, bestätigt 16.11.2026; Noch-vorläufig-Absatz fett.
- Quellen: FRANCOR-Repo ergänzt, DFRobot als „frühere Erweiterung“.
- Bewusst stehen gelassen: Punkt 8 (Register 61, alte Messfrage), Ergebnisliste 05.11. (historisch, nur Klammern), Punkt 15 Rest.

## microbit/stations/05-grand-prix/README.md
- Z. 10–13: Fassung mit FRANCOR am 16.11.2026 gefahren (Gerätetest 08 normal und Profi); Knopf B/rotes Licht „noch nicht gefahren“ entfernt (Gerätetest 08 deckt alle vier .hex ab).
- Z. 116: `bloecke*.png` (bei verschobenen Nummern neu machen).

## Prüfung
`npm run check` exit=0; dist unverändert (git status zeigt nur die 3 Doku-Dateien).

## Zweifel
- Knopf-B-Satz in der README habe ich aus der Gerätetest-08-Aussage („alle vier .hex gelaufen“) abgeleitet, nicht wörtlich aus dem Brief.
- Hinweis „Netz auf der Messe seit 29.10.“ in docs/02 stammt aus CLAUDE.md, nicht aus dem Brief.
- Die TypeScript-Aussage über FRANCOR Maqueen habe ich nicht behauptet (nicht belegt im Brief).
