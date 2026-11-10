/* Drehbuch Station 5: Grand Prix. Quelle: master, Station 05 (Parcours first, 09.11.2026) und
   microbit/stations/05-grand-prix/README.md (Zählnummern 1–4, gelten bis zum Trockenlauf).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Nach dem letzten Schritt bietet die
   Maschine „Workshop abschließen ✓“ an. Ampel und Laser-Stopp stehen schon im Projekt Linie. */
DREHBUCH[5] = {name:"Grand Prix", min:30, badge:"Champion", titel:"Finale: Grand Prix", schritte:[
  { id:"strecke",
    nachrichten:[
      "Das Finale! Lest die Strecke, stellt euren Roboter darauf ein, bringt ihn ins Ziel.",
      "Gummibärchen gibt es für alle, die Zeit ist nur zum Vergleichen.",
      "Erst planen, dann fahren: Überlegt an jeder Nummer, was der Roboter dort tun soll.",
      {karte:"k5-gpmap"}
    ],
    chips:[ "Was bedeuten die roten Nummern?", "Wo ist rechts für den Roboter?", "Was ist die Tempo-Zone?", "Wie groß ist ein Kästchen?" ],
    fertig:"Strecke gelesen ✓" },

  { id:"arten",
    nachrichten:[
      "Vier Arten von Kreuzungen, die Blöcke sind auf Englisch:",
      {karte:"k5-typen"},
      "Das Dreieck ist der Roboter, er kommt von unten. Für jede Art wählt ihr: <b>Straight</b> (geradeaus), <b>Left</b>, <b>Right</b> oder <b>Stop</b>."
    ],
    chips:[ "Was ist der Unterschied zwischen Crossroads und T-junction?", "Was heißt Intersection?", "Welche Art ist Nummer 1?" ],
    fertig:"Verstanden ✓" },

  { id:"projekt",
    nachrichten:[
      "Öffnet euer Projekt <b>Linie</b> aus Station 3 und 4: in MakeCode auf das Haus, dann <b>Meine Projekte</b>.",
      "Ampel, Not-Aus (Knopf B) und Laser-Stopp habt ihr schon. Neu kommen die Kreuzungsregeln in <kbd>wenn Knopf A geklickt</kbd>, <b>vor</b> die Ampel."
    ],
    zeig:{ "Kein Linie dabei?":[
      "Neues Roboter-Projekt starten und das Programm aus dem nächsten Schritt ganz nachbauen.",
      {karte:"makecode:vorlage"}
    ]},
    chips:[ "Wo ist das Haus?", "Wir finden das Projekt Linie nicht", "Wo ist Meine Projekte?" ],
    fertig:"Linie ist offen ✓" },

  { id:"kreuzungen",
    nachrichten:[
      "<b>Kreuzungen einstellen:</b> alle vier Regeln, auch die, die nicht vorkommen. Sie liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.",
      "<b>An Kreuzung <span class=\"gpnum\">1</span> umstellen:</b> Die grauen Blöcke liegen in <b>Grand Prix</b>. <kbd>wenn Kreuzung Nummer 1 erreicht</kbd> läuft einmal, wenn er dort ankommt.",
      {karte:"k5-kreuzungen"},
      "Die <b>???</b> findet ihr mit der Skizze heraus."
    ],
    zeig:{ "Warum auch links?":[
      "Einen Abzweig nach links gibt es nicht. Der Block steht trotzdem da: Vermisst sich der Roboter, fährt er geradeaus weiter."
    ]},
    chips:[ "Wo ist die Kategorie Grand Prix?", "Wo ist die Gruppe V3?", "Was gehört bei Kreuzung 1 hin?", "Wo kommen die Blöcke hin?" ],
    fertig:"Regeln stehen ✓" },

  { id:"melodie",
    nachrichten:[
      "<b>Siegesmelodie am Ziel:</b> <kbd>spiele Melodie</kbd> liegt bei <b>Musik</b>. Welche Nummer hat das Ziel?",
      {karte:"k5-melodie"},
      "Erster Lauf: USB-Kabel ab, Roboter auf den Start, Knopf A. Kommt er ins Ziel mit Melodie?"
    ],
    zeig:{ "Es klappt nicht":[ {karte:"k5-klemmt"} ] },
    chips:[ "Wo ist die Kategorie Musik?", "Er biegt falsch ab", "Die Melodie kommt nicht", "Welche Nummer hat das Ziel?" ],
    fertig:"Er spielt am Ziel ✓" },

  { id:"tempo",
    nachrichten:[
      "<b>Tempo-Zone.</b> Ab dem Schild „1“ fährt er langsam bis ins Ziel und zeigt dabei eine 1.",
      {karte:"k5-tempo"},
      "Testen: Nach jeder Änderung herunterladen und fahren, eine nach der anderen."
    ],
    chips:[ "Welche Nummer hat das Schild?", "Wo ist zeige Zahl?", "Er wird nicht langsamer" ],
    fertig:"Er fährt langsam ✓" },

  { id:"lauf",
    nachrichten:[
      "Das Rennen: Start immer mit <b>Knopf A</b>, erst mit <b>Speed 1 oder 2</b>. Schneller erst nach einem sauberen Lauf.",
      "An einer <b>Kiste</b> ist der Lauf vorbei: zurück an den Start, noch einmal.",
      "In der Tempo-Zone muss eine <b>1</b> auf dem Display stehen, sonst seid ihr <b>geblitzt</b>: plus 3 Sekunden."
    ],
    zeig:{ "Es klappt nicht":[ {karte:"k5-klemmt"} ], "Wer gewinnt?":[
      "Die Zeit wird gestoppt, damit ihr vergleichen könnt. Gummibärchen bekommen <b>alle</b>."
    ]},
    chips:[ "Er verlässt die Linie in Kurven", "Er fährt in die Kiste", "Wir sind geblitzt worden", "Dürfen wir schneller fahren?" ],
    fertig:"Wir sind durch!" },

  { id:"profi", bonus:true, titel:"Pro-Ziel",
    nachrichten:[
      "Für Profis: Hinter dem Ziel liegt ein zweites, dazwischen eine Lücke ohne Linie. Der Plan:",
      {karte:"k5-plan"},
      "<b>Blinker:</b> vor dem Abbiegen das Licht auf der richtigen Seite, wie beim Auto."
    ],
    zeig:{
      "Er macht nach dem Sprung, was er will?":[
        "Was passiert mit euren Einstellungen, wenn ihr die Linienverfolgung ausschaltet?"
      ],
      "Die Melodie kommt schon am Ziel 4?":[
        "Woher weiß euer Programm, dass er schon gesprungen ist? Aus einer <b>Variablen</b>: ein Merkzettel, auf den ein Teil des Programms schreibt und ein anderer liest.",
        "Bei <b>Variablen</b> auf <kbd>Erstelle eine Variable…</kbd>, Name <b>gesprungen</b>.",
        {karte:"k5-variable"},
        "Nach dem Sprung setzt ihr <b>gesprungen</b> auf <b>wahr</b>. Die Melodie spielt nur, wenn <b>gesprungen</b> wahr ist."
      ]
    },
    chips:[ "Wo ist PID Distance Control?", "Er springt nicht über die Lücke", "Wie prüfe ich, ob der Weg frei ist?" ],
    fertig:"Pro-Ziel geschafft ✓" },

  { id:"abschluss",
    nachrichten:[
      "Ihr seid im Ziel! Holt euch eure Gummibärchen, die gibt es für alle.",
      "So einen Roboter selbst haben? Was du brauchst, steht in der <b>Stückliste</b> oben in der Leiste.",
      "<button class=\"btn sec\" type=\"button\" data-go=\"teile\">Stückliste öffnen</button>",
      {karte:"k5-final"}
    ],
    chips:[ "Wo gibt es die Gummibärchen?", "Was kostet so ein Roboter?", "Dürfen wir noch einmal fahren?" ],
    fertig:"Geschafft ✓" }
]};
