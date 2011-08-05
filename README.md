jscat
=====

Unit testing for JavaScript.


```javascript
if ('undefined' != typeof(require)) {
  require.paths.unshift('../jscat')
  require('UnitTest')
}


Test.test_undefined = function() {
  assert_equal(undefined, undefined)
}

Test.test_number = function() {
  assert_equal(3, 1+2)
  assert_equal(3.14, 3.14)
}

Test.test_string = function() {
  assert_equal("abc", "a" + "b" + "c")
  assert_equal(3, "abc".length)
}

Test.test_array = function() {
  assert_equal([], [])
  assert_equal([1,2,3], [1,2,3])
  assert_equal(3, [1,2,3].length)
}

Test.test_hash = function() {
  assert_equal({}, {})
  assert_equal({a:2}, {a:2})
}

Test.test_function = function() {
  var f = function() {}
  assert_equal(f, f)
}


UnitTest.run(Test)
```


	$ node test_unittest.js 
	Started
	...........
	Finished in 0.002 seconds.
	6 tests, 11 assertions, 0 failures, 0 errors
