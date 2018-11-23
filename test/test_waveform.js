// jscat test_waveform.js

var mucko = require("mucko")
var Test = mucko.Test
var Meta = mucko.Meta
var Base = mucko.Base
var Sys = mucko.Sys


// code from https://github.com/voixen/voixen-vad/blob/master/examples/waveform/waveform-generator.js#L200
var resample = function(samples, rate) {
    let result = [], min = 1, max = -1, j = 0

    for (let i = 0; i < samples.length; ++i) {
        if (samples[i] < min) min = samples[i]
        if (samples[i] > max) max = samples[i]
        if (++j >= rate) {
            result.push(min, max)
            j = 0, min = 1, max = -1
        }
    }

    if (j > 0) {
        result.push(min, max)
    }

    return result
}

Test.test_waveform = function() {
    assert_equal(resample([1,5,10,5,1], 1), [1, 1, 1, 5, 1, 10, 1, 5, 1, 1])
    assert_equal(resample([1,5,10,5,1], 2), [1,       5, 1, 10,       1, 1])
}
