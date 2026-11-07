/* Drehbuch Station 3: Fahrschule. Quelle: src/stations/03-fahrschule.html (master).
   Schema siehe maskottchen.js (Abschnitt Gespräch). */
DREHBUCH[3] = {name:"Fahrschule", min:14, badge:"Fahrlehrer", titel:"Erst denken, dann fahren", schritte:[
  { id:"einsetzen",
    nachrichten:[
      "Jetzt bekommt euer micro:bit Räder.",
      "Steckt ihn in den Schlitz am Roboter, <b>mit den 25 Lämpchen nach vorn</b>. Schaut ihr von vorn auf den Roboter, seht ihr alle 25.",
      {karte:"k3-mqinsert"},
      "Dann kommen <b>beide</b> Schalter auf ON: einer am Akkubrett, einer an der Bodenplatte. Von vorn gesehen sitzen beide links.",
      "Ohne beide Schalter passiert gar nichts."
    ],
    chips:[ "Wie herum kommt der micro:bit rein?", "Wo sind die Schalter?", "Der Roboter leuchtet nicht", "Wo ist das Akkubrett?" ],
    fertig:"Steckt, beide Schalter an ✓" },

  { id:"vorlage",
    nachrichten:[
      "MakeCode kennt den Maqueen erst, wenn seine Block-Sammlung geladen ist. Dafür gibt es ein <b>Vorlagenprojekt</b>, in dem sie schon drinsteckt.",
      "Klickt auf den Knopf. Das Roboter-Projekt geht in einem neuen Tab auf.",
      {karte:"makecode:vorlage"},
      "Links seht ihr jetzt eine neue Kategorie <b>Maqueen Plus V2</b>. Da liegen alle Roboter-Blöcke.",
      "Gebt dem Projekt unten neben <b>Herunterladen</b> den Namen <b>Fahren</b>."
    ],
    zeig:{ "Wie kommen die Blöcke da rein?":[
      "Nur zum Lesen: Unten links übers Zahnrad, dann <b>Erweiterungen</b>, nach <kbd>dfrobot</kbd> suchen und <b>DFRobot_MaqueenPlus_V2</b> wählen. Die heißt noch „V2“, kann aber alles von eurem V3.",
      "Genau das steckt schon in eurer Vorlage. Bitte heute nicht anklicken: Hier gibt es kein Internet, das Nachladen würde nicht klappen."
    ]},
    chips:[ "Wo ist die Kategorie Maqueen Plus V2?", "Der Knopf macht nichts", "Wo gebe ich den Namen ein?" ],
    fertig:"Vorlage ist offen ✓" },

  { id:"simulator",
    nachrichten:[
      "Profis testen ihren Code, bevor er auf die Hardware geht. Sonst fährt der Roboter vom Tisch.",
      "Löst hier im Simulator die Parcours <b>1</b> und <b>2</b>. Klickt links auf Bausteine, dann auf <b>Ausführen</b>.",
      {karte:"k3-sim"},
      "Parcours <b>3</b> ist der Bonus für Schnelle. Da hilft euch eine Schleife.",
      "Danach fahrt ihr dasselbe in echt."
    ],
    chips:[ "Wie lösche ich einen Baustein?", "Der Roboter fährt gegen die Wand", "Wie komme ich zu Parcours 2?", "Was macht die Schleife?" ],
    fertig:"Parcours 1 und 2 geschafft ✓" },

  { id:"motoren",
    nachrichten:[
      "Der echte Maqueen kennt keine Felder. Er kennt <b>Geschwindigkeit</b> von 0 bis 255 und <b>Zeit</b>.",
      "Aus „fahre 3 Felder“ wird also: fahren, warten, stoppen.",
      {karte:"k3-motor"},
      "<kbd>initialisiere Maqueen Plus V2</kbd> gehört in <b>jedes</b> Roboterprogramm, ganz oben in <kbd>beim Start</kbd>. In der Vorlage steht er schon: nicht löschen.",
      "Mit ihm fragt der micro:bit beim Roboter an: „Bist du da?“ Ein blinkendes <b>X</b> heißt keine Antwort, ein <b>Haken</b> heißt verbunden.",
      "Zahlengefühl: Unter etwa <b>30</b> bewegt sich nichts, da ist der Motor zu schwach. 1000 ms sind eine Sekunde."
    ],
    chips:[ "Wo ist steuere beide Räder?", "Der micro:bit zeigt nur ein X", "Wo ist pausiere?", "Warum nicht Geschwindigkeit 255?" ],
    fertig:"Gebaut ✓" },

  { id:"aufbocken",
    nachrichten:[
      "Achtung, bevor ihr herunterladet: Stellt den Roboter auf eine kleine Schachtel oder eine Rolle Klebeband. Die Räder müssen in der Luft hängen, wie bei einem Auto in der Werkstatt.",
      "Jetzt herunterladen. Drehen sich beide Räder eine Sekunde lang?",
      "Erst wenn alles stimmt: USB-Kabel ab, Roboter auf den Boden, echt fahren.",
      "Das gilt ab jetzt für <b>jedes neue Programm</b>: erst aufbocken, dann fahren."
    ],
    zeig:{ "Es klappt nicht":[
      "Blinkt ein <b>X</b>? Dann antwortet der Roboter nicht. Prüft beide Schalter und ob der micro:bit richtig im Schlitz steckt.",
      {karte:"k3-klemmt"}
    ]},
    chips:[ "Die Räder drehen sich nicht", "Der micro:bit zeigt nur ein X", "Er fährt einen Bogen", "Nur ein Rad dreht sich" ],
    fertig:"Räder drehen sich ✓" },

  { id:"drehen",
    nachrichten:[
      "Der Maqueen hat kein Lenkrad. Er dreht, indem die beiden Räder <em>unterschiedlich schnell</em> laufen.",
      "Läuft ein Rad vorwärts und das andere rückwärts, dreht er sich auf der Stelle.",
      {karte:"k3-dreh"},
      "Hängt diese Blöcke unter eure Geradeaus-Blöcke.",
      "Testen: Herunterladen. Dreht sich der aufgebockte Roboter nach rechts?"
    ],
    chips:[ "Er dreht nach links statt nach rechts", "Wo ist linkes Rad?", "Er dreht keine ganze Ecke", "Wo hänge ich die Blöcke hin?" ],
    fertig:"Er dreht ✓" },

  { id:"quadrat", bonus:true, titel:"Quadrat",
    nachrichten:[
      "Team-Challenge: Bringt euren Roboter dazu, ein <b>Quadrat</b> zu fahren und wieder am Start zu landen.",
      "<b>Tipp 1:</b> Nehmt <kbd>wenn Knopf A geklickt</kbd> statt <kbd>beim Start</kbd>, das kennt ihr aus Station 2. Dann fährt er erst los, wenn er auf dem Boden steht und ihr drückt.",
      "<b>Tipp 2:</b> Eine Seite vom Quadrat sind die Geradeaus-Blöcke plus die Dreh-Blöcke, und das 4-mal. Rechtsklick auf einen Block, dann <b>Duplizieren</b>: Das spart Arbeit.",
      "<b>Tipp 3:</b> 400 ms reichen nicht für eine ganze Ecke. Probiert Zahlen zwischen 500 und 800.",
      "Probieren, messen, korrigieren: Genau so arbeiten Ingenieure.",
      "Geschafft? Dann zeigt es eurem Betreuer."
    ],
    zeig:{ "Wir kommen nicht weiter":[
      "Hier ist ein Gerüst. Die ??? findet ihr selbst heraus.",
      {karte:"k3-quadrat"},
      "Die Schleife <kbd>-mal wiederholen</kbd> kennt ihr aus Parcours 3 im Simulator. Sie liegt in MakeCode bei den grünen <b>Schleifen</b>."
    ]},
    chips:[ "Wie viele ms für eine Ecke?", "Wo ist Duplizieren?", "Wo ist die Schleife?", "Er landet nicht am Start" ],
    fertig:"Quadrat gefahren ✓" }
]};
