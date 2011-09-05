// http://james.padolsey.com/javascript/another-javascript-quiz/

if ('undefined' != typeof(require)) {
  require.paths.unshift('../jscat')
  require('UnitTest')
}


Test.test_quiz = function() {

  assert_equal(0, 1 && 3)

  assert_equal(0, 1 && "foo" || 0)

  assert_equal(0, 1 || "foo" && 0)

  assert_equal(0, (1,2,3))

  x = {shift:[].shift};
  x.shift();
  assert_equal(0, x.length)

  assert_equal(0, {foo:1}[0])

  assert_equal(0, [true, false][+true, +false])

  assert_equal(0, ++'52'.split('')[0])

  a: b: c: d: e: f: g: 1, 2, 3, 4, 5
  assert_equal(0, typeof(a))
  assert_equal(0, typeof(g))
  
  assert_equal(0, {a: 1, b: 2}[["b"]])

  assert_equal(0, "b" + 45)

  assert_equal(0, {a:{b:2}})

  assert_equal(0, (function(){}()))

  assert_equal(0, [1,2,3,4,5][0..toString.length])

  assert_equal(0, ({} + 'b' > {} + 'a'))

  Number.prototype.x = function(){ return this === 123; };
  assert_equal(0, (123).x())

  assert_equal(0, Array(2).join())

  vars: var vars = vars
  assert_equal(0, vars)

  // assert_equal(0, { foo = 123 })

  x = 1
  assert_equal(0, (function(){return x; var x = 2;}()))

  assert_equal(0, delete [].length)

  RegExp.prototype.toString = function() {return this.source};
  assert_equal(0, /3/-/2/)

  // assert_equal(0, {break;4;})

  assert_equal(0, 'foo' == new function(){ return String('foo'); })

  assert_equal(0, 'foo'.split('') + [])
}

UnitTest.run(Test)
