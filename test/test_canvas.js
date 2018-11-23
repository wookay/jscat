// jscat test_canvas.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base
var Sys = mucko.Sys


function require_canvas() {
    if (Sys.isbrowser()) {
        var createCanvas = function (w, h) {
            var canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            var container = document.getElementById('canvas-container')
            container.appendChild(canvas)
            return canvas
        }
        return { createCanvas, undefined, undefined }
    } else {
        var { createCanvas, loadImage, Canvas } = require('canvas')
        return { createCanvas, loadImage, Canvas }
    }
}

Test.test_canvas = function () {
    var Meta = mucko.Meta
	let { createCanvas, loadImage, Canvas } = require_canvas()
    const canvas = createCanvas(10, 10)
    const ctx = canvas.getContext('2d')
    typ = Sys.isbrowser() ? HTMLCanvasElement : Canvas
    assert_true(Meta.isa(canvas, typ))
}
