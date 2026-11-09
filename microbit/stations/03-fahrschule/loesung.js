input.onButtonPressed(Button.A, function () {
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Red)
    basic.pause(1000)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Yellow)
    basic.pause(1000)
    maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.Green)
    maqueenPlusV2.setPatrolSpeed(maqueenPlusV2.getPatrolSpeed(PatrolSpeed.Speed1))
    maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.ON)
})
input.onButtonPressed(Button.B, function () {
    maqueenPlusV2.patrolling(maqueenPlusV2.Patrolling.OFF)
})
maqueenPlusV2.I2CInit()
