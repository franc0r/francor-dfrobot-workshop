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
      "Vorne sitzt ein kleines Lidar mit 8 mal 8 = <b>64 Laserstrahlen</b>. Es misst den Abstand in Millimetern.",
      "Seine lila Blöcke liegen in der Kategorie <b>Matrix LiDAR Entfernung</b>: einmal einschalten in <kbd>beim Start</kbd>, in <kbd>dauerhaft</kbd> erst Messwerte abholen, dann den Abstand nach vorn abfragen.",
      {karte:"k4-laser"}
    ],
    chips:[ "Wo ist Matrix LiDAR Entfernung?", "Was heißt 0x33?", "Wie weit sieht der Laser?", "Was ist ein Lidar?" ],
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
