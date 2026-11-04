/**
 * Grand Prix: Kreuzungen zählen mit dem Maqueen Plus V3.
 * Braucht die Erweiterung DFRobot_MaqueenPlus_V2 im selben Projekt.
 * Zählt im Hintergrund jede Kreuzung, die die Linienverfolgung meldet
 * (Block "Intersection Detection"). Die Kreuzungsregeln fasst sie nicht an.
 */
//% color="#E07A00" icon="" block="Grand Prix"
namespace grandPrix {
    // Mindestabstand zwischen zwei gezählten Kreuzungen, damit eine nicht doppelt zählt
    const SPERRZEIT_MS = 300

    let anzahl = 0
    let laeuft = false
    let nummern: number[] = []
    let aktionen: (() => void)[] = []

    function starte() {
        if (laeuft) return
        laeuft = true
        control.inBackground(() => {
            let vorher = 0
            let zuletzt = -SPERRZEIT_MS
            while (true) {
                const jetzt = maqueenPlusV2.intersectionDetecting()
                // zählt nur den Wechsel "keine Kreuzung" -> "Kreuzung"
                if (jetzt != 0 && vorher == 0 && control.millis() - zuletzt >= SPERRZEIT_MS) {
                    zuletzt = control.millis()
                    anzahl++
                    for (let i = 0; i < nummern.length; i++) {
                        if (nummern[i] == anzahl) control.runInParallel(aktionen[i])
                    }
                }
                vorher = jetzt
                basic.pause(20)
            }
        })
    }

    /**
     * Läuft einmal, sobald der Roboter die Kreuzung mit dieser Nummer erreicht.
     * Gezählt wird ab dem Start (oder ab "setze Kreuzungszähler zurück").
     */
    //% blockId=grandprix_bei_kreuzung
    //% afterOnStart=true
    //% block="wenn Kreuzung Nummer $nr erreicht"
    //% nr.min=1 nr.defl=1
    //% weight=100
    export function beiKreuzung(nr: number, aktion: () => void) {
        nummern.push(nr)
        aktionen.push(aktion)
        starte()
    }

    /**
     * Wie viele Kreuzungen der Roboter bisher erkannt hat.
     */
    //% blockId=grandprix_gezaehlt
    //% block="Kreuzungen gezählt"
    //% weight=90
    export function gezaehlt(): number {
        starte()
        return anzahl
    }

    /**
     * Fängt wieder bei 0 an zu zählen.
     */
    //% blockId=grandprix_zuruecksetzen
    //% block="setze Kreuzungszähler zurück"
    //% weight=80
    export function zuruecksetzen() {
        anzahl = 0
        starte()
    }
}
