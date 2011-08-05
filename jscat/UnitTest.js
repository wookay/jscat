// UnitTest.js
//                           wookay.noh at gmail.com

Test = {}
DOT = "."
LF = "\n"

function print(str) {
  if ('undefined' == typeof(window)) {
    process.stdout.write(str)
  } else {
    document.getElementsByTagName('pre')[0].innerHTML += str
  }
}
function puts(s) {
  print(s + LF)
}

Object.prototype.inspect = function() {
  return JSON.stringify(this)
}

function deep_equal(a,b) {
  if (a == b) {
    return true
  } else if ('object' == typeof(a) && 'object' == typeof(b)) {
    return a.inspect() == b.inspect()
  } else {
    return false
  }
}

assert_equal = function(expected, got) {
  _assert_equal(expected, got, deep_equal(expected, got))
}

var _assert_equal = function(expected, got, is_true) {
  if (is_true) {
    UnitTest.passed += 1
    if (UnitTest.dot_if_passed) {
      print(DOT)
    } else {
      puts('passed: ' + expected.inspect())
    }
  } else {
    puts('\nAssertion failed in ' +
         extract_filename_line_from_stack_trace())
    puts('Expected: ' + expected.inspect())
    puts('Got: ' + got.inspect())
    UnitTest.failed += 1
  }
}

var extract_filename_line_from_stack_trace = function() {
  Error.captureStackTrace(Test,
    extract_filename_line_from_stack_trace)
  var line = Test.stack.split(LF).slice(3,4).toString()
  return line.match(/\((.*):\d+:*\)/)[1]
}


UnitTest = {
  dot_if_passed: true,
  tests: 0,
  passed: 0,
  failed: 0,
  errors: 0,

  run: function(test_target) {
    var startedAt = new Date()
    puts('Started')
    for (var test_name in test_target) {
      if (test_name.match(/^test_/)) {
        this.tests += 1
        test_target[test_name]()
      }
    }
    var finishedAt = new Date()
    var elapsed = (finishedAt - startedAt) / 1000
    puts('\nFinished in ' + elapsed + ' seconds.')
    this.report()
  },

  report: function() {
    puts(this.tests + ' tests, ' +
         this.passed + ' assertions, ' +
         this.failed + ' failures, ' +
         this.errors + ' errors')
  },
}
