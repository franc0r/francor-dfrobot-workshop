/* Drehbuch Station 1: Erster Kontakt. Quelle: src/stations/01-erster-kontakt.html (master).
   Schema siehe maskottchen.js (Abschnitt Gespräch). */
DREHBUCH[1] = {name:"Erster Kontakt", min:13, badge:"Ersteinschalter", titel:"Erster Kontakt", schritte:[
  { id:"oeffnen",
    nachrichten:[
      "Jetzt wird es ernst: Gleich wandert Code, den ihr selbst baut, über ein Kabel in einen echten Computer.",
      "Der macht dann genau das, was ihr sagt. Nicht mehr und nicht weniger.",
      "Ihr wollt endlich an den Laptop?",
      "Ja, ihr dürft. Jetzt.",
      "Klickt auf den Knopf. MakeCode geht in einem neuen Tab auf, mit einem leeren Projekt.",
      {karte:"makecode:neu"},
      "Links stehen die Block-Kategorien, in der Mitte euer Programm, rechts eine kleine Vorschau.",
      "Einen Block zieht ihr mit gedrückter Maustaste aus einer Kategorie ins Programmierfenster. Dort rastet er ein wie ein Puzzleteil.",
      "Zwei Blöcke liegen schon da: <kbd>beim Start</kbd> läuft genau einmal, <kbd>dauerhaft</kbd> läuft immer wieder, ohne Ende. Das probiert ihr gleich selbst aus."
    ],
    zeig:{ "So bedient ihr MakeCode":[
      "<b>Block holen:</b> aus der Kategorie ziehen. Oder oben ins Suchfeld den Namen tippen.",
      "<b>Block löschen:</b> anklicken und <kbd>Entf</kbd> drücken. Oder einfach zurück nach links ziehen.",
      "<b>Zahl ändern:</b> auf die Zahl klicken und eintippen, zum Beispiel 300."
    ]},
    chips:[ "Der Knopf macht nichts", "Müssen wir uns anmelden?", "Wo sind die Blöcke?", "Wie lösche ich einen Block?" ],
    fertig:"MakeCode ist offen ✓" },

  { id:"lebenszeichen",
    nachrichten:[
      "Euer erstes Programm ist ein Lebenszeichen. Ihr baut zwei Blockgruppen: eine für <b>einmal</b>, eine für <b>immer wieder</b>.",
      "Alles, was ihr braucht, liegt in der Kategorie <b>Grundlagen</b>.",
      {karte:"k1-start"},
      {karte:"k1-herz"},
      "<kbd>beim Start</kbd> zeigt „Hallo“ nur einmal, direkt nach dem Einschalten. Danach ist es weg.",
      "<kbd>dauerhaft</kbd> lässt das Herz blinken, solange der micro:bit Strom hat. Das ist sein Herzschlag, das eigentliche Lebenszeichen.",
      "Merkt euch das Muster: Etwas läuft immer wieder, ohne Ende. Genau das braucht euer Roboter gleich für jeden Sensor."
    ],
    chips:[ "Wo finde ich zeige Symbol?", "Wie stelle ich 300 ein?", "Was heißt ms?", "Wo ist Bildschirminhalt löschen?" ],
    fertig:"Gebaut ✓" },

  { id:"uebertragen",
    nachrichten:[
      "Und jetzt rüber damit auf den echten micro:bit.",
      "Steckt den micro:bit mit dem USB-Kabel an den Laptop. Strom kommt übers Kabel, den Roboter braucht ihr noch nicht.",
      "In MakeCode klickt ihr auf <b>Herunterladen</b>. Beim ersten Mal fragt der Browser nach dem Gerät: <b>micro:bit koppeln</b>, auswählen, verbinden.",
      "Auf dem micro:bit blinkt eine gelbe LED. Das ist euer Code, der hinüberfließt.",
      "Hört sie auf, läuft euer Programm. Erst „Hallo“, dann blinkt das Herz?",
      "Klappt das Herunterladen nicht, liegt es sehr oft am Kabel. Viele USB-Kabel können nur laden, aber keine Daten übertragen."
    ],
    zeig:{ "Es klappt trotzdem nicht":[
      "Fragt der Browser gar nicht nach dem Gerät? Es muss Chrome oder Edge sein.",
      "Notfalls geht es immer so: Die heruntergeladene <kbd>.hex</kbd>-Datei auf das Laufwerk <kbd>MICROBIT</kbd> ziehen.",
      {karte:"k1-klemmt"}
    ]},
    chips:[ "Der Browser findet den micro:bit nicht", "Wo ist Herunterladen?", "Die gelbe LED blinkt nicht", "Das Herz blinkt nicht" ],
    fertig:"Herz leuchtet ✓" },

  { id:"quiz",
    nachrichten:[
      "Eine Frage noch, dann gehört das Abzeichen euch.",
      {karte:"k1-quiz"}
    ],
    chips:[ "Was ist ein Flash-Speicher?", "Bleibt das Programm für immer drauf?", "Wie kriege ich das Programm wieder runter?" ],
    fertig:"Beantwortet ✓" }
]};
