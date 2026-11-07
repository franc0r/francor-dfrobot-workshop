/* Drehbuch Station 0: Boxenstopp. Quelle: src/stations/00-boxenstopp.html.
   Schema siehe maskottchen.js (Abschnitt Gespräch). */
DREHBUCH[0] = {name:"Boxenstopp", min:5, badge:"Rookie", titel:"Boxenstopp", schritte:[
  { id:"regelkreis",
    nachrichten:[
      "Hallo! Ich begleite euch heute durch den Workshop.",
      "Am Ende fährt euer Roboter ganz allein. Ein ferngesteuertes Auto ist noch kein Roboter.",
      "Ein echter Roboter macht immer dieselben drei Dinge:",
      '<div class="mcstack flat"><div class="mcb b-input">1 &nbsp;WAHRNEHMEN <b>Sensoren</b></div>' +
        '<div class="mcb b-logic i1">2 &nbsp;ENTSCHEIDEN <b>euer Programm</b></div>' +
        '<div class="mcb b-mq i2">3 &nbsp;HANDELN <b>Motoren, Licht, Ton</b></div></div>',
      "Und dann wieder von vorn, tausendmal pro Minute. Diese Schleife heißt <em>Regelkreis</em>."
    ],
    zeig:{ "Nochmal einfacher":[
      "Stell dir vor, du fängst einen Ball: Die Augen sehen ihn, der Kopf rechnet, die Hände greifen zu.",
      "Genau so macht es der Roboter. Nur heißen seine Augen Sensoren, und sein Kopf ist euer Programm."
    ]},
    chips:[ "Was ist ein Sensor?", "Was heißt Regelkreis?", "Ist ein Staubsauger-Roboter auch so?" ],
    fertig:"Verstanden ✓" },

  { id:"fahrzeug",
    nachrichten:[
      "Das ist euer Fahrzeug, der Maqueen, von oben. Die Farben passen zum Regelkreis.",
      {karte:"k0-mqmap"},
      "Findet ihr die beiden Schalter am echten Roboter? Die braucht ihr später."
    ],
    chips:[ "Was macht der Summer?", "Wo ist der Schalter?", "Wo steckt der micro:bit?" ],
    fertig:"Gefunden ✓" },

  { id:"quiz",
    nachrichten:[
      "Kurze Aufwärm-Frage, bevor es losgeht. Nicht schummeln!",
      {karte:"k0-quiz"}
    ],
    chips:[ "Was ist ein Sensor?", "Was macht der Summer?", "Ist der Laserscanner ein Sensor?" ],
    fertig:"Beantwortet ✓" },

  { id:"los",
    nachrichten:[
      "Stark, ihr wisst jetzt, wie ein Roboter tickt.",
      "Gleich schreibt ihr euer erstes Programm. Bereit?"
    ],
    chips:[ "Was machen wir als Nächstes?", "Wie lange dauert der Workshop?", "Brauchen wir Vorwissen?" ],
    fertig:"Los geht's ✓" }
]};
