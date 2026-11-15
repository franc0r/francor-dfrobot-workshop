francorMaqueen.start()
francorLidar.start()
input.onButtonPressed(Button.A, function () {
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Yellow)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Green)
    francorMaqueen.patrolSpeed(1)
    francorMaqueen.patrol(francorMaqueen.OnOff.On)
})
input.onButtonPressed(Button.B, function () {
    francorMaqueen.patrol(francorMaqueen.OnOff.Off)
})
basic.forever(function () {
    if (francorLidar.distance(francorLidar.LidarSide.Front) < 200) {
        francorMaqueen.patrol(francorMaqueen.OnOff.Off)
        francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
    }
})
