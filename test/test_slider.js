// jscat test_slider.js

var mucko = require("mucko")
var Test = mucko.Test
var Sys = mucko.Sys
var Base = mucko.Base
var Meta = mucko.Meta
var nouislider = require("nouislider")


function make_slider() {
    var slider = document.getElementById("slider")
    nouislider.create(slider, {
        start: [20, 50],
        connect: true,
        range: {
            min: 0,
            max: 100,
        }
    })
    assert_true(Meta.isa(slider, HTMLDivElement))
    assert_true(Meta.isa(slider.noUiSlider, Object))
    assert_equal(slider.noUiSlider.target, slider)
    let map = Base.map
    assert_equal([20, 50], map(Number, slider.noUiSlider.get()))
    assert_equal({min: 0, max: 100}, slider.noUiSlider.options.range)
}


Test.test_slider = function () {
    assert_true(Meta.isa(nouislider, Object))
    if (Sys.isbrowser()) {
        make_slider()
    }
}
