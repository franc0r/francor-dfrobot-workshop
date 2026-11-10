/* Drehbuch Station 2: micro:bit allein. Quelle: master, Station 02 (Parcours first, 09.11.2026).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Kein eigener Simulator mehr: Die Teams
   probieren im Simulator von MakeCode, die Zahl des Sensors sehen sie im Extra „zeige Zahl“. */
DREHBUCH[2] = {name:"micro:bit allein", min:11, badge:"Pixelkünstler", titel:"Der micro:bit allein", schritte:[
  { id:"projekt",
    nachrichten:[
      "Der micro:bit ist für sich schon ein Computer: 25 LEDs, zwei Knöpfe, Lautsprecher. Und ein Sensor, der merkt, wie ihr ihn bewegt.",
      "Zuerst ein neues Projekt. Sonst blinkt euer Herz aus Station 1 über alles drüber.",
      {karte:"makecode:neu"}
    ],
    chips:[ "Ist unser Herz dann weg?", "Wo ist der Knopf für ein neues Projekt?", "Müssen wir das alte speichern?" ],
    fertig:"Neues Projekt offen ✓" },

  { id:"bild",
    nachrichten:[
      "Der Bildschirm sind 25 rote LEDs. Im Block <kbd>zeige LEDs</kbd> aus <b>Grundlagen</b> klickt ihr die Punkte an.",
      "Zieht ihn in <kbd>beim Start</kbd> und malt euer Bild. Der Simulator rechts in MakeCode zeigt es sofort.",
      "Testen: Herunterladen. Steht euer Bild auf dem micro:bit?"
    ],
    chips:[ "Wo ist zeige LEDs?", "Wie mache ich einen Punkt wieder aus?", "Das Bild kommt nicht auf den micro:bit" ],
    fertig:"Bild steht ✓" },

  { id:"knoepfe",
    nachrichten:[
      "Neu: ein Block, der <em>wartet</em>, bis etwas passiert. So ein Block heißt Ereignis.",
      "<kbd>wenn Knopf A geklickt</kbd> liegt in <b>Eingabe</b>, <kbd>zeige Symbol</kbd> und <kbd>Bildschirminhalt löschen</kbd> in <b>Grundlagen</b>.",
      {karte:"k2-knoepfe"},
      "Ereignis-Blöcke liegen <b>frei</b> im Programmierfenster, nicht in <kbd>beim Start</kbd> oder <kbd>dauerhaft</kbd>. Im Simulator könnt ihr A und B anklicken.",
      "Testen: Herunterladen, Knopf A drücken, dann Knopf B."
    ],
    chips:[ "Welcher Knopf ist A?", "Muss das in dauerhaft rein?", "Das Herz geht nicht mehr weg", "Im Simulator passiert nichts" ],
    fertig:"Knöpfe gehen ✓" },

  { id:"neigen",
    nachrichten:[
      "Im micro:bit sitzt ein Beschleunigungssensor wie im Handy. Er liefert fertige Ereignisse wie <kbd>Logo nach oben</kbd> oder <kbd>geschüttelt</kbd>.",
      "In <b>Eingabe</b> gibt es dafür nur <kbd>wenn geschüttelt</kbd>: hereinziehen und im Menü umstellen, ein Block je Ereignis. <kbd>zeige Pfeil</kbd> liegt in <b>Grundlagen</b> ganz unten.",
      {karte:"k2-neigen"},
      "Der Simulator kippt mit der Maus und hat einen Knopf <b>SHAKE</b>.",
      "Testen: Herunterladen, nach vorn und hinten kippen, dann schütteln."
    ],
    zeig:{ "Es klappt nicht":[
      "Kein Pfeil? Deutlich kippen, fast senkrecht.",
      "Nichts beim Schütteln? Kräftig und ruckartig, nicht sanft wedeln.",
      {karte:"k2-klemmt"}
    ]},
    chips:[ "Wo ist zeige Pfeil?", "Wo stelle ich Logo nach oben ein?", "Beim Kippen kommt kein Pfeil", "Der Totenkopf kommt nicht" ],
    fertig:"Pfeile und Totenkopf ✓" },

  { id:"grenze",
    nachrichten:[
      "Und woher weiß der micro:bit, dass das Logo oben ist? Der Sensor liefert eine Zahl:",
      {karte:"k2-tabelle"},
      "Der wichtigste Satz des Workshops: Ein Sensor liefert keine Wörter, sondern <b>Zahlen</b>. Der micro:bit vergleicht die Zahl mit einer Grenze, hier 200.",
      "Beim Roboter legt ihr die Grenze selbst fest."
    ],
    zeig:{ "Die Zahl selbst sehen":[
      "Baut das in ein neues <kbd>dauerhaft</kbd> und ladet es herunter. Kippt den micro:bit in der Hand, die Zahl läuft mit.",
      {karte:"k2-zahl"},
      "<kbd>zeige Zahl</kbd> liegt in <b>Grundlagen</b>, <kbd>Beschleunigung</kbd> in <b>Eingabe</b>."
    ]},
    chips:[ "Warum gerade 200?", "Was passiert zwischen -200 und 200?", "Wo ist Beschleunigung?", "Kann ich die Grenze ändern?" ],
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
      "Team-Challenge: Macht aus dem Schütteln einen <b>Würfel</b>. Statt Ton und Totenkopf eine zufällige Zahl.",
      {karte:"k2-wuerfel"},
      "Der lila Block liegt unter <b>Mathematik</b>. Stellt die erste Zahl auf <b>1</b>, sonst würfelt er auch eine Null.",
      "Testen: dreimal schütteln, kommen verschiedene Zahlen? Dann zeigt es eurem Betreuer."
    ],
    zeig:{ "Es klappt nicht":[
      "Zahlen über 9 laufen als Laufschrift durch. Für den Würfel reicht 1 bis 6.",
      {karte:"k2-klemmt"}
    ]},
    chips:[ "Wo ist Mathematik?", "Er zeigt immer dieselbe Zahl", "Die Zahl läuft als Schrift durch" ],
    fertig:"Würfel läuft ✓" }
]};
