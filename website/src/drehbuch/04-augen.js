/* Drehbuch Station 4: Augen. Quelle: src/stations/04-augen.html (master).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Kein Sensorbild in src/assets,
   deshalb erklärt der Schritt „sensor“ nur mit Blasen. */
DREHBUCH[4] = {name:"Augen", min:18, badge:"Spurhalter", titel:"Der Roboter bekommt Augen", schritte:[
  { id:"projekt",
    nachrichten:[
      "Bis jetzt habt ihr dem Roboter gesagt, <em>was</em> er tun soll. Ab jetzt sagt ihr ihm, <em>worauf er achten</em> soll.",
      "Das ist der Moment, in dem aus einem Fahrzeug ein Roboter wird.",
      "Startet zuerst ein neues Roboter-Projekt. Sonst fahren eure Blöcke aus Station 3 weiter und stören die Linienverfolgung.",
      {karte:"makecode:vorlage"},
      "Gebt dem Projekt unten neben <b>Herunterladen</b> den Namen <b>Linie</b>. In Station 6 braucht ihr es wieder."
    ],
    chips:[ "Ist unser Fahren-Projekt dann weg?", "Wo gebe ich den Namen ein?", "Warum schon wieder ein neues Projekt?" ],
    fertig:"Projekt Linie ist offen ✓" },

  { id:"sensor",
    nachrichten:[
      "Unter dem Roboter sitzen fünf winzige Lampen, jede mit einem Lichtmesser daneben. Die Lampe leuchtet nach unten, der Messer schaut, wie viel Licht zurückkommt.",
      "<b>Weiß spiegelt viel Licht zurück, Schwarz schluckt es.</b> Der Sensor liefert keine Farbe, sondern eine Zahl.",
      "Weißes Papier gibt ungefähr <b>3800</b>, das heißt „hier ist keine Linie“. Schwarzes Klebeband gibt ungefähr <b>2700</b>, das heißt „hier ist meine Spur“."
    ],
    chips:[ "Warum ist Schwarz die kleinere Zahl?", "Wo sitzen die Sensoren?", "Was misst der Sensor genau?" ],
    fertig:"Verstanden ✓" },

  { id:"kalibrieren",
    nachrichten:[
      "Jeder Raum hat anderes Licht. Damit der Roboter weiß, was hier „schwarz“ heißt, lernt er das einmal: Das nennt man <b>kalibrieren</b>.",
      "Bei euren Robotern hat das der Betreuer schon gemacht. Nur wenn eurer die Linie nicht findet, kalibriert ihr neu."
    ],
    zeig:{ "Wie kalibriere ich neu?":[
      "Alle fünf Sensoren auf die schwarze Linie stellen und einschalten.",
      "Dann die Taste <b>Calc-Key</b> etwa 2 Sekunden halten, bis es blinkt."
    ]},
    chips:[ "Was heißt kalibrieren?", "Müssen wir selbst kalibrieren?", "Wo ist die Calc-Key?" ],
    fertig:"Alles klar ✓" },

  { id:"bloecke",
    nachrichten:[
      "Im Maqueen steckt das Linienfolgen schon fertig drin, in fünf Geschwindigkeitsstufen. Stufe 1 ist gemütlich, Stufe 5 ist mutig.",
      "Die Blöcke liegen in der Maqueen-Kategorie unter <b>… mehr</b>, Gruppe <b>V3</b>.",
      "Sie sind auf Englisch: <b>Line patrolling</b> heißt „Linie abfahren“, <b>ON</b> ist an, <b>OFF</b> ist aus. <b>Speed</b> ist die Geschwindigkeit.",
      {karte:"k4-bloecke"},
      "Warum nicht alles in <kbd>beim Start</kbd>? Weil der Roboter sonst schon losfährt, während ihr ihn noch auf die Linie stellt."
    ],
    chips:[ "Wo ist … mehr?", "Wo ist die Gruppe V3?", "Wo stelle ich Speed ein?", "Warum mit Knopf A?" ],
    fertig:"Gebaut ✓" },

  { id:"fahren",
    nachrichten:[
      "Jetzt kommt der große Moment. Programm herunterladen, USB-Kabel abziehen.",
      "Roboter auf den Start stellen, mit der Mitte über der schwarzen Linie, und einschalten.",
      "<b>Knopf A</b> drücken: Er fährt. <b>Knopf B</b> hält ihn an."
    ],
    zeig:{ "Es klappt nicht":[
      "Zeigt der micro:bit nur ein blinkendes <b>X</b>? Dann antwortet der Roboter nicht.",
      "Prüft beide Schalter und ob der micro:bit richtig im Schlitz steckt.",
      {karte:"k4-klemmt"}
    ]},
    chips:[ "Der micro:bit zeigt nur ein X", "Er fährt von der Linie runter", "Er fährt gar nicht los", "Wo ist der Block Line patrolling?" ],
    fertig:"Er fährt!" },

  { id:"licht",
    nachrichten:[
      "Die Linienverfolgung läuft im Hintergrund weiter, bis ihr sie mit <b>OFF</b> stoppt. Der micro:bit kann nebenher noch etwas anderes tun.",
      "Zum Beispiel eine Lichtshow:",
      {karte:"k4-licht"},
      "Testen: Herunterladen, Roboter auf die Linie, Knopf A. Fährt er und blinkt dabei?"
    ],
    chips:[ "Wo ist RGB Car Lights?", "Die Lichter blinken nicht", "Kann ich andere Farben nehmen?", "Er fährt nicht mehr, seit es blinkt" ],
    fertig:"Fährt und blinkt ✓" },

  { id:"aha",
    nachrichten:[
      "Und jetzt der eigentliche Aha-Moment: Ihr habt dem Roboter <b>nicht gesagt, wo er langfahren soll</b>. Ihr habt ihm gesagt, worauf er achten muss.",
      "Legt die Strecke anders, er fährt sie trotzdem. Das ist der Unterschied zwischen einer Maschine und einem Roboter.",
      "Heißt euer Projekt schon <b>Linie</b>? Sonst jetzt unten neben <b>Herunterladen</b> umbenennen."
    ],
    chips:[ "Was ist der Unterschied zur Maschine?", "Wo benenne ich das Projekt um?", "Fährt er auch eine andere Strecke?" ],
    fertig:"Projekt heißt Linie ✓" },

  { id:"quiz",
    nachrichten:[
      "Eine Kontrollfrage noch, dann gehört das Abzeichen euch.",
      {karte:"k4-quiz"}
    ],
    chips:[ "Welche Zahl heißt Schwarz?", "Wie viele Sensoren hat er?", "Was ist eine Kreuzung?" ],
    fertig:"Beantwortet ✓" }
]};
