// jscat runtests.js

var mucko = require("mucko")
var Test = mucko.Test
var UnitTest = mucko.UnitTest
var Base = mucko.Base
var println = Base.println
var stdout = Base.stdout

Test.test_jscat_test = function () {
    assert_equal(3, 1+2)
}

UnitTest.run(Test)
