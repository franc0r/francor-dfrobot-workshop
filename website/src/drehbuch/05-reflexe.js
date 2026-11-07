/* Drehbuch Station 5: Reflexe. Quelle: src/stations/05-reflexe.html (master).
   Schema siehe maskottchen.js (Abschnitt Gespräch). Der Laser-Stopp ist Pflicht,
   der Grand Prix braucht ihn; nur der Staubsauger ist Extra. */
DREHBUCH[5] = {name:"Reflexe", min:10, badge:"Bremsassistent", titel:"Reflexe: wenn … dann … ansonsten", schritte:[
  { id:"projekt",
    nachrichten:[
      "Ein Roboter, der nur einem Plan folgt, fährt gegen die erste Wand. Jetzt bringt ihr ihm bei, selbst zu entscheiden, viele Male pro Sekunde.",
      "Startet wieder ein neues Roboter-Projekt. Sonst läuft die Linienverfolgung aus Station 4 weiter, und zwei Programme kämpfen um die Motoren.",
      {karte:"makecode:vorlage"}
    ],
    chips:[ "Ist unser Projekt Linie dann weg?", "Warum schon wieder neu?", "Der Knopf macht nichts" ],
    fertig:"Neues Projekt offen ✓" },

  { id:"laser",
    nachrichten:[
      "Vorne sitzt kein einfacher Abstandsmesser, sondern ein kleiner Laserscanner mit 8 mal 8 = <b>64 Laserstrahlen</b>.",
      "Er misst in Millimetern, von 20 mm bis 4000 mm.",
      "Genau so ein Sensor sitzt auch in selbstfahrenden Autos, nur größer.",
      "Der Scanner hat seine eigene Kategorie mit lila Blöcken: <b>Matrix LiDAR Entfernung</b>.",
      {karte:"k5-laser"},
      "In <kbd>beim Start</kbd> wird er eingeschaltet. In <kbd>dauerhaft</kbd> holt ihr zuerst neue Messwerte ab und fragt dann den Abstand nach vorn ab."
    ],
    chips:[ "Wo ist Matrix LiDAR Entfernung?", "Was heißt 0x33?", "Wie weit sieht der Laser?", "Was ist ein Lidar?" ],
    fertig:"Laser ist an ✓" },

  { id:"wenn",
    nachrichten:[
      "Der <kbd>dauerhaft</kbd>-Block wiederholt alles darin, immer und immer wieder. Darin sitzt die Entscheidung.",
      "Ist der Weg frei, wird gefahren. Ist etwas näher als 20 cm, wird gebremst.",
      {karte:"k5-logik"},
      "Die Bedingung baut ihr in dieser Reihenfolge. Erst die Form, dann der Inhalt: Der Vergleich ist das Loch, in das der Sensor passt.",
      {karte:"k5-bauen"},
      "Testen: Herunterladen, Roboter auf den Boden, Hand davorhalten. Er bremst, bevor ihr ihn berührt.",
      "Diesen Laser-Stopp braucht ihr im Grand Prix wieder. Also nicht überspringen!"
    ],
    zeig:{
      "Es klappt nicht":[ {karte:"k5-klemmt"} ],
      "Noch ein Ton dazu?":[
        "Hängt ihr einen <kbd>spiele Ton</kbd>-Block dazu, wartet der Roboter, bis der Ton fertig ist. So lange misst er nicht und reagiert nicht.",
        "Nehmt einen kurzen Ton, sonst wird der Bremsassistent träge."
      ]
    },
    chips:[ "Wo ist wenn … dann … ansonsten?", "Der Laser-Block passt nicht ins Loch", "Er bremst nie", "Warum 200 und nicht 20?" ],
    fertig:"Er bremst ✓" },

  { id:"pausenknopf",
    nachrichten:[
      "Jetzt merkt sich der Roboter etwas. Eine <b>Variable</b> ist ein Merkzettel mit Namen: Das Programm schreibt etwas darauf, zum Beispiel <b>wahr</b> oder <b>falsch</b>.",
      "Später liest es den Zettel an einer ganz anderen Stelle wieder. Im Grand Prix braucht ihr das für das Pro-Ziel.",
      {karte:"k5-pause"},
      "Bei <b>Variablen</b> auf <kbd>Erstelle eine Variable…</kbd> klicken und sie <b>pausiert</b> nennen.",
      "Den roten Block <kbd>setze pausiert auf 0</kbd> in <kbd>wenn Knopf B geklickt</kbd> ziehen.",
      "Auf die <b>0</b> kommt aus <b>Logik</b> der Block <b>wahr</b>. Bei Knopf A macht ihr dasselbe mit <b>falsch</b>."
    ],
    chips:[ "Wo erstelle ich eine Variable?", "Wo finde ich wahr und falsch?", "Wo ist setze pausiert?", "Warum heißt es Variable?" ],
    fertig:"Knöpfe schreiben auf den Zettel ✓" },

  { id:"oder",
    nachrichten:[
      "Jetzt muss das <kbd>dauerhaft</kbd> den Zettel lesen.",
      "Zieht euren Laser-Vergleich aus dem <kbd>wenn</kbd> heraus und legt ihn kurz daneben.",
      "Auf den freien Platz kommt aus <b>Logik</b> der Block <kbd>oder</kbd>: links <b>pausiert</b> aus <b>Variablen</b>, rechts wieder euer Vergleich.",
      "Der Knopf schreibt auf den Zettel, das <kbd>dauerhaft</kbd> liest ihn. So reden zwei Teile eures Programms miteinander.",
      "Testen: Der Roboter fährt, Knopf B: Er bleibt stehen und leuchtet rot. Knopf A: Er fährt weiter."
    ],
    chips:[ "Wo ist der Block oder?", "Wo finde ich pausiert?", "Der Vergleich passt nicht mehr rein", "Nach Knopf A fährt er nicht weiter" ],
    fertig:"Pausenknopf geht ✓" },

  { id:"quiz",
    nachrichten:[
      "Denkfrage, bevor es zum Rennen geht:",
      {karte:"k5-quiz"}
    ],
    chips:[ "Was macht dauerhaft nochmal?", "Was passiert in beim Start?", "Reicht nicht einmal messen?" ],
    fertig:"Beantwortet ✓" },

  { id:"staubsauger", bonus:true, titel:"Staubsauger",
    nachrichten:[
      "Bonus: Schafft ihr es, dass der Roboter beim Hindernis nicht nur stoppt, sondern <b>zurücksetzt, sich dreht und weiterfährt</b>?",
      "Dann habt ihr einen Staubsaugerroboter gebaut.",
      "Geschafft? Dann zeigt es eurem Betreuer."
    ],
    chips:[ "Wie fährt er rückwärts?", "Wie dreht er sich auf der Stelle?", "Er dreht sich nur noch im Kreis" ],
    fertig:"Staubsauger fährt ✓" }
]};
