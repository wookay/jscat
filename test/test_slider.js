// jscat test_slider.js

var mucko = require("mucko")
var Test = mucko.Test
var Sys = mucko.Sys


function make_slider() {
    var Slider = require("bootstrap-slider")
    var slider = new Slider('#ex1', {
        formatter: function(value) {
            return "Current value: " + value
        }
    })
    var ex1 = document.getElementById("ex1")
    assert_equal(10, ex1.value)
}

Test.test_slider = function () {
    if (Sys.isbrowser()) {
        make_slider()
    }
}
