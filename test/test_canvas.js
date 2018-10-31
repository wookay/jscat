// jscat test_canvas.js

var mucko = require("mucko")
var Meta = mucko.Meta
var Test = mucko.Test
var UnitTest = mucko.UnitTest
var Base = mucko.Base
var Sys = mucko.Sys
var println = Base.println
var stdout = Base.stdout


if (Sys.isbrowser()) {
    var createCanvas = function (w, h) {
        var canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        return canvas
    }
} else {
    var { createCanvas, loadImage, Canvas } = require('canvas')
}

Test.test_canvas = function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    typ = Sys.isbrowser() ? HTMLCanvasElement : Canvas
    assert_true(Meta.isa(canvas, typ))
}
