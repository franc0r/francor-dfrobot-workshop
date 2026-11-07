/* Drehbuch Station 2: micro:bit allein. Quelle: src/stations/02-microbit-allein.html (master).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Der Simulator (k2-mbsim) wandert
   in jedem Übungsschritt mit nach unten, damit er neben der Anleitung steht. */
DREHBUCH[2] = {name:"micro:bit allein", min:15, badge:"Pixelkünstler", titel:"Der micro:bit allein", schritte:[
  { id:"projekt",
    nachrichten:[
      "Bevor Räder ins Spiel kommen: Der micro:bit ist schon allein ein vollständiger Computer.",
      "Auf vier mal fünf Zentimetern sitzen 25 LEDs, zwei Knöpfe, ein Lautsprecher, ein Mikrofon und Funk. Dazu ein Sensor, der merkt, wie ihr ihn bewegt.",
      "Zuerst startet ihr ein neues Projekt. Sonst blinkt euer Herz aus Station 1 weiter und überschreibt alles, was ihr jetzt baut.",
      {karte:"makecode:neu"}
    ],
    chips:[ "Müssen wir das alte Projekt speichern?", "Ist unser Herz dann weg?", "Wo ist der Knopf für ein neues Projekt?" ],
    fertig:"Neues Projekt offen ✓" },

  { id:"simulator",
    nachrichten:[
      "Der Bildschirm des micro:bit sind 25 rote LEDs in fünf Reihen. Jedes Bild, jeder Buchstabe, jede Zahl entsteht daraus.",
      "Probiert es zuerst hier im Simulator, Reiter <b>1 · Zeichnen</b>. Klickt die Punkte einfach an.",
      {karte:"k2-mbsim"}
    ],
    zeig:{ "Warum ist das clever?":[
      "25 Lämpchen, jedes an oder aus: Das sind über 33 Millionen mögliche Bilder.",
      "Aus zwei Zuständen wird alles gebaut, was ein Computer kann. Genau das meint das Wort <em>digital</em>."
    ]},
    chips:[ "Wie mache ich einen Punkt wieder aus?", "Kann ich auch Buchstaben malen?", "Wo ist Reiter 1?" ],
    fertig:"Bild gemalt ✓" },

  { id:"bild",
    nachrichten:[
      "Dann in MakeCode: <kbd>zeige LEDs</kbd> liegt in <b>Grundlagen</b>. Zieht ihn in <kbd>beim Start</kbd> und klickt euer Bild.",
      "Findet ihr ihn nicht, tippt oben ins Suchfeld <kbd>zeige LEDs</kbd>.",
      "Testen: Herunterladen. Steht euer Bild auf dem micro:bit?"
    ],
    chips:[ "Wo ist zeige LEDs?", "Wo ist beim Start?", "Kann ich auch Buchstaben malen?", "Das Bild kommt nicht auf den micro:bit" ],
    fertig:"Bild steht ✓" },

  { id:"ereignis",
    nachrichten:[
      "Bis jetzt läuft euer Programm einfach von oben nach unten durch. Jetzt kommt ein Block, der <em>wartet</em>, bis etwas passiert.",
      "Solche Blöcke heißen Ereignisse. Probiert es im Simulator, Reiter <b>2 · Knöpfe</b>.",
      {karte:"k2-mbsim"}
    ],
    chips:[ "Was ist ein Ereignis?", "Wo ist Reiter 2?", "Im Simulator passiert nichts" ],
    fertig:"Im Simulator probiert ✓" },

  { id:"knoepfe",
    nachrichten:[
      "<kbd>wenn Knopf A geklickt</kbd> liegt in <b>Eingabe</b>, <kbd>zeige Symbol</kbd> und <kbd>Bildschirminhalt löschen</kbd> in <b>Grundlagen</b>.",
      {karte:"k2-knoepfe"},
      "Legt Ereignis-Blöcke <b>frei</b> ins Programmierfenster, nicht in <kbd>beim Start</kbd> oder <kbd>dauerhaft</kbd>. Sie warten selbst auf ihren Moment.",
      "Testen: Herunterladen, Knopf A drücken, dann Knopf B."
    ],
    zeig:{ "Stören die sich nicht?":[
      "Beide Ereignisse liegen gleichzeitig im Programm und stören sich nicht. Der micro:bit merkt sich beide und macht das Passende, sobald der Knopf kommt."
    ]},
    chips:[ "Welcher Knopf ist A?", "Wo ist wenn Knopf A geklickt?", "Muss das in dauerhaft rein?", "Das Herz geht nicht mehr weg" ],
    fertig:"Knöpfe gehen ✓" },

  { id:"neigen",
    nachrichten:[
      "Im micro:bit sitzt ein Beschleunigungssensor. Derselbe Bauteiltyp lässt euer Handy das Bild drehen.",
      "Er merkt, wie ihr den micro:bit haltet. Daraus macht der micro:bit fertige Ereignisse wie <kbd>Logo nach oben</kbd> oder <kbd>geschüttelt</kbd>.",
      "Probiert es im Simulator, Reiter <b>3 · Neigen</b>.",
      {karte:"k2-mbsim"}
    ],
    chips:[ "Was ist ein Beschleunigungssensor?", "Wo ist Reiter 3?", "Im Simulator kommt kein Pfeil" ],
    fertig:"Im Simulator gekippt ✓" },

  { id:"pfeile",
    nachrichten:[
      "In <b>Eingabe</b> gibt es nur den Block <kbd>wenn geschüttelt</kbd>. Zieht ihn herein und stellt im Auswahlmenü <b>Logo nach oben</b> ein.",
      "Für jedes Ereignis braucht ihr einen eigenen Block. <kbd>zeige Pfeil</kbd> liegt in <b>Grundlagen</b>, ganz unten: ein Stück nach unten scrollen.",
      {karte:"k2-neigen"},
      "Testen: Herunterladen, den micro:bit nach vorn und hinten kippen, dann schütteln."
    ],
    zeig:{ "Es klappt nicht":[
      "Kein Pfeil? Kippt deutlich, fast senkrecht, und schüttelt kräftig und ruckartig statt sanft zu wedeln.",
      {karte:"k2-klemmt"}
    ]},
    chips:[ "Wo ist zeige Pfeil?", "Wo stelle ich Logo nach oben ein?", "Beim Kippen kommt kein Pfeil", "Der Totenkopf kommt nicht" ],
    fertig:"Pfeile und Totenkopf ✓" },

  { id:"grenze",
    nachrichten:[
      "Und woher weiß der micro:bit, dass das Logo oben ist? Schaut im Simulator unter das Gerät: Da steht die Zahl, die der Sensor wirklich liefert.",
      {karte:"k2-tabelle"},
      "Jetzt kommt der wichtigste Satz des Workshops: Ein Sensor liefert keine Wörter, sondern <b>Zahlen</b>.",
      "„Logo nach oben“ steht nirgends im Sensor. Der micro:bit vergleicht die Zahl mit einer Grenze, und die haben seine Erfinder festgelegt: 200.",
      "Beim Roboter legt ihr die Grenze gleich selbst fest, wenn er Schwarz von Weiß unterscheiden soll."
    ],
    chips:[ "Wo sehe ich die Zahl y?", "Warum gerade 200?", "Was passiert zwischen -200 und 200?", "Kann ich die Grenze ändern?" ],
    fertig:"Verstanden ✓" },

  { id:"quiz",
    nachrichten:[
      "Kontrollfrage. Stellt euch vor, ihr habt schon einen Würfel gebaut:",
      {karte:"k2-quiz"}
    ],
    chips:[ "Was heißt zufällig?", "Wo ist wähle eine zufällige Zahl?", "Warum zeigt er immer dieselbe Zahl?" ],
    fertig:"Beantwortet ✓" },

  { id:"wuerfel", bonus:true, titel:"Würfel",
    nachrichten:[
      "Team-Challenge: Macht aus dem Schütteln einen <b>Würfel</b>. Statt Ton und Totenkopf zeigt der micro:bit eine zufällige Zahl.",
      {karte:"k2-wuerfel"},
      "Den lila Block findet ihr unter <b>Mathematik</b>. Er beginnt bei <b>0</b>: Stellt die erste Zahl auf <b>1</b>, sonst würfelt er auch mal eine Null.",
      "Testen: Herunterladen und dreimal schütteln. Kommen verschiedene Zahlen?"
    ],
    zeig:{ "Noch Zeit?":[
      "Lasst vor der Zahl kurz ein Herz erscheinen, als kleinen Trommelwirbel.",
      "Geschafft? Dann zeigt es eurem Betreuer."
    ], "Es klappt nicht":[
      "Zahlen über 9 laufen als Laufschrift durch. Für den Würfel reicht 1 bis 6, das passt auf einen Blick.",
      {karte:"k2-klemmt"}
    ]},
    chips:[ "Wo ist Mathematik?", "Er zeigt immer dieselbe Zahl", "Wie baue ich das Herz davor ein?", "Die Zahl läuft als Schrift durch" ],
    fertig:"Würfel läuft ✓" }
]};
