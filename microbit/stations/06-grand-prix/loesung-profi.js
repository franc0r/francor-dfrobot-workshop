let gesprungen = false
function regelnSetzen () {
    maqueenPlusV2.setIntersectionRunMode(maqueenPlusV2.Intersection.Straight)
    maqueenPlusV2.setLeftOrStraightRunMode(maqueenPlusV2.LeftOrStraight.Straight)
    maqueenPlusV2.setTRordRunMode(maqueenPlusV2.Trord.Stop)
    if (grandPrix.gezaehlt() == 0) {
        maqueenPlusV2.setRightOrStraightRunMode(maqueenPlusV2.RightOrStraight.Right)
    } else {
        maqueenPlusV2.setRightOrStraightRunMode(maqueenPlusV2.RightOrStraight.Straight)
    }
}
input.onButtonPressed(Button.A, function () {
    grandPrix.zuruecksetzen()
    gesprungen = false
    regelnSetzen()
    maqueenPlusV2.setPatrolSpeed(maqueenPlusV2.getPatrolSpeed(PatrolSpeed.Speed2))
    basic.clearScreen()
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Red)
    basic.pause(1000)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Yellow)
    basic.pause(1000)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Green)
    maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.ON)
    basic.pause(500)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.Right, maqueenPlusV2.CarLightColors.Yellow)
})
grandPrix.beiKreuzung(4, function () {
    basic.pause(500)
    if (matrixLidarDistance.getObstacleDistance(matrixLidarDistance.ObstacleSide.Front) >= 200) {
        maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.OFF)
        maqueenPlusV2.pidControlDistance(maqueenPlusV2.SpeedDirection.SpeedCW, 20, maqueenPlusV2.MyInterruption.NotAllowed)
        basic.pause(2000)
        regelnSetzen()
        gesprungen = true
        maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.ON)
    } else {
        music.play(music.builtInPlayableMelody(Melodies.Dadadadum), music.PlaybackMode.InBackground)
    }
})
grandPrix.beiKreuzung(3, function () {
    maqueenPlusV2.setPatrolSpeed(maqueenPlusV2.getPatrolSpeed(PatrolSpeed.Speed1))
    basic.showNumber(1)
})
grandPrix.beiKreuzung(1, function () {
    maqueenPlusV2.setRightOrStraightRunMode(maqueenPlusV2.RightOrStraight.Straight)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Green)
})
maqueenPlusV2.I2CInit()
matrixLidarDistance.initialize(matrixLidarDistance.Addr.Addr4, matrixLidarDistance.Matrix.OBS)
basic.forever(function () {
    matrixLidarDistance.getData()
    if (matrixLidarDistance.getObstacleDistance(matrixLidarDistance.ObstacleSide.Front) < 200) {
        maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.OFF)
        if (gesprungen) {
            gesprungen = false
            music.play(music.builtInPlayableMelody(Melodies.Dadadadum), music.PlaybackMode.InBackground)
        }
    }
})
