let gesprungen = false
function regelnSetzen() {
    francorMaqueen.atCrossroad(francorMaqueen.CrossroadRule.Straight)
    francorMaqueen.atLeftOrStraight(francorMaqueen.LeftRule.Straight)
    francorMaqueen.atTJunction(francorMaqueen.TRule.Stop)
    if (francorMaqueen.crossingsCounted() == 0) {
        francorMaqueen.atRightOrStraight(francorMaqueen.RightRule.Right)
    } else {
        francorMaqueen.atRightOrStraight(francorMaqueen.RightRule.Straight)
    }
}
francorMaqueen.start()
francorLidar.start()
input.onButtonPressed(Button.A, function () {
    francorMaqueen.resetCrossings()
    gesprungen = false
    regelnSetzen()
    francorMaqueen.patrolSpeed(2)
    basic.clearScreen()
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Yellow)
    basic.pause(1000)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Green)
    francorMaqueen.patrol(francorMaqueen.OnOff.On)
    basic.pause(500)
    francorMaqueen.headlight(francorMaqueen.Side.Right, francorMaqueen.HeadColor.Yellow)
})
input.onButtonPressed(Button.B, function () {
    francorMaqueen.patrol(francorMaqueen.OnOff.Off)
})
francorMaqueen.onCrossing(4, function () {
    basic.pause(500)
    if (francorLidar.distance(francorLidar.LidarSide.Front) >= 200) {
        francorMaqueen.patrol(francorMaqueen.OnOff.Off)
        francorMaqueen.driveDistance(20, francorMaqueen.Dir.Forward, francorMaqueen.Wait.UntilDone)
        regelnSetzen()
        gesprungen = true
        francorMaqueen.patrol(francorMaqueen.OnOff.On)
    } else {
        music.play(music.builtInPlayableMelody(Melodies.Dadadadum), music.PlaybackMode.InBackground)
    }
})
francorMaqueen.onCrossing(3, function () {
    francorMaqueen.patrolSpeed(1)
    basic.showNumber(1)
})
francorMaqueen.onCrossing(1, function () {
    francorMaqueen.atRightOrStraight(francorMaqueen.RightRule.Straight)
    francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Green)
})
basic.forever(function () {
    if (francorLidar.distance(francorLidar.LidarSide.Front) < 200) {
        francorMaqueen.patrol(francorMaqueen.OnOff.Off)
        francorMaqueen.headlight(francorMaqueen.Side.Both, francorMaqueen.HeadColor.Red)
        if (gesprungen) {
            gesprungen = false
            music.play(music.builtInPlayableMelody(Melodies.Dadadadum), music.PlaybackMode.InBackground)
        }
    }
})
