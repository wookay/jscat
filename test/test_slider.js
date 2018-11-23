// jscat test_slider.js

var mucko = require("mucko")
var Test = mucko.Test
var Sys = mucko.Sys
var Base = mucko.Base
var Meta = mucko.Meta
var nouislider = require("nouislider")


function inbrowser_slider() {
    let map = Base.map
    let round = Base.round
    let Int = Base.Int
    let join = Base.join
    var slider = document.getElementById("slider")
    nouislider.create(slider, {
        start: [20, 50],
        connect: true,
        step: 1,
        range: {
            min: 0,
            max: 100,
        }
    })
    slider.noUiSlider.on('update', function (values, handle) {
        el = document.getElementById('slider-range-value')
        el.innerHTML = join(map(Number, values), ":")
    })
    assert_true(Meta.isa(slider, HTMLDivElement))
    assert_true(Meta.isa(slider.noUiSlider, Object))
    assert_equal(slider.noUiSlider.target, slider)
    assert_equal([20, 50], map(Number, slider.noUiSlider.get()))
    assert_equal({min: 0, max: 100}, slider.noUiSlider.options.range)
}


Test.test_slider = function () {
    assert_true(Meta.isa(nouislider, Object))
    if (Sys.isbrowser()) {
        inbrowser_slider()
    }
}
