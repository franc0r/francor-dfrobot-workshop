francorMaqueen.start()
francorLidar.start()
input.onButtonPressed(Button.A, function () {
    francorMaqueen.resetCrossings()
    francorMaqueen.atCrossroad(francorMaqueen.CrossroadRule.Straight)
    francorMaqueen.atLeftOrStraight(francorMaqueen.LeftRule.Straight)
    francorMaqueen.atRightOrStraight(francorMaqueen.RightRule.Right)
    francorMaqueen.atTJunction(francorMaqueen.TRule.Stop)
    francorMaqueen.patrolSpeed(2)
    basic.clearScreen()
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Yellow)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Green)
    francorMaqueen.patrol(francorMaqueen.OnOff.On)
})
input.onButtonPressed(Button.B, function () {
    francorMaqueen.patrol(francorMaqueen.OnOff.Off)
})
francorMaqueen.onCrossing(4, function () {
    music.play(music.builtInPlayableMelody(Melodies.Dadadadum), music.PlaybackMode.InBackground)
})
francorMaqueen.onCrossing(3, function () {
    francorMaqueen.patrolSpeed(1)
    basic.showNumber(1)
})
francorMaqueen.onCrossing(1, function () {
    francorMaqueen.atRightOrStraight(francorMaqueen.RightRule.Straight)
})
basic.forever(function () {
    if (francorLidar.distance(francorLidar.LidarSide.Front) < 200) {
        francorMaqueen.patrol(francorMaqueen.OnOff.Off)
        francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
    }
})
