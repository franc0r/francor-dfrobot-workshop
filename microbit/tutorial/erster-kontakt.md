# Erster Kontakt

### @diffs true

## Euer erstes Programm @showdialog

Gleich sagt euer micro:bit **Hallo** – und danach schlägt ein **Herz**, ohne Ende.

Links seht ihr immer, was zu tun ist. Unten findet ihr den Knopf **Weiter**.
Kommt ihr nicht weiter? Klickt auf die **Glühbirne** – dann seht ihr die fertigen Blöcke.

## {Schritt 1: Einmal beim Start}

Klickt links auf die Kategorie ``||basic:Grundlagen||``.
Zieht den Block ``||basic:zeige Text||`` in den Block ``||basic:beim Start||``.
Er rastet ein wie ein Puzzleteil.

**Tipp:** Ihr könnt Blöcke auch suchen. Tippt oben ins Suchfeld zum Beispiel `zeige Text`.

```blocks
basic.showString("Hallo")
```

## {Schritt 2: Hallo eintippen}

Klickt in das weiße Feld im Block ``||basic:zeige Text||``.
Löscht den alten Text und tippt **Hallo** ein.

```blocks
basic.showString("Hallo")
```

## {Schritt 3: Ausprobieren}

Steckt den micro:bit mit dem USB-Kabel an.
Klickt unten links auf ``|Herunterladen|``.
Beim ersten Mal fragt der Browser nach dem Gerät: **micro:bit koppeln** → auswählen → verbinden.

Schaut auf den micro:bit: **Hallo** läuft einmal durch. Danach ist es weg.
Genau das heißt ``||basic:beim Start||``: **einmal**.

## {Schritt 4: Ein Herz, immer wieder}

Jetzt kommt der Block ``||basic:dauerhaft||`` dran. Was darin steht, läuft **immer wieder**, ohne Ende.

Zieht ``||basic:zeige Symbol||`` aus ``||basic:Grundlagen||`` in ``||basic:dauerhaft||``.
Das Herz ist schon eingestellt.

```blocks
basic.showString("Hallo")
basic.forever(function () {
    basic.showIcon(IconNames.Heart)
})
```

## {Schritt 5: Kurz warten}

Zieht ``||basic:pausiere (ms)||`` unter das Herz.

Die Zahl müsst ihr nicht aus der Liste wählen.
Klickt auf die Zahl und tippt **300** ein.
300 ms sind ungefähr eine Drittelsekunde.

```blocks
basic.showString("Hallo")
basic.forever(function () {
    basic.showIcon(IconNames.Heart)
    basic.pause(300)
})
```

## {Schritt 6: Aus und wieder warten}

Zieht noch zwei Blöcke darunter:
``||basic:Bildschirminhalt löschen||`` und noch einmal ``||basic:pausiere (ms)||`` mit **300**.

**Falscher Block erwischt?** Klickt ihn an und drückt die Taste **Entf**.

```blocks
basic.showString("Hallo")
basic.forever(function () {
    basic.showIcon(IconNames.Heart)
    basic.pause(300)
    basic.clearScreen()
    basic.pause(300)
})
```

## {Schritt 7: Ausprobieren}

Klickt wieder auf ``|Herunterladen|``.

Schaut auf den micro:bit: Zuerst kommt **Hallo**, einmal. Danach blinkt das **Herz** – immer weiter.

Drückt den kleinen Knopf auf der **Rückseite** neben dem USB-Stecker.
Der micro:bit startet neu, und **Hallo** kommt wieder – einmal.

## Geschafft! @showdialog

Euer micro:bit hat einen Herzschlag.

**beim Start** läuft einmal. **dauerhaft** läuft immer wieder.
Genau das braucht euer Roboter gleich für jeden Sensor.

Geht zurück zur Workshop-Seite und beantwortet die Kontrollfrage.

```template
basic.forever(function () {
})
```
