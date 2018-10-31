// jscat test_3d.js

var mucko = require("mucko")
var Meta = mucko.Meta
var Test = mucko.Test
var UnitTest = mucko.UnitTest
var Base = mucko.Base
var Sys = mucko.Sys
var println = Base.println
var stdout = Base.stdout


if (Sys.isbrowser()) {
    var svg = d3.select("svg")
} else {
    var d3 = require("d3-3d")
}

Test.test_3d = function () {
    assert_true(!Meta.isundef(d3._3d))
    if (Sys.isbrowser()) {
        assert_true(!Meta.isundef(svg))
    } else {
        assert_true(Meta.isundef(svg))
    }
}
