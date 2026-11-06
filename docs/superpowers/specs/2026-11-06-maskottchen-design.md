# Maskottchen: das Logo führt durch den Workshop

Entwurf vom 06.11.2026, Gespräch mit Martin. Experiment auf dem Zweig
`worktree-maskottchen`. `master` bleibt unberührt; fliegt das Konzept nicht, wird
der Zweig nicht gemergt und die heutigen Stationsseiten gelten weiter.

## Warum

Die Stationen sind Textwände. Auf der Messe werden die Schüler nach wenigen
Minuten unaufmerksam: viel Wissen in kurzer Zeit, viel Text, es wirkt wie Schule.
Dazu die unausgesprochene Frage „Warum mache ich das nicht daheim?“ und die
genauso unausgesprochene „Darf ich das jetzt da in MakeCode programmieren?“.

Das Maskottchen ersetzt das Lesen durch ein Gespräch. Es erzählt die Aufgabe in
Happen, gibt den Anschub („Ja, jetzt du.“) und antwortet mit einem LLM, wenn
etwas nicht klappt. Es ist frech und witzig, nicht schulmeisterlich.

## Ziele

- Die Schüler lesen nie mehr als eine Sprechblase auf einmal.
- Nach spätestens zwei Blasen tun sie etwas: Block ziehen, Knopf drücken,
  Roboter aufsetzen.
- Das Maskottchen gibt an jedem Schritt die Erlaubnis und den Anschub.
- „Geht nicht“ führt zu einer brauchbaren Antwort, auch wenn kein Betreuer
  frei ist.
- Die Figur lebt: Sie blinzelt, schaut, wackelt, freut sich.

## Nicht-Ziele

- Kein Wettbewerb, keine Punkte über das heutige Abzeichen-System hinaus.
- Kein Chatbot für alles: Die Figur redet nur über den Workshop.
- Keine Steuerung des echten Roboters von der Seite aus.
- Kein Ersatz für die Betreuenden; sie bleiben der erste Ansprechpartner bei
  Hardware-Problemen.

## Anti-Ziele (so wäre es ein Fehlschlag)

- Die Figur drängt sich auf, redet ungefragt in einem fort, nervt.
- Die Antworten des LLM sind lang, belehrend oder falsch zu den Blocknamen.
- Die Seite geht ohne Internet gar nicht mehr. Ohne Netz muss das feste
  Drehbuch laufen; nur „Geht nicht“ darf dann auf den Betreuer verweisen.
- Mehr als ein Euro Token-Kosten pro Workshop.

## Aufgehobene Regel

Für diesen Zweig gilt **Regel 1 (Offline-only) nicht** (Martin, 06.11.2026).
Das LLM läuft über das Internet, auf der Messe gibt es langsames Netz. Alles
andere aus `CLAUDE.md` gilt weiter: eine Datei, nur Blöcke, Deutsch Klasse 7,
Zeitplan 105 + 15, Blockfarben.

Trotzdem bleibt die Seite ohne Netz voll benutzbar (siehe Anti-Ziele). Der
Smoketest mit abgeschaltetem Netz bleibt deshalb bestehen; er prüft, dass die
Figur ohne Schlüssel und ohne Netz das Drehbuch zu Ende führt.

## Die Figur

- **Aussehen:** Das FRANCOR-Logo (`francor-logo.png`, Achteck-Kopf über
  Standfuß) mit einem dunklen Visier über dem Kopf und zwei leuchtenden
  hellblauen Augen (Variante „Visier“ aus dem Mockup, Martin 06.11.2026).
  Umsetzung als Inline-SVG: das PNG als `<image>`, Visier und Augen als
  SVG-Formen darüber, damit sie animierbar sind. Das Visier sitzt auf dem
  Achteck etwa bei y 26–44 der 105×120-Grafik.
- **Name:** offen. Im Code `MASKOTTCHEN_NAME`, auf der Seite vorläufig
  „Franco“. Martin entscheidet vor dem Trockenlauf.
- **Zustände (CSS-Animationen, bei `prefers-reduced-motion` nur Blinzeln):**
  - *Leerlauf:* leichtes Wippen, Blinzeln alle paar Sekunden.
  - *Schauen:* Die Augen folgen dem Mauszeiger, auf Touch-Geräten dem letzten
    Tipp-Punkt. Wenn die Figur über einen Block spricht, schaut sie zur Karte.
  - *Reden:* Kopf wackelt leicht, solange eine Blase „geschrieben“ wird.
  - *Jubel:* Hüpfer bei erledigtem Schritt und beim Abzeichen.
  - *Grübeln:* Augen schmaler, Kopf leicht geneigt, während das LLM
    antwortet.
  - *Sorge:* bei „Geht nicht“ kurz Augen hoch, dann Grübeln.
- **Platz:** links neben dem Gespräch, unter der Stationsleiste, immer
  sichtbar (auf schmalen Bildschirmen klein oben links neben den Blasen).
- **Nicht aufdringlich:** Die Figur spricht von selbst nur beim Wechsel auf
  einen neuen Schritt: Dann spielt sie die Nachrichten dieses Schritts
  nacheinander ab (Tipp-Effekt, je Blase ein bis zwei Sätze, in der Regel
  zwei bis drei Blasen plus Karte) und wartet dann auf die Antwortknöpfe.
  Danach nur auf Klick oder Knopf. Ältere Blasen bleiben als Verlauf stehen,
  damit der Blockstapel sichtbar bleibt, während das Team in MakeCode baut;
  „nie mehr als eine Blase auf einmal“ meint die Länge je Blase, nicht den
  Verlauf (Entscheidung Claude, 06.11.2026, nach Prüferfrage). Einzige
  Ausnahme: Nach drei Minuten ohne Klick auf der Seite ein einziger
  Stupser („Alles gut bei euch? Ich bin hier, wenn ihr mich braucht.“),
  danach nicht mehr für diesen Schritt.

## Das Format: Gespräch statt Seite

Jede Station ist ein **Drehbuch** aus Schritten. Ein Schritt besteht aus
einer Folge von Nachrichten der Figur und endet mit Antwortknöpfen.

Nachrichten sind:

- **Blase:** ein bis zwei kurze Sätze. Erscheint mit kurzer Verzögerung
  nacheinander (Tipp-Effekt, bei reduced-motion sofort).
- **Karte:** statt Text ein eingebettetes Element:
  - ein Blockstapel in `.mcb`-Optik (wie heute, `nestStack()` bleibt)
  - der Knopf „Neues Projekt starten“ / „Neues Roboter-Projekt starten“
    (`makecode:neu` / `makecode:vorlage`, wie heute)
  - der Parcours-Simulator (Station 3)
  - der micro:bit-Simulator (Station 2)
  - ein Bild aus `assets/` oder eine der SVG-Figuren (`#mqmap`, `#mqinsert`)
  - ein Quiz wie heute
  - die Checkliste „Wenn es klemmt“ einer Station, zusammengeklappt

Antwortknöpfe am Ende eines Schritts, drei Sorten:

- **„Hab ich ✓“** (oder passender Text wie „Er fährt!“): Das ist das Abhaken.
  Die Schüler haken selbst ab (Martin, 06.11.2026), die Figur übernimmt das
  nie. Der nächste Schritt beginnt mit einem Satz der Figur.
- **„Zeig mir“ / „Nochmal“**: eine vorgeschriebene Zusatz-Erklärung oder
  Karte, ohne LLM.
- **„Geht nicht“**: öffnet das Frage-Feld (unten).

**Freiwillige Schritte** (Würfel-Challenge in Station 2, Staubsauger-Bonus in
Station 5, Profi-Ziel in Station 6) tragen im Drehbuch `bonus: true`. Die
Figur kündigt sie als Zugabe an („Lust auf Extra? Sonst geht's weiter.“) und
bietet zwei Knöpfe: **„Machen wir!“** (dann wie ein normaler Schritt mit
„Hab ich ✓“, Eintrag in `S.bonus` wie heute) und **„Überspringen“**. Ein
übersprungener Schritt blockiert das Abzeichen nie; er bleibt unter den
Antwortknöpfen als „Extra: …“ erreichbar, falls das Team später Zeit hat. Die
Mini-Abzeichen des micro:bit-Simulators (`mbAward`) bleiben innerhalb der
Simulator-Karte erhalten (Entscheidung Claude, 06.11.2026, nach Prüferfrage).

Der letzte Schritt einer Station endet mit dem Abzeichen (Jubel) und dem
Knopf zur nächsten Station. Fortschritt, Abzeichen, Leiste, Timer, „Neues
Team“, Sicherheitsfenster und Betreuer-Handbuch bleiben wie heute; `S.done`
und `localStorage` unter `mgp-v1` bleiben die Quelle. Neu gespeichert wird
je Station der aktuelle Schritt und die bereits gezeigten Nachrichten, damit
ein Neuladen das Gespräch nicht löscht.

Die heutigen Stationstexte (`website/src/stations/NN-*.html`) werden auf
diesem Zweig **nicht mehr gebaut**. Sie bleiben auf `master` in der Hinterhand
(Martin, 06.11.2026). Der Inhalt wandert in die Drehbücher; der Umbau der
sieben Stationen ist der größte Teil der Arbeit. Tabellen (etwa die
Sensorwerte in Station 4) werden zu einer Blase mit zwei Zahlen oder zu einer
kleinen Karte, nicht zu einer Tabelle in der Blase.

## Das Frage-Feld und das LLM

Drückt ein Team „Geht nicht“, erscheint unter dem Gespräch ein Textfeld mit
drei bis vier **Vorschlagsfragen als Chips**, passend zum Schritt (Martin,
06.11.2026). Beispiel Station 4, Linie: „Der micro:bit zeigt nur ein X“,
„Er fährt von der Linie runter“, „Er fährt gar nicht los“. Chip antippen oder
eigene Frage tippen, beides geht an das LLM. Die Antwort kommt als Blase der
Figur, Zustand *Grübeln* währenddessen, danach wieder die Antwortknöpfe des
Schritts plus „Noch eine Frage“.

**Anbindung:** OpenRouter, Chat-Completions-Endpunkt, direkt aus dem Browser
per `fetch`. Kein eigener Server.

**Schlüssel:** steht nie in der Datei oder im Repo. Der Betreuer trägt ihn
einmal pro Arbeitsplatz im Betreuer-Handbuch (Drawer „Für Betreuer“, neuer
Abschnitt „Maskottchen“) ein; er liegt dann in `localStorage` und überlebt
„Neues Team“. Ohne Schlüssel oder ohne Netz antwortet die Figur auf „Geht
nicht“ mit der Checkliste „Wenn es klemmt“ der Station und „Wink den
Betreuer her“. Fehler vom Server (Timeout nach 15 s, 4xx/5xx) führen zur
selben Rückfallantwort, nie zu einem leeren Chat.

**Kosten:** Ziel unter einem Euro pro Workshop, besser 20 Cent. Dafür:

- ein günstiges, schnelles Modell (Haiku-Klasse oder vergleichbar; der
  Bauer wählt ein konkretes und schreibt die Kennung als eine Konstante,
  damit Martin sie tauschen kann)
- Kontext pro Frage höchstens etwa 2.000 Token: System-Prompt, das Drehbuch
  der aktuellen Station in Kurzform, der aktuelle Schritt, die erwarteten
  Blöcke, die Störungsliste der Station, die letzten vier Nachrichten
- `max_tokens` 200, Antwort zwei bis drei Sätze
- ein Zähler in `localStorage` (Anfragen, Token, geschätzte Cent) im
  Betreuer-Abschnitt sichtbar, mit Knopf zum Nullsetzen

**System-Prompt, Kern:** Du bist [Name], das Maskottchen des Robotik-
Workshops von FRANCOR e. V. Du sprichst Deutsch, Du-Form, kurze Sätze, Klasse
7, frech und freundlich. Du kennst nur diesen Workshop: micro:bit V2, Maqueen
Plus V3, MakeCode mit Blöcken. Blocknamen nimmst du wörtlich aus dem
Drehbuch, nie erfunden. Höchstens drei Sätze. Du schreibst nie Textcode. Bei
Hardware-Gefahr (Kabel, Akku, Hitze) und bei allem, was nicht zum Workshop
gehört, verweist du freundlich auf die Betreuenden. Das genaue Wording ist
Sache des Bauers; die Blocknamen-Regel und die Drei-Sätze-Grenze sind Pflicht.

## Sprachausgabe

Die Blase ist immer da. Zusätzlich gibt es im Betreuer-Abschnitt einen
Schalter **„Vorlesen“** (Standard: aus, die Messe ist laut). Ist er an,
liest die Browser-Stimme (Web Speech API, `speechSynthesis`, deutsche Stimme
des Systems, falls vorhanden) jede Blase vor, LLM-Antworten satzweise, sobald
der Satz da ist. Keine Cloud-Stimme. Fehlt eine deutsche Stimme (Raspberry
Pi), bleibt der Schalter wirkungslos und das Handbuch sagt, wie man eine
nachinstalliert.

## Technik

- Bleibt die eine gebaute Datei aus `website/build.py` mit denselben Zielen.
  `build.py` liest statt `src/stations/` nun `src/drehbuch/NN-name.js`
  (ein Modul je Station, dieselbe Nummer und derselbe Name wie bisher) und
  hängt sie vor `app.js` ein. Die Prüfung von `data-st`, Eyebrow-Minuten und
  `STATIONS` wird auf die Drehbücher übertragen (jedes Drehbuch nennt
  Nummer, Titel, Minuten, Abzeichen).
- Die Prüfung auf externe Verweise in `build.py` bleibt; sie trifft `fetch`
  im Skript nicht. Die OpenRouter-Adresse steht als Konstante in `app.js`.
- Drehbuch-Form (Vorschlag, der Bauer darf sie verfeinern): je Station ein
  Objekt mit `schritte: [{ id, titel, nachrichten: [ {blase} | {karte} ],
  antworten: [...], chips: [...], erwartet: ["Line patrolling ON", …] }]`.
  Karten verweisen auf HTML-Schnipsel oder auf Simulator-Container, die
  `app.js` beim Anzeigen einhängt. Die Simulatoren bleiben in `app.js`,
  bekommen aber ihre Container erst beim Einhängen der Karte.
- `styles.css`: neue Klassen für Figur, Blasen, Karten, Knöpfe, Frage-Feld;
  Design-Tokens hell/dunkel wie heute. `.mcb`, `.mcstack`, Simulatoren und
  `.mqfig` bleiben.
- Smoketest `test/smoke.cjs`: ohne Netz, ohne Schlüssel einmal durch alle
  sieben Drehbücher klicken, Abzeichen prüfen, „Geht nicht“ muss die
  Rückfallantwort zeigen. Dazu ein Test mit gefälschtem OpenRouter-Endpunkt
  (Playwright `route`), der prüft, dass Antwort und Zähler ankommen.
- Handbuch: neuer Abschnitt „Maskottchen“ (Schlüssel eintragen, Vorlesen,
  Kosten ablesen, was ohne Netz passiert) und im Aufbau-Teil der Schritt
  „Schlüssel an jedem Platz eintragen“.
- `CLAUDE.md` auf diesem Zweig: Abschnitt zur aufgehobenen Regel 1 und zum
  Drehbuch-Format.

## Was der Bauer entscheidet

- Genaue Animationen, Zeiten, Kurven; wie die Augen zur Karte schauen.
- Schrittgranularität je Station und die Chip-Texte; Richtwert: ein Schritt
  ist eine Handlung von ein bis drei Minuten, pro Station drei bis sieben
  Schritte.
- Das konkrete Modell, das Wording des System-Prompts, die Kurzform der
  Drehbücher im Kontext.
- Ob das Frage-Feld immer sichtbar ist oder nur nach „Geht nicht“
  (Vorgabe: nur nach „Geht nicht“, damit die Figur nicht wie ein Chatbot
  aussieht).
- Aufbau des Drehbuch-Moduls im Detail.

## Was Martin noch entscheidet

- Der Name der Figur.
- Nach dem Trockenlauf: ob der Zweig gemergt wird.

## Erfolgsprobe (Trockenlauf)

Zwei Testpersonen ohne Vorwissen gehen Station 4 nur mit der Figur durch,
ohne Betreuer. Gelingt die Linienverfolgung, und haben sie dabei nie den
Eindruck, einen Text lesen zu müssen, trägt das Konzept. Dazu werden Kosten
und Antwortzeit des LLM am Zähler abgelesen.
