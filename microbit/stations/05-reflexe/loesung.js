let pause = false
input.onButtonPressed(Button.A, function () {
    pause = false
})
input.onButtonPressed(Button.B, function () {
    pause = true
})
maqueenPlusV2.I2CInit()
matrixLidarDistance.initialize(matrixLidarDistance.Addr.Addr4, matrixLidarDistance.Matrix.OBS)
maqueenPlusV2.setBrightness(255)
maqueenPlusV2.setRgblLed(maqueenPlusV2.DirectionType.All, maqueenPlusV2.CarLightColors.White)
basic.forever(function () {
    matrixLidarDistance.getData()
    if (pause || matrixLidarDistance.getObstacleDistance(matrixLidarDistance.ObstacleSide.Front) < 200) {
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
        maqueenPlusV2.showColor(DigitalPin.P1, maqueenPlusV2.colors(maqueenPlusV2.NeoPixelColors.Red))
    } else {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 100)
        maqueenPlusV2.showColor(DigitalPin.P1, maqueenPlusV2.colors(maqueenPlusV2.NeoPixelColors.Green))
    }
})
