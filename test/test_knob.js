// jscat test_knob.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base
var Meta = mucko.Meta
var Sys = mucko.Sys


function inbrowser_knob() {
    let println = Base.println
    knob_el = document.getElementById('knob')
    function knob_changed(value) {
        el = document.getElementById('knob-value')
        el.innerHTML = value
    }
    knob = Knob(knob_el, {
        value_min: 0,
        value_max: 100,
        value_resolution: 1,
        center_value: 63,
        snap_to_steps: false,
        mouse_wheel_acceleration: 1,
        bg_radius: 32,
        bg_border_width: 1,
        track_bg_radius: 40,
        track_bg_width: 8,
        track_radius: 40,
        track_width: 13,
        cursor_radius: 20,
        cursor_length: 10,
        cursor_width: 4,
        bg: true,
        track_bg: true,
        track: true,
        cursor: true,
        value_text: true,
        value_position: 58,
        onchange: knob_changed,
    })
    val = 75
    knob.value = val
    knob_changed(val)
    assert_equal(knob.value, val)
}


Test.test_knob = function () {
    if (Sys.isbrowser()) {
        inbrowser_knob()
    } else {
        var { Knob } = require("./deps/svg-knob.js")
        assert_true(Meta.isa(Knob, Function))
    }
}
