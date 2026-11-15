/* Drehbuch Station 4: Reflexe. Quelle: master, Station 04 (Parcours first, 09.11.2026: nur der
   Laser-Stopp im Projekt Linie; Pausenknopf und Staubsauger sind gestrichen).
   Schema siehe maskottchen.js (Abschnitt Gespräch). */
DREHBUCH[4] = {name:"Reflexe", min:8, badge:"Bremsassistent", titel:"Wenn etwas im Weg ist: anhalten", schritte:[
  { id:"projekt",
    nachrichten:[
      "Der Roboter prüft viele Male pro Sekunde, ob der Weg frei ist, und entscheidet selbst.",
      "Kein neues Projekt: In MakeCode oben auf das Haus klicken, unter <b>Meine Projekte</b> das Projekt <b>Linie</b> öffnen."
    ],
    zeig:{ "Kein Linie dabei?":[
      "Dann startet ein neues Roboter-Projekt und baut die Blöcke aus Station 3 noch einmal nach.",
      {karte:"makecode:vorlage"}
    ]},
    chips:[ "Wo ist das Haus?", "Wir finden das Projekt Linie nicht", "Wo ist Meine Projekte?" ],
    fertig:"Linie ist offen ✓" },

  { id:"laser",
    nachrichten:[
      "Vorne sitzt ein kleines LiDAR mit 8 mal 8 = <b>64 Laserstrahlen</b>. Es misst den Abstand in Millimetern.",
      "Seine Blöcke liegen in der Kategorie <b>LiDAR</b>. <kbd>LiDAR einschalten</kbd> kommt in <kbd>beim Start</kbd>, dann misst er von selbst immer weiter.",
      "In <kbd>dauerhaft</kbd> fragt ihr nur noch den Abstand nach vorn ab.",
      {karte:"k4-laser"}
    ],
    chips:[ "Wo ist die Kategorie LiDAR?", "Misst er von selbst weiter?", "Wie weit sieht der Laser?", "Was ist ein LiDAR?" ],
    fertig:"Laser ist an ✓" },

  { id:"bedingung",
    nachrichten:[
      "Ist etwas näher als 20 cm, schaltet der Roboter die Linienverfolgung aus und leuchtet rot.",
      {karte:"k4-bedingung"},
      "Erst die Form, dann der Inhalt: Der Vergleich ist das Loch, in das der Sensor passt.",
      {karte:"k4-bauen"},
      "Testen: Roboter fährt die Linie, Hand davorhalten. Er bleibt stehen und leuchtet rot, Knopf A startet neu."
    ],
    zeig:{ "Es klappt nicht":[ {karte:"k4-klemmt"} ] },
    chips:[ "Wo ist wenn dann?", "Der Laser-Block passt nicht ins Loch", "Warum 200 und nicht 20?", "Er bremst nie" ],
    fertig:"Er bremst ✓" },

  { id:"quiz",
    nachrichten:[
      "Denkfrage, bevor es zum Rennen geht:",
      {karte:"k4-quiz"}
    ],
    chips:[ "Was macht dauerhaft nochmal?", "Was passiert in beim Start?", "Reicht nicht einmal messen?" ],
    fertig:"Beantwortet ✓" }
]};
