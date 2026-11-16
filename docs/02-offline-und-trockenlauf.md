# Offline-Betrieb und Trockenlauf

**Stand:** 16.11.2026 (Umstellung auf die FRANCOR-Erweiterung nachgezogen; Abschnitt Maskottchen für den Zweig `worktree-maskottchen` vom 07.11.2026)

## Die Offline-Frage — beantwortet

Auf der Messe ist Internet nicht sicher verfügbar (seit 29.10.2026 gibt es dort wohl doch
welches, wenn auch langsam; die Seite verlässt sich nicht darauf). Ergebnis der Recherche:
**Der Workshop ist offline machbar.** Es braucht Internet bei der Vorbereitung: einmal je
Arbeitsplatz, siehe unten.

Zwei Fakten tragen das:

1. **MakeCode cacht sich selbst.** Der Editor ist eine Web-App, die sich beim ersten Laden
   vollständig im Browser ablegt. Danach startet er ohne Netz aus dem Cache. Gleicher
   Browser, Cache nicht löschen. Über „Installieren" als App ablegen macht den Cache stabiler.
2. **Die Erweiterung ist reines TypeScript** (Stand der Recherche am DFRobot-Repo
   `pxt-DFRobot_MaqueenPlus_v20`: keine .cpp/.h-Dateien). Sie wird im Browser übersetzt und
   braucht **keinen Cloud-Compiler**. Erweiterungen mit C++-Anteil würden offline scheitern.
   Seit 15.11.2026 nutzt der Workshop stattdessen die eigene Erweiterung **FRANCOR Maqueen**
   (`github:franc0r/pxt-francor-maqueen#v0.1.4`); sie ersetzt die DFRobot-Erweiterung, den
   Matrix-LiDAR und die Bibliothek „Grand Prix“. Wie sie sich offline verhält, steht unten. Auch
   FRANCOR Maqueen ist reines TypeScript (in v0.1.4 keine C++-Dateien) und kompiliert deshalb ohne
   Cloud-Compiler im Browser.

**Die eine Hürde:** Eine Erweiterung *nachzuladen* braucht Internet. Die Vorlage
(`microbit/vorlage/vorlage.mkcd`) **verweist** auf den GitHub-Tag der Erweiterung, sie
bettet sie nicht ein. Beim ersten Öffnen lädt MakeCode die Erweiterung (Netz nötig), danach
nimmt es sie aus dem Cache. Deshalb beim Aufbau **jeden Arbeitsplatz einmal mit Netz** über
den Knopf „Neues Roboter-Projekt starten“ öffnen und danach einmal ohne Netz prüfen, ob die
Maqueen-Blöcke da sind. Martin hat das Öffnen im Browser am 15.11.2026 geprüft; „Sprache und
Offline“ der Erweiterung ist am Gerät noch nicht getestet.

### Geht offline / geht nicht
| geht | geht nicht |
|---|---|
| Editor öffnen, Blöcke bauen, übersetzen, flashen | Erweiterung neu nachladen |
| Bereits geladene Erweiterungen nutzen (aus dem Cache) | Projekte über Link teilen |
| Projekte lokal speichern und laden | Editor-Sprache umstellen (vorher wählen) |
| Die Workshop-Seite (lokale Datei) | Beispiele aus der MakeCode-Galerie |

### Konsequenz für dieses Repo
- `dist/maqueen-grand-prix-offline.html` ist die Datei für die Arbeitsplätze: keine externen
  Aufrufe, Systemschriften. `build.py` und `test/smoke.cjs` erzwingen das.
- Der claude.ai-Link (Artefakt-Fassung) ist nur fürs Planen und Teilen.
- Die Vorlage braucht beim ersten Öffnen Netz (GitHub-Tag), siehe oben; build.py prüft sie
  (`check_vorlage`) und dass das Handbuch ihre Version nennt (`check_handbuch_version`).
- Rückfallebene: Station 0 der Seite plus Vorführroboter plus fertige `.hex` aus
  `microbit/stations/` per Laufwerk MICROBIT (seit 09.11.2026 ohne eigenen Simulator).

## Trockenlauf-Protokoll

Lebende Fassung: claude.ai-Artefakt mit Datenablage (Cowork-Projekt „Anfänger Robotik Workshop").
`tools/trockenlauf.html` ist nur eine Kopie zur Referenz.

**36 Tests in sieben Blöcken (A–G), ca. 90 Minuten**, sortiert nach „was am Messetag am
teuersten schiefgeht". Dazu kommt Block H für den Grand Prix (unten), an der geklebten Strecke.
Block H steht noch nicht im Artefakt und muss dort nachgetragen werden:

| Block | Thema | Dauer |
|---|---|---|
| A | Arbeitsplatz und Flashen | 15 Min |
| B | **Ohne Internet** — der entscheidende Block | 12 Min |
| C | Der Roboter fährt (Steckrichtung, Haken, `Linienverfolgung an` ohne Linie unter den Sensoren) | 15 Min |
| D | Liniensensoren und Strecke (Rohwerte, Stufe, Kurvenradius, Stopp-Block) | 15 Min |
| E | Laserscanner — die offene Flanke | 15 Min |
| F | micro:bit-Station gegenprüfen (Würfel, Logo oben/unten ab y = ±200) | 8 Min |
| G | Ausdauer und Ablauf (Akku über 90 Min Workshop plus Aufbau, Aufbauzeit) | 10 Min |
| H | Grand Prix: Strecke, Kreuzungen, Zählerblöcke (Liste unten) | ca. 40 Min |

Ergebnisse, die in `src/` zurückfließen müssen:
- Wortlaut der Maqueen-Blöcke (Licht, Linienverfolgung, Laserscanner) → alle Stationen + Handbuch
- sichere Linienstufe, kleinster Kurvenradius → Station 3, Handbuch, Parcours-Bauplan
- Rohwerte weiß/schwarz und deren Richtung → Station 3 Tabelle und Quiz q3
- Verhalten von `Linienverfolgung an` ohne Linie unter den Sensoren → Station 3 (Teststreifen), Handbuch
- Steckrichtung micro:bit → Station 3
- Grenze für „Logo nach oben/unten“ (angenommen y = ±200) und deren Vorzeichen → Station 2
  („wichtigster Satz“, Extra `zeige Zahl (Beschleunigung (mg) y)` — Wortlaut prüfen)
- Akkulaufzeit, Aufbauzeit → Handbuch
- Zählnummern 1–4, Höchststufe, Schild-Lage → alle Stellen aus der Liste in
  `microbit/stations/05-grand-prix/README.md` gemeinsam, danach `loesung.hex` und `bloecke.png`

## Block H: Grand Prix

Aus dem Entwurf (`docs/superpowers/specs/2026-11-04-grand-prix-parcours-design.md`,
„Offen für den Trockenlauf“). Strecke nach `tools/grand-prix-druck.html`, Seite 2, kleben.

**Ergebnisse an Martins Strecke, 05.11.2026** (vor dem Workshop am 06.11.2026):

- **0, 2, 3:** bestätigt. Die Zählfahrt zeigt 1, 2, 3, 4; `Straight` (heute `geradeaus`) aus
  Kreuzung 1 wirkt ab der nächsten Kreuzung; `Line Following Settings Speed` (heute
  `Linien-Tempo`) wirkt sofort.
- **1:** bestätigt. Zählt eine Stelle nicht sauber, die Stelle auf der Matte etwas verschieben.
- **4:** Der Laser **sieht** die Stummel-Kiste beim Vorbeifahren. Martin baut deshalb ohne
  Kisten: Eine Barriere rund um die ganze Matte ersetzt sie, der Laser-Stopp hält an der Wand.
- **5:** offen. Für die Profi-Musterlösung egal (Pro-Ziel über den Laser, nicht über eine Nummer).
- **13:** Er bremst nach dem Sprung nicht zu früh. Er hält an der Wand, nicht an einer Kiste.

0. **Zählfahrt:** Ein Programm mit `dauerhaft → zeige Zahl (Kreuzungen gezählt)` fährt die
   Strecke einmal den Normalweg ab. Die Anzeige muss nacheinander 1, 2, 3, 4 zeigen. (Steht
   als fester Aufbauschritt im Handbuch.)
1. Wird jede Zählstelle genau einmal gezählt? Auch der Querstrich am Tempo-Schild mit nur
   ≈ 6 cm Armen und das T direkt unter der Oberkante des Bogens (5–7 cm Abstand)?
2. Wirkt `geradeaus`, gesetzt in `wenn Kreuzung Nummer 1 erreicht`, erst ab der nächsten
   Kreuzung und nicht schon an K1?
3. Wirkt `Linien-Tempo`, gesetzt während der Fahrt, sofort und ohne OFF/ON?
4. Taucht die Kiste am Stummel im Laserbild auf, wenn er geradeaus vorbeifährt?
5. Wird das Überfahren des T-Balkens mit `fahre 20 cm … warte bis fertig` (Linienverfolgung aus) als
   Kreuzung gezählt? Das ändert die Nummer für die Profis.
6. Mit Stufe 1 hielt der Roboter einmal nicht sauber am T. Vermutlich lag es am
   Reset-Fallstrick (`Linienverfolgung aus` löscht die Regeln), nicht am Tempo. Nachprüfen.
7. Zeiten für die Strecke auf Stufe 1–5 messen, damit die Höchststufe auf der Seite stimmt.
8. Wie lange bleibt Register 61 (`intersectionDetecting`) an einer Kreuzung ≠ 0, und wie lange
   blockiert eine Laser-Abfrage? Ist die Abfrage länger, verpasst die Zählschleife (alle
   20 ms) Treffer, und das `dauerhaft` braucht eine Pause.
9. Hält der Akku 90 Minuten plus Aufbau? (zusammen mit Block G)
10. Freiraum um die Matte: Der Laser sieht auch Füße und Taschen. Reichen die 30 cm aus dem
    Handbuch?
11. **Schild „1“:** Am 05.11.2026 verlegt, weil es vorher (x 40–46, y 68–74 cm) im Fahrweg
    der Linie x = 36 lag. Jetzt laut Klebeplan bei x 22–28, y 56–62 cm: links neben x = 36
    (8 cm bis zur Bandmitte, der Roboter reicht ≈ 5,5 cm zur Seite), 12 cm bis zur
    Startgeraden x = 10, 9,5 cm über der Stummel-Kiste. Am Trockenlauf prüfen: Fährt kein Rad
    darüber, und sieht der Laser es nicht als Hindernis? Wird es noch einmal verschoben, alle
    Skizzen, den Klebeplan und die Texte gemeinsam ändern.
12. **Druckblatt:** `tools/grand-prix-druck.html` mit 100 % drucken und mit dem Lineal
    nachmessen: Die Matte ist 10 × 20 cm. Das Blatt einmal auf Raspberry Pi OS öffnen und
    drucken (das Blatt wünscht sich Helvetica Neue oder Arial, auf dem Pi greift meist DejaVu
    Sans, die breiter läuft) — passt jede Seite noch auf ein Blatt?
13. **Laser nach dem Profi-Sprung:** Der Laser-Stopp darf nach dem Sprung mit `fahre 20 cm …
    warte bis fertig` nicht sofort auslösen. Nach den 20 cm Sprung sind es noch ≈ 22 cm bis zur
    Pro-Ziel-Kiste, knapp über der Grenze von 200 mm. Prüfen, ob er erst wieder auf der Linie
    fährt, bevor er bremst.
14. **Rechter Rand:** Der Bogen reicht bis x ≈ 96. Mit ≈ 5,5 cm halber Breite ragt die
    Karosserie dort ≈ 1,5 cm über die Mattenkante. Prüfen: Liegt die Matte flach genug (keine
    Stufe, die ein Rad abwirft), und bleibt am Tisch genug Platz?
15. **PID-Sprung wartet nicht — erledigt.** Der alte Block `PID Distance Control` kehrte auch
    mit `No interruptions allowed` sofort zurück (Martin am Gerät, 05.11.2026); die
    Musterlösung wartete danach 2000 ms. Der Block `fahre 20 cm vorwärts warte bis fertig`
    der FRANCOR-Erweiterung wartet selbst (Gerätetest 05 der Erweiterung; der Profi-Sprung
    ist in Gerätetest 08 am 16.11.2026 auf der Strecke bestanden), die 2-s-Pause ist entfallen.
    Offen bleibt nur, dass der Akku-Stand am Trockenlauf mitläuft (Block G).

## Blocktexte der FRANCOR-Erweiterung

Regel 6 der CLAUDE.md. Seit der Umstellung vom 15.11.2026 stehen diese Blöcke auf der Seite, im
Handbuch, auf dem Druckblatt und in `microbit/stations/`. **Am Gerät bestätigt (Martin,
16.11.2026, Gerätetest 03 und 08 der Erweiterung):** alle sind in der sichtbaren Gruppe V3,
nicht unter „mehr“, und deutsch übersetzt.

- `starte Maqueen` (früher `initialisiere Maqueen Plus V2`), `Scheinwerfer beide Farbe …`
  (früher `RGB Car Lights All color …`)
- `Linienverfolgung an` / `aus`, `Linien-Tempo 1–5` (früher `Line patrolling ON/OFF`,
  `Line Following Settings Speed`)
- `an Kreuzung`, `an Abzweig links`, `an Abzweig rechts`, `an T-Kreuzung` mit der Auswahl
  `geradeaus` / `links` / `rechts` / `halt` (früher `At Crossroads` usw.)
- `fahre 20 cm vorwärts warte bis fertig` (früher `PID Distance Control`)
- `LiDAR einschalten`, `Abstand vorne (mm)` (früher Matrix-LiDAR-Init, Entfernung vorne)
- `setze Kreuzungszähler zurück`, `wenn Kreuzung Nummer … erreicht`, `Kreuzungen gezählt`
  (früher Bibliothek „Grand Prix“, jetzt hellgrün in der Kategorie Maqueen)
- `Bildschirminhalt löschen` (Station 5, Knopf A; Grundlagen, direkt dort; 16.11.2026)
- `spiele [Melodie …] [im Hintergrund]` (05.11.2026)

Die alten Texte stehen in `ALTE_BLOCKTEXTE` in `website/build.py`; `build.py` bricht ab, wenn
einer davon in einem Build-Ziel auftaucht.

**Noch vorläufig, bis zum Trockenlauf:** der Block `zeige Zahl (Beschleunigung (mg) y)` im
Extra von Station 2 (Wortlaut am Gerät prüfen); Gerätetest 07 (V2-Roboter) und „Sprache und
Offline“ der Erweiterung; die Messwerte (sichere Linienstufe, Kurvenradius) und der
Trockenlauf mit Schülern.

## Maskottchen

Nur auf dem Zweig `worktree-maskottchen` (siehe CLAUDE.md, Abschnitt „Maskottchen-Zweig“).
Beim Trockenlauf mit echtem OpenRouter-Schlüssel und dem Messe-Netz (oder einem Hotspot):

- [ ] Schlüssel über den Knopf „LLM Setup“ in der Kopfzeile eintragen, Zähler im Handbuch nullen.
- [ ] Station 3 bis zum Schritt „Er fährt!“ spielen, „Geht nicht“ drücken,
      einen Chip und eine eigene Frage probieren. Antwort kurz, Du-Anrede, Blocknamen richtig?
- [ ] Antwortzeit mit der Uhr messen (Figur grübelt, bis die Blase kommt). Grenze im Code:
      15 s (`LLM_TIMEOUT_MS`), danach Rückfallantwort.
- [ ] `#llmzaehler` im Handbuch ablesen und mit den Kosten bei OpenRouter vergleichen.
- [ ] WLAN aus, noch einmal „Geht nicht“: Rückfallantwort mit Checkliste, Zähler bleibt stehen.

Messung (Antwortzeit, Cent je Frage): **noch offen**.

Auf diesem Zweig geschrieben, aber noch nicht geprüft:

- **MakeCode-Film** (Station 1, Karte `k1-film`): aus dem Gedächtnis gezeichnet. Am Gerät
  vergleichen: Vorschau links, Kategorien in der Mitte, Programm rechts? Schließt die
  Blockliste, sobald man einen Block herauszieht? Heißt der Block `zeige Symbol` und zeigt er
  als Vorgabe das Herz? Stimmt die Reihenfolge der Kategorien (Grundlagen, Eingabe, Musik,
  LED, Funk, Schleifen, Logik, Variablen, Mathematik)? Das Drehbuch sagt dasselbe in Worten.
- Beschriftung im Kopplungsfenster beim ersten Flashen: Drehbuch Station 1 sagt
  **„micro:bit koppeln“**, das Handbuch an anderer Stelle „Gerät koppeln“. Am Gerät ablesen
  und beide Stellen angleichen.
- **Vorlesen** (Web Speech API, Schalter im Handbuch): Die Stimmen lädt der Browser erst
  nach und nach; die erste Blase kann ohne deutsche Stimme oder gar nicht gesprochen werden.
  Chrome verschluckt manchmal ein `speak()` direkt nach `cancel()` (beim Schrittwechsel).
  Auf Laptop und Raspberry Pi mit Chromium ausprobieren.
- **Verlauf an OpenRouter**: Die Reihenfolge der Rollen im mitgeschickten Verlauf (system,
  dann die letzten vier Blasen als user/assistant, dann die Frage) ist nur gegen den
  gefälschten Endpunkt im Smoketest geprüft, nicht gegen den echten Anbieter. Oft folgt auf
  system gleich assistant, und mehrere assistant stehen hintereinander (Franco spricht
  mehrere Blasen). Lehnt der Anbieter das ab, kommt immer die Rückfallantwort.

## Quellen
- https://makecode.microbit.org/offline (Caching, Erweiterungs-Workaround, C++-Einschränkung)
- https://support.microbit.org/support/solutions/articles/19000013750- (Editoren offline)
- https://github.com/DFRobot/pxt-DFRobot_MaqueenPlus_v20 (frühere Erweiterung, TypeScript, de-Lokalisierung)
- https://github.com/franc0r/pxt-francor-maqueen (FRANCOR Maqueen, ab 15.11.2026)
