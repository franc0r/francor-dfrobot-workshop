/* Drehbuch Station 3: Fahrschule. Quelle: master, Station 03 (Parcours first, 09.11.2026:
   Einsetzen, Vorlage, Liniensensor, Knopf A = Ampel + Line patrolling ON, Knopf B = OFF).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Kein Motorblock, keine Schleife:
   Hier wird nur geübt, was der Grand Prix braucht. */
DREHBUCH[3] = {name:"Fahrschule", min:20, badge:"Spurhalter", titel:"Der Roboter fährt die Linie", schritte:[
  { id:"vorlage",
    nachrichten:[
      "Jetzt bekommt euer micro:bit Räder. Du sagst dem Roboter nicht, wo er langfahren soll, sondern worauf er achten soll.",
      "Klickt auf den Knopf: ein neues Projekt mit den Roboter-Blöcken, Kategorie <b>Maqueen Plus V2</b>.",
      {karte:"makecode:vorlage"},
      "Nennt es unten neben <b>Herunterladen</b> <b>Linie</b>. Ihr arbeitet bis zum Grand Prix darin."
    ],
    zeig:{ "Warum eine Vorlage?":[
      "MakeCode kennt den Maqueen erst, wenn seine Block-Sammlung geladen ist. In der Vorlage steckt sie schon drin.",
      "Bitte heute nichts nachladen: Das braucht Internet, und das ist auf der Messe langsam."
    ]},
    chips:[ "Wo ist die Kategorie Maqueen Plus V2?", "Der Knopf macht nichts", "Wo gebe ich den Namen ein?" ],
    fertig:"Projekt Linie ist offen ✓" },

  { id:"einsetzen",
    nachrichten:[
      "micro:bit in den Schlitz, <b>Lämpchen nach vorn</b>. Dann <b>beide</b> Schalter auf ON.",
      {karte:"k3-mqinsert"},
      "<kbd>initialisiere Maqueen Plus V2</kbd> steht in der Vorlage oben in <kbd>beim Start</kbd>: nicht löschen.",
      "Blinkt ein <b>X</b>, antwortet der Roboter nicht: Schalter und Sitz prüfen. <b>Haken</b> heißt verbunden."
    ],
    chips:[ "Wie herum kommt der micro:bit rein?", "Wo sind die Schalter?", "Der micro:bit zeigt nur ein X", "Der Roboter leuchtet nicht" ],
    fertig:"Steckt, beide Schalter an ✓" },

  { id:"sensor",
    nachrichten:[
      "Unten sitzen fünf Lichtmesser. <b>Weiß reflektiert viel, Schwarz schluckt das Licht.</b> Der Sensor liefert eine Zahl:",
      {karte:"k3-tabelle"},
      "Was hier „schwarz“ heißt, hat euer Roboter beim Aufbau gelernt. Das nennt man kalibrieren, der Betreuer hat es schon gemacht."
    ],
    zeig:{ "Wie kalibriere ich neu?":[
      "Alle fünf Sensoren auf Schwarz stellen, einschalten. Dann die Taste <b>Calc-Key</b> 2 Sekunden halten, bis es blinkt."
    ]},
    chips:[ "Warum ist Schwarz die kleinere Zahl?", "Wo sitzen die Sensoren?", "Was heißt kalibrieren?", "Wo ist die Calc-Key?" ],
    fertig:"Verstanden ✓" },

  { id:"bloecke",
    nachrichten:[
      "Der Linienfolger steckt fertig im Maqueen, Stufe 1 (gemütlich) bis 5 (mutig). Die Blöcke liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.",
      "Sie sind auf Englisch: <b>Line patrolling</b> heißt „Linie abfahren“, <b>Speed</b> Stufe, <b>RGB Car Lights</b> sind die Lichter.",
      {karte:"k3-bloecke"},
      "Nicht in <kbd>beim Start</kbd>: Sonst fährt er los, während ihr ihn noch hinstellt. Knopf B ist euer Not-Aus."
    ],
    chips:[ "Wo ist … mehr?", "Wo ist die Gruppe V3?", "Wo ist RGB Car Lights?", "Wo ist pausiere?" ],
    fertig:"Gebaut ✓" },

  { id:"fahren",
    nachrichten:[
      "Herunterladen, USB-Kabel abziehen. Roboter auf den Teststreifen am Boden, Mitte über der Linie, einschalten.",
      "<b>Knopf A</b>: Ampel, dann fährt er. <b>Knopf B</b> hält ihn an.",
      "Testen: Fährt er der Linie nach? Legt den Streifen anders hin."
    ],
    zeig:{ "Es klappt nicht":[
      "Zeigt der micro:bit nur ein blinkendes <b>X</b>? Dann antwortet der Roboter nicht: beide Schalter und den Sitz im Schlitz prüfen.",
      {karte:"k3-klemmt"}
    ]},
    chips:[ "Der micro:bit zeigt nur ein X", "Er fährt von der Linie runter", "Er fährt gar nicht los", "Die Ampel leuchtet nicht" ],
    fertig:"Er fährt!" },

  { id:"quiz",
    nachrichten:[
      "Eine Kontrollfrage noch, dann gehört das Abzeichen euch.",
      {karte:"k3-quiz"}
    ],
    chips:[ "Welche Zahl heißt Schwarz?", "Wie viele Sensoren hat er?", "Was ist eine Kreuzung?" ],
    fertig:"Beantwortet ✓" }
]};
