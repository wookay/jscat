// jscat test_canvas.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base


if (Sys.isbrowser()) {
    var createCanvas = function (w, h) {
        var canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        var body = document.getElementsByTagName("body")[0]
        body.appendChild(canvas)
        return canvas
    }
} else {
    var { createCanvas, loadImage, Canvas } = require('canvas')
}

Test.test_canvas = function () {
    var Sys = mucko.Sys
    var Meta = mucko.Meta
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    typ = Sys.isbrowser() ? HTMLCanvasElement : Canvas
    assert_true(Meta.isa(canvas, typ))
}
