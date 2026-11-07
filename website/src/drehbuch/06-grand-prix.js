/* Drehbuch Station 6: Grand Prix. Quelle: src/stations/06-grand-prix.html (master) und
   microbit/stations/06-grand-prix/README.md (Zählnummern 1–4, gelten bis zum Trockenlauf).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Nach dem letzten Schritt bietet die
   Maschine „Workshop abschließen ✓“ an. */
DREHBUCH[6] = {name:"Grand Prix", min:30, badge:"Champion", titel:"Finale: Grand Prix", schritte:[
  { id:"strecke",
    nachrichten:[
      "Das Finale! Lest die Strecke, stellt euren Roboter darauf ein und bringt ihn ins Ziel.",
      "Am Ziel gibt es Gummibärchen, für alle. Die Zeit stoppen wir nur zum Vergleichen.",
      "Zum Ausprobieren ist keine Zeit. Plant deshalb vorher: Überlegt an jeder Nummer, was der Roboter dort tun soll.",
      {karte:"k6-gpmap"}
    ],
    chips:[ "Was bedeuten die roten Nummern?", "Wo ist rechts für den Roboter?", "Was ist die Tempo-Zone?", "Wie groß ist ein Kästchen?" ],
    fertig:"Strecke gelesen ✓" },

  { id:"arten",
    nachrichten:[
      "Der Roboter kennt vier Arten von Kreuzungen. Die Blöcke dafür sind auf Englisch:",
      {karte:"k6-typen"},
      "Das Dreieck ist der Roboter, er kommt von unten. Für jede Art stellt ihr ein, was er dort tun soll.",
      "Im Auswahlfeld stehen <b>Straight</b> (geradeaus), <b>Left</b> (links), <b>Right</b> (rechts) und <b>Stop</b> (anhalten)."
    ],
    chips:[ "Was ist der Unterschied zwischen Crossroads und T-junction?", "Was heißt Intersection?", "Welche Art ist Nummer 1?" ],
    fertig:"Verstanden ✓" },

  { id:"projekt",
    nachrichten:[
      "Ihr arbeitet in eurem Projekt aus Station 4 weiter. In MakeCode oben auf das Haus klicken, unter <b>Meine Projekte</b> das Projekt <b>Linie</b> öffnen.",
      "Kein „Linie“ dabei? Dann startet ein neues Roboter-Projekt und baut das Programm ganz nach.",
      {karte:"makecode:vorlage"}
    ],
    chips:[ "Wo ist das Haus?", "Wir finden das Projekt Linie nicht", "Wo ist Meine Projekte?" ],
    fertig:"Linie ist offen ✓" },

  { id:"aufraeumen",
    nachrichten:[
      "Löscht zuerst den <kbd>dauerhaft</kbd>-Block mit dem Rot-Blau-Blinken. Zieht ihn einfach nach links in die Blockliste.",
      "Der Rest darf bleiben. <b>Line Following Settings Speed</b> in <kbd>beim Start</kbd> könnt ihr löschen oder stehen lassen: Knopf A stellt das Tempo sowieso neu ein.",
      "<kbd>wenn Knopf B geklickt</kbd> mit <b>Line patrolling OFF</b> bleibt euer Not-Aus."
    ],
    zeig:{ "Warum löschen?":[
      "Er würde später eure Startampel überschreiben und den Laser bremsen."
    ]},
    chips:[ "Wie lösche ich einen Block?", "Welcher dauerhaft-Block ist gemeint?", "Dürfen wir Speed stehen lassen?" ],
    fertig:"Aufgeräumt ✓" },

  { id:"kreuzungen",
    nachrichten:[
      "Die Regeln für die Kreuzungen stehen in <kbd>wenn Knopf A geklickt</kbd>, <b>vor</b> <b>Line patrolling ON</b>. So startet jeder Druck auf A sauber von vorn.",
      "Setzt alle vier Regeln, auch die, die auf der Strecke nicht vorkommen. Die Blöcke liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.",
      "An Kreuzung <span class=\"gpnum\">1</span> stellt ihr um. Die grauen Blöcke liegen in der Kategorie <b>Grand Prix</b>: <kbd>wenn Kreuzung Nummer 1 erreicht</kbd> läuft einmal, sobald der Roboter dort ankommt.",
      {karte:"k6-kreuzungen"},
      "Die <b>???</b> findet ihr mit der Skizze heraus."
    ],
    zeig:{ "Warum auch links?":[
      "Einen Abzweig nach links gibt es auf der Strecke nicht. Der Block steht trotzdem da: Falls der Roboter sich einmal vermisst, fährt er geradeaus weiter."
    ]},
    chips:[ "Wo ist die Kategorie Grand Prix?", "Wo ist die Gruppe V3?", "Was gehört bei Kreuzung 1 hin?", "Wo kommen die Blöcke hin?" ],
    fertig:"Regeln stehen ✓" },

  { id:"melodie",
    nachrichten:[
      "Fehlt noch die <b>Siegesmelodie am Ziel</b>. Den Block <kbd>spiele Melodie</kbd> findet ihr bei <b>Musik</b>.",
      {karte:"k6-melodie"},
      "Welche Nummer hat das Ziel? Schaut auf die Skizze.",
      "Testen: Erster Lauf! Herunterladen, USB-Kabel ab, Roboter auf den Start, Knopf A.",
      "Kommt er ins Ziel und spielt seine Melodie?"
    ],
    zeig:{ "Es klappt nicht":[ {karte:"k6-klemmt"} ] },
    chips:[ "Wo ist die Kategorie Musik?", "Er biegt falsch ab", "Die Melodie kommt nicht", "Welche Nummer hat das Ziel?" ],
    fertig:"Er spielt am Ziel ✓" },

  { id:"tempo",
    nachrichten:[
      "Der erste Lauf hat geklappt? Dann baut eins nach dem anderen dazu.",
      "<b>Tempo-Zone:</b> Ab dem Schild „1“ fährt er langsam, bis ins Ziel. Zur Kontrolle zeigt er dabei eine 1 an.",
      {karte:"k6-tempo"},
      "Testen: Nach jeder Änderung herunterladen und fahren. Eine Änderung nach der anderen, dann wisst ihr, was gewirkt hat."
    ],
    chips:[ "Welche Nummer hat das Schild?", "Wo ist zeige Zahl?", "Er wird nicht langsamer" ],
    fertig:"Er fährt langsam ✓" },

  { id:"ampel",
    nachrichten:[
      "<b>Startampel:</b> Rot, gelb, grün, dann geht es los.",
      "Die fünf neuen Blöcke kommen in <kbd>wenn Knopf A geklickt</kbd>, direkt über <b>Line patrolling ON</b>. Das steht schon da.",
      {karte:"k6-ampel"}
    ],
    chips:[ "Wo ist RGB Car Lights?", "Wo ist pausiere?", "Die Ampel leuchtet nicht" ],
    fertig:"Ampel leuchtet ✓" },

  { id:"laserstopp",
    nachrichten:[
      "<b>Vor der Kiste anhalten:</b> Den Laser kennt ihr aus Station 5. Er kommt in einen <b>neuen</b> <kbd>dauerhaft</kbd>-Block.",
      "Den alten mit dem Blinken habt ihr am Anfang gelöscht, weil er die Laserabfrage bremst.",
      {karte:"k6-laser"}
    ],
    chips:[ "Wo ist Matrix LiDAR Entfernung?", "Er hält nicht vor der Kiste", "Er bleibt stehen, obwohl nichts im Weg ist" ],
    fertig:"Er hält vor der Kiste ✓" },

  { id:"lauf",
    nachrichten:[
      "Jetzt das Rennen. Gestartet wird immer mit <b>Knopf A</b>.",
      "Fangt mit <b>Speed 1 oder 2</b> an. Schneller erst, wenn ein Lauf sauber geklappt hat.",
      "Erreicht der Roboter eine <b>Kiste</b>, ist der Lauf vorbei. Tragt ihn zurück an den Start und versucht es noch einmal.",
      "In der Tempo-Zone muss auf dem Display eine <b>1</b> stehen. Sonst seid ihr <b>geblitzt</b>: plus 3 Sekunden."
    ],
    zeig:{ "Es klappt nicht":[ {karte:"k6-klemmt"} ], "Wer gewinnt?":[
      "Die Zeit wird gestoppt, damit ihr vergleichen könnt. Gummibärchen bekommen <b>alle</b>."
    ]},
    chips:[ "Er verlässt die Linie in Kurven", "Er fährt in die Kiste", "Wir sind geblitzt worden", "Dürfen wir schneller fahren?" ],
    fertig:"Wir sind durch!" },

  { id:"profi", bonus:true, titel:"Pro-Ziel",
    nachrichten:[
      "Für Profis: Hinter dem Ziel liegt noch ein zweites Ziel. Dazwischen ist eine Lücke ohne Linie.",
      "So ist der Plan:",
      {karte:"k6-plan"},
      "Der Block hat drei Felder: die Richtung, die Strecke in cm und ob man ihn unterbrechen darf."
    ],
    zeig:{
      "Noch Zeit?":[
        "<b>Blinker:</b> Lasst vor dem Abbiegen das Licht auf der richtigen Seite leuchten, wie beim Auto."
      ],
      "Er macht nach dem Sprung, was er will?":[
        "Was passiert mit euren Einstellungen, wenn ihr die Linienverfolgung ausschaltet?"
      ],
      "Die Melodie kommt schon am Ziel 4?":[
        "Woher weiß euer Programm, dass der Roboter schon gesprungen ist?",
        "Wie beim Pausenknopf in Station 5: Merkt es euch in einer Variablen, zum Beispiel <b>gesprungen</b>."
      ]
    },
    chips:[ "Wo ist PID Distance Control?", "Er springt nicht über die Lücke", "Wie prüfe ich, ob der Weg frei ist?" ],
    fertig:"Pro-Ziel geschafft ✓" },

  { id:"abschluss",
    nachrichten:[
      "Ihr seid im Ziel! Holt euch eure Gummibärchen, die gibt es für alle.",
      "Die Zeit war nur zum Vergleichen. Hier gewinnt jedes Team, das ins Ziel kommt."
    ],
    chips:[ "Wo gibt es die Gummibärchen?", "Wie schnell waren die anderen?", "Dürfen wir noch einmal fahren?" ],
    fertig:"Gummibärchen geholt ✓" },

  { id:"alltag",
    nachrichten:[
      "Wo das, was ihr heute gebaut habt, wirklich fährt: Der Linienfolger ist die Technik hinter <b>Lagerrobotern</b> bei großen Versandhändlern.",
      "Der Bremsassistent steckt so ähnlich in fast jedem Neuwagen.",
      "Und der Regelkreis „wahrnehmen – entscheiden – handeln“ ist derselbe, egal ob im Staubsauger oder im Marsrover.",
      {karte:"k6-final"}
    ],
    chips:[ "Was ist ein Lagerroboter?", "Was ist ein Bremsassistent?", "Was ist ein Regelkreis nochmal?" ],
    fertig:"Geschafft ✓" }
]};
