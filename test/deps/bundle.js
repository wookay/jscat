require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// jscat index.js

module.exports = {
}

},{}],2:[function(require,module,exports){
/* globals document, ImageData */

const parseFont = require('./lib/parse-font')

exports.parseFont = parseFont

exports.createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width, height })
}

exports.createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array)
    case 2: return new ImageData(array, width)
    default: return new ImageData(array, width, height)
  }
}

exports.loadImage = function (src) {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img')

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => { cleanup(); resolve(image) }
    image.onerror = () => { cleanup(); reject(new Error(`Failed to load the image "${src}"`)) }

    image.src = src
  })
}

},{"./lib/parse-font":3}],3:[function(require,module,exports){
'use strict'

/**
 * Font RegExp helpers.
 */

const weights = 'bold|bolder|lighter|[1-9]00'
  , styles = 'italic|oblique'
  , variants = 'small-caps'
  , stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded'
  , units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q'
  , string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+'

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp(`(${weights}) +`, 'i')
const styleRe = new RegExp(`(${styles}) +`, 'i')
const variantRe = new RegExp(`(${variants}) +`, 'i')
const stretchRe = new RegExp(`(${stretches}) +`, 'i')
const sizeFamilyRe = new RegExp(
  '([\\d\\.]+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)')

/**
 * Cache font parsing.
 */

const cache = {}

const defaultHeight = 16 // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

module.exports = function (str) {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str)
  if (!sizeFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, '').replace(/ *, */g, ',')
  }

  // Optional, unordered properties.
  let weight, style, variant, stretch
  // Stop search at `sizeFamily.index`
  let substr = str.substring(0, sizeFamily.index)
  if ((weight = weightRe.exec(substr))) font.weight = weight[1]
  if ((style = styleRe.exec(substr))) font.style = style[1]
  if ((variant = variantRe.exec(substr))) font.variant = variant[1]
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1]

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75
      break
    case 'pc':
      font.size *= 16
      break
    case 'in':
      font.size *= 96
      break
    case 'cm':
      font.size *= 96.0 / 2.54
      break
    case 'mm':
      font.size *= 96.0 / 25.4
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75
      break
    case 'q':
      font.size *= 96 / 25.4 / 4
      break
  }

  return (cache[str] = font)
}

},{}],4:[function(require,module,exports){
// jscat test_canvas.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base


if (Sys.isbrowser()) {
    var createCanvas = function (w, h) {
        var canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        var body = document.getElementsByTagName("body")[0]
        body.appendChild(canvas)
        return canvas
    }
} else {
    var { createCanvas, loadImage, Canvas } = require('canvas')
}

Test.test_canvas = function () {
    var Sys = mucko.Sys
    var Meta = mucko.Meta
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    typ = Sys.isbrowser() ? HTMLCanvasElement : Canvas
    assert_true(Meta.isa(canvas, typ))
}

},{"canvas":2,"mucko":"mucko"}],5:[function(require,module,exports){
// jscat test_slider.js

var mucko = require("mucko")
var Test = mucko.Test
var Sys = mucko.Sys
var Base = mucko.Base
var noUiSlider = require("nouislider")


function make_slider() {
    let println = Base.println
    let map = Base.map
    var slider = document.getElementById("slider")
    noUiSlider.create(slider, {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    })
    assert_equal([20, 80], map(Number, slider.noUiSlider.get()))
}

Test.test_slider = function () {
    let println = Base.println
    println(noUiSlider)
    if (Sys.isbrowser()) {
        make_slider()
    }
}

},{"mucko":"mucko","nouislider":"nouislider"}],6:[function(require,module,exports){
// mucko Base.js

function get_base() {
    var boot = require("./boot.js")
    var coreio = require("./coreio.js")
    var strings = require("./strings.js")
    var ranges = require("./range.js")
    var floats = require("./float.js")
    var arrays = require("./array.js")
    var parsing = require("./parse.js")
    Base = {
        // -- boot
        DataType: boot.DataType,     // Base.DataType
        Undefined: boot.Undefined,   // Base.Undefined
        Null: boot.Null,             // Base.Null
        Nothing: boot.Nothing,       // Base.Nothing
        nothing: boot.nothing,       // Base.nothing
        Bool: boot.Bool,             // Base.Bool
        Int: boot.Int,               // Base.Int
        Float64: boot.Float64,       // Base.Float64

        // -- coreio
        println: coreio.println,     // Base.println
        IOBuffer: coreio.IOBuffer,   // Base.IOBuffer
        seekstart: coreio.seekstart, // Base.seekstart
        read: coreio.read,           // Base.read
        stdout: coreio.stdout,       // Base.stdout

        // -- strings
        String: strings.String,      // Base.String
        string: strings.string,      // Base.string
        repr: strings.repr,          // Base.repr

        // -- range
        range: ranges.range,         // Base.range

        // -- float
        Inf: floats.Inf,             // Base.Inf

        // -- array
        push: arrays.push,           // Base.push
        pushfirst: arrays.pushfirst, // Base.pushfirst
        splice: arrays.splice,       // Base.splice
        map: arrays.map,             // Base.map

        // -- parse
        parse: parsing.parse,        // Base.parse
    }
    return Base
}


module.exports = {
    Base: get_base(),
}

},{"./array.js":10,"./boot.js":11,"./coreio.js":12,"./float.js":13,"./parse.js":14,"./range.js":15,"./strings.js":16}],7:[function(require,module,exports){
// mucko Meta.js

function get_meta() {
    var boot = require("./boot.js")
    let DataType = boot.DataType
    let Undefined = boot.Undefined
    let Null = boot.Null
    Meta = {
        // Meta.isa
        isa: function(x, typ) {
            return this.typeof(x) === typ
        },

        // Meta.isundef
        isundef: function(x) {
            return x === undefined
        },

        // Meta.typeof
        typeof: function(x) {
            let typ = typeof(x)
            switch (typ) {
            case "string": return String
            case "number": return Number
            case "boolean": return Boolean
            case "undefined": return Undefined
            default: break
            }

            switch (x) {
            case String: return DataType
            case Number: return DataType
            case Boolean: return DataType
            case Object: return DataType
            case Function: return DataType
            case Array: return DataType
            case Undefined: return DataType
            default: break
            }

            switch (typ) {
            case "function": return Function
            default: break
            }

            if ("object" === typ) {
            switch (x) {
            case null: return Null
            default: return x.constructor
            }
            } // if "object" === typ

            return typ
        },

        // Meta.body
        body: function (f) {
            if (this.typeof(f) === Function) {
                str = f.toString()
                return str.substring(str.indexOf('{')+1, str.lastIndexOf('}')).trim()
            } else {
                throw Error("Not a Function")
            }
        }
    }
    return Meta
}


module.exports = {
    Meta: get_meta(),
}

},{"./boot.js":11}],8:[function(require,module,exports){
// mucko Sys.js

function get_sys() {
    Sys = {
        // Sys.isbrowser
        isbrowser: function() {
            return typeof window !== "undefined"
        },
    }
    return Sys
}


module.exports = {
    Sys: get_sys(),
}

},{}],9:[function(require,module,exports){
(function (process){
// mucko UnitTest.js

Test = {}
DOT = "."
LF = "\n"

function print(str) {
  if ('undefined' == typeof(window)) {
    process.stdout.write(str)
  } else {
    document.getElementById('stdout').innerHTML += str
  }
}
function puts(str) {
  print(str + LF)
}

function inspect(value) {
  if ('function' == typeof(value)) {
    return value.toString()
  } else {
    return JSON.stringify(value)
  }
}

function deep_equal(a,b) {
  if (a == b) {
    return true
  } else if ('object' == typeof(a) && 'object' == typeof(b)) {
    return inspect(a) == inspect(b)
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
      puts('passed: ' + inspect(expected))
    }
  } else {
    puts('\nAssertion failed in ' +
         extract_filename_line_from_stack_trace())
    puts('Expected: ' + inspect(expected))
    puts('Got: ' + inspect(got))
    UnitTest.failed += 1
  }
}

assert_true = function(expected) {
  _assert_true(expected)
}

test_throws = function(errmsg, f) {
    got_the_error = false
    try {
        f()
    } catch (err) {
        if (Error === errmsg) {
            got_the_error = true
        } else if (errmsg.message == err.message) {
            got_the_error = true
        }
    }
    if (!got_the_error) {
        puts('\nAssertion failed in ' + f)
        puts('Expected: ' + errmsg)
        UnitTest.failed += 1
    }
}

var _assert_true = function(is_true) {
  if (is_true == true) {
    UnitTest.passed += 1
    if (UnitTest.dot_if_passed) {
      print(DOT)
    } else {
      puts('passed: ' + true)
    }
  } else {
    puts('\nAssertion failed in ' +
         extract_filename_line_from_stack_trace())
    puts('Expected: ' + true)
    puts('Got: ' + is_true)
    UnitTest.failed += 1
  }
}

var extract_filename_line_from_stack_trace = function() {
  if ('undefined' == typeof(window)) {
    Error.captureStackTrace(Test,
      extract_filename_line_from_stack_trace)
    var line = Test.stack.split(LF).slice(3,4).toString()
    return line.match(/\(.*\/(.*):\d+:*\)/)[1]
  } else {
    return arguments.callee.caller.caller.caller
  }
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


module.exports = {
    UnitTest,
    Test,
}

}).call(this,require('_process'))
},{"_process":21}],10:[function(require,module,exports){
// mucko Base array.js

var meta = require("./Meta.js")
var Meta = meta.Meta


function push(a, item) {
    a.push(item)
}

function pushfirst(a, item) {
    a.unshift(item)
}

function splice(a, i, replacement=[]) {
    if (Meta.typeof(replacement) === Array) {
       return Array.prototype.splice.apply(a, [i, 1].concat(replacement))
    } else {
       return a.splice(i, 1, replacement)
    }
}

function map(f, a) {
    return a.map(f)
}


module.exports = {
    push,
    pushfirst,
    splice,
    map,
}

},{"./Meta.js":7}],11:[function(require,module,exports){
// mucko Base boot.js

class DataType {
}

class Undefined {
}

class Null {
}

class Nothing {
}

class Int extends Number {
}

class Float64 extends Number {
}


module.exports = {
    DataType,
    Undefined,
    Null,
    Nothing,
    nothing: new Nothing(),
    Bool: Boolean,
    Int,
    Float64,
}

},{}],12:[function(require,module,exports){
// mucko Base coreio.js

var meta = require("./Meta.js")
var Meta = meta.Meta
var strings = require("./strings.js")


function IOBuffer() {
    this.data = new Uint8Array([])
    this.ptr = 0
}
IOBuffer.prototype.constructor = IOBuffer

function TTY() {
}

function println(io, ...args) {
    if (Meta.isa(io, IOBuffer)) {
        function concatBuffer(a, b) {
            var tmp = new Uint8Array(a.byteLength + b.byteLength)
            tmp.set(new Uint8Array(a), 0)
            tmp.set(new Uint8Array(b), a.byteLength)
            return tmp.buffer
        }
        arr = new TextEncoder().encode(strings.string(args, '\n'))
        io.data = concatBuffer(io.data, arr)
        io.ptr += arr.length
    } else {
        console.log.apply(console, [io].concat(args))
    }
}

function seekstart(io) {
    io.ptr = 0
}

function read(io) {
    len = io.data.byteLength
    arr = io.data.slice(io.ptr, len)
    io.ptr = len
    return arr
}


module.exports = {
    println,
    IOBuffer,
    seekstart,
    read,
    stdout: new TTY(),
}

},{"./Meta.js":7,"./strings.js":16}],13:[function(require,module,exports){
// mucko Base float.js

Inf = Infinity


module.exports = {
    Inf,
}

},{}],14:[function(require,module,exports){
// mucko Base parse.js

var boot = require("./boot.js")


function parse(typ, str) {
    let Int = boot.Int
    let Float64 = boot.Float64
    switch (typ) {
    case Int:
       return parseInt(str)
    case Float64:
       return parseFloat(str)
    }
}


module.exports = {
    parse,
}

},{"./boot.js":11}],15:[function(require,module,exports){
// mucko Base range.js

var boot = require("./boot.js")
let nothing = boot.nothing


function _range(start, {step=1, stop=nothing}) {
  // https://github.com/d3/d3-array/blob/master/src/range.js
  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }
  return range
}


module.exports = {
    range: _range,
}

},{"./boot.js":11}],16:[function(require,module,exports){
(function (Buffer){
// mucko Base strings.js

var meta = require("./Meta.js")
var boot = require("./boot.js")
var Meta = meta.Meta


function _String(buf) {
    if (typeof Buffer === "undefined") {
        return new TextDecoder('utf8').decode(buf)
    } else {
        return Buffer.from(buf).toString('utf8')
    }
}

function string() {
    let DataType = boot.DataType
    var out = '';
    for (var i=0; i < arguments.length; i++) {
        let x = arguments[i];
        if (Meta.typeof(x) == DataType) {
            out += x.name;
        } else {
            out += x;
        }
    }
    return out;
}

function repr(x) {
    let typ = typeof(x);
    let quot = '"';
    switch (typ) {
    case "string": return string(quot, x, quot);
    default: return string(x);
    }
}


module.exports = {
    String: _String,
    string,
    repr,
}

}).call(this,require("buffer").Buffer)
},{"./Meta.js":7,"./boot.js":11,"buffer":19}],17:[function(require,module,exports){
// mucko util.js

util = {
    // util.require
    require: function(path) {
        return require(path)
    }
}


module.exports = {
    util,
}

},{}],18:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],19:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":18,"ieee754":20}],20:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],21:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"mucko":[function(require,module,exports){
// mucko index.js

var { Meta, Undefined, Null, DataType, Bool, Nothing, nothing } = require("./src/Meta.js")
var { UnitTest, Test } = require("./src/UnitTest.js")
var { Base } = require("./src/Base.js")
var { Sys } = require("./src/Sys.js")
var { util } = require("./src/util.js")


module.exports = {
    Meta, Undefined, Null, DataType, Bool, Nothing, nothing,
    UnitTest, Test,
    Base,
    Sys,
    util,
}

},{"./src/Base.js":6,"./src/Meta.js":7,"./src/Sys.js":8,"./src/UnitTest.js":9,"./src/util.js":17}],"nouislider":[function(require,module,exports){
/*! nouislider - 12.1.0 - 10/25/2018 */
(function(factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === "object") {
        // Node/CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        window.noUiSlider = factory();
    }
})(function() {
    "use strict";

    var VERSION = "12.1.0";

    function isValidFormatter(entry) {
        return typeof entry === "object" && typeof entry.to === "function" && typeof entry.from === "function";
    }

    function removeElement(el) {
        el.parentElement.removeChild(el);
    }

    function isSet(value) {
        return value !== null && value !== undefined;
    }

    // Bindable version
    function preventDefault(e) {
        e.preventDefault();
    }

    // Removes duplicates from an array.
    function unique(array) {
        return array.filter(function(a) {
            return !this[a] ? (this[a] = true) : false;
        }, {});
    }

    // Round a value to the closest 'to'.
    function closest(value, to) {
        return Math.round(value / to) * to;
    }

    // Current position of an element relative to the document.
    function offset(elem, orientation) {
        var rect = elem.getBoundingClientRect();
        var doc = elem.ownerDocument;
        var docElem = doc.documentElement;
        var pageOffset = getPageOffset(doc);

        // getBoundingClientRect contains left scroll in Chrome on Android.
        // I haven't found a feature detection that proves this. Worst case
        // scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
        if (/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)) {
            pageOffset.x = 0;
        }

        return orientation
            ? rect.top + pageOffset.y - docElem.clientTop
            : rect.left + pageOffset.x - docElem.clientLeft;
    }

    // Checks whether a value is numerical.
    function isNumeric(a) {
        return typeof a === "number" && !isNaN(a) && isFinite(a);
    }

    // Sets a class and removes it after [duration] ms.
    function addClassFor(element, className, duration) {
        if (duration > 0) {
            addClass(element, className);
            setTimeout(function() {
                removeClass(element, className);
            }, duration);
        }
    }

    // Limits a value to 0 - 100
    function limit(a) {
        return Math.max(Math.min(a, 100), 0);
    }

    // Wraps a variable as an array, if it isn't one yet.
    // Note that an input array is returned by reference!
    function asArray(a) {
        return Array.isArray(a) ? a : [a];
    }

    // Counts decimals
    function countDecimals(numStr) {
        numStr = String(numStr);
        var pieces = numStr.split(".");
        return pieces.length > 1 ? pieces[1].length : 0;
    }

    // http://youmightnotneedjquery.com/#add_class
    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += " " + className;
        }
    }

    // http://youmightnotneedjquery.com/#remove_class
    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(
                new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
                " "
            );
        }
    }

    // https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
    function hasClass(el, className) {
        return el.classList
            ? el.classList.contains(className)
            : new RegExp("\\b" + className + "\\b").test(el.className);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
    function getPageOffset(doc) {
        var supportPageOffset = window.pageXOffset !== undefined;
        var isCSS1Compat = (doc.compatMode || "") === "CSS1Compat";
        var x = supportPageOffset
            ? window.pageXOffset
            : isCSS1Compat
                ? doc.documentElement.scrollLeft
                : doc.body.scrollLeft;
        var y = supportPageOffset
            ? window.pageYOffset
            : isCSS1Compat
                ? doc.documentElement.scrollTop
                : doc.body.scrollTop;

        return {
            x: x,
            y: y
        };
    }

    // we provide a function to compute constants instead
    // of accessing window.* as soon as the module needs it
    // so that we do not compute anything if not needed
    function getActions() {
        // Determine the events to bind. IE11 implements pointerEvents without
        // a prefix, which breaks compatibility with the IE10 implementation.
        return window.navigator.pointerEnabled
            ? {
                  start: "pointerdown",
                  move: "pointermove",
                  end: "pointerup"
              }
            : window.navigator.msPointerEnabled
                ? {
                      start: "MSPointerDown",
                      move: "MSPointerMove",
                      end: "MSPointerUp"
                  }
                : {
                      start: "mousedown touchstart",
                      move: "mousemove touchmove",
                      end: "mouseup touchend"
                  };
    }

    // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
    // Issue #785
    function getSupportsPassive() {
        var supportsPassive = false;

        /* eslint-disable */
        try {
            var opts = Object.defineProperty({}, "passive", {
                get: function() {
                    supportsPassive = true;
                }
            });

            window.addEventListener("test", null, opts);
        } catch (e) {}
        /* eslint-enable */

        return supportsPassive;
    }

    function getSupportsTouchActionNone() {
        return window.CSS && CSS.supports && CSS.supports("touch-action", "none");
    }

    // Value calculation

    // Determine the size of a sub-range in relation to a full range.
    function subRangeRatio(pa, pb) {
        return 100 / (pb - pa);
    }

    // (percentage) How many percent is this value of this range?
    function fromPercentage(range, value) {
        return (value * 100) / (range[1] - range[0]);
    }

    // (percentage) Where is this value on this range?
    function toPercentage(range, value) {
        return fromPercentage(range, range[0] < 0 ? value + Math.abs(range[0]) : value - range[0]);
    }

    // (value) How much is this percentage on this range?
    function isPercentage(range, value) {
        return (value * (range[1] - range[0])) / 100 + range[0];
    }

    // Range conversion

    function getJ(value, arr) {
        var j = 1;

        while (value >= arr[j]) {
            j += 1;
        }

        return j;
    }

    // (percentage) Input a value, find where, on a scale of 0-100, it applies.
    function toStepping(xVal, xPct, value) {
        if (value >= xVal.slice(-1)[0]) {
            return 100;
        }

        var j = getJ(value, xVal);
        var va = xVal[j - 1];
        var vb = xVal[j];
        var pa = xPct[j - 1];
        var pb = xPct[j];

        return pa + toPercentage([va, vb], value) / subRangeRatio(pa, pb);
    }

    // (value) Input a percentage, find where it is on the specified range.
    function fromStepping(xVal, xPct, value) {
        // There is no range group that fits 100
        if (value >= 100) {
            return xVal.slice(-1)[0];
        }

        var j = getJ(value, xPct);
        var va = xVal[j - 1];
        var vb = xVal[j];
        var pa = xPct[j - 1];
        var pb = xPct[j];

        return isPercentage([va, vb], (value - pa) * subRangeRatio(pa, pb));
    }

    // (percentage) Get the step that applies at a certain value.
    function getStep(xPct, xSteps, snap, value) {
        if (value === 100) {
            return value;
        }

        var j = getJ(value, xPct);
        var a = xPct[j - 1];
        var b = xPct[j];

        // If 'snap' is set, steps are used as fixed points on the slider.
        if (snap) {
            // Find the closest position, a or b.
            if (value - a > (b - a) / 2) {
                return b;
            }

            return a;
        }

        if (!xSteps[j - 1]) {
            return value;
        }

        return xPct[j - 1] + closest(value - xPct[j - 1], xSteps[j - 1]);
    }

    // Entry parsing

    function handleEntryPoint(index, value, that) {
        var percentage;

        // Wrap numerical input in an array.
        if (typeof value === "number") {
            value = [value];
        }

        // Reject any invalid input, by testing whether value is an array.
        if (!Array.isArray(value)) {
            throw new Error("noUiSlider (" + VERSION + "): 'range' contains invalid value.");
        }

        // Covert min/max syntax to 0 and 100.
        if (index === "min") {
            percentage = 0;
        } else if (index === "max") {
            percentage = 100;
        } else {
            percentage = parseFloat(index);
        }

        // Check for correct input.
        if (!isNumeric(percentage) || !isNumeric(value[0])) {
            throw new Error("noUiSlider (" + VERSION + "): 'range' value isn't numeric.");
        }

        // Store values.
        that.xPct.push(percentage);
        that.xVal.push(value[0]);

        // NaN will evaluate to false too, but to keep
        // logging clear, set step explicitly. Make sure
        // not to override the 'step' setting with false.
        if (!percentage) {
            if (!isNaN(value[1])) {
                that.xSteps[0] = value[1];
            }
        } else {
            that.xSteps.push(isNaN(value[1]) ? false : value[1]);
        }

        that.xHighestCompleteStep.push(0);
    }

    function handleStepPoint(i, n, that) {
        // Ignore 'false' stepping.
        if (!n) {
            return true;
        }

        // Factor to range ratio
        that.xSteps[i] =
            fromPercentage([that.xVal[i], that.xVal[i + 1]], n) / subRangeRatio(that.xPct[i], that.xPct[i + 1]);

        var totalSteps = (that.xVal[i + 1] - that.xVal[i]) / that.xNumSteps[i];
        var highestStep = Math.ceil(Number(totalSteps.toFixed(3)) - 1);
        var step = that.xVal[i] + that.xNumSteps[i] * highestStep;

        that.xHighestCompleteStep[i] = step;
    }

    // Interface

    function Spectrum(entry, snap, singleStep) {
        this.xPct = [];
        this.xVal = [];
        this.xSteps = [singleStep || false];
        this.xNumSteps = [false];
        this.xHighestCompleteStep = [];

        this.snap = snap;

        var index;
        var ordered = []; // [0, 'min'], [1, '50%'], [2, 'max']

        // Map the object keys to an array.
        for (index in entry) {
            if (entry.hasOwnProperty(index)) {
                ordered.push([entry[index], index]);
            }
        }

        // Sort all entries by value (numeric sort).
        if (ordered.length && typeof ordered[0][0] === "object") {
            ordered.sort(function(a, b) {
                return a[0][0] - b[0][0];
            });
        } else {
            ordered.sort(function(a, b) {
                return a[0] - b[0];
            });
        }

        // Convert all entries to subranges.
        for (index = 0; index < ordered.length; index++) {
            handleEntryPoint(ordered[index][1], ordered[index][0], this);
        }

        // Store the actual step values.
        // xSteps is sorted in the same order as xPct and xVal.
        this.xNumSteps = this.xSteps.slice(0);

        // Convert all numeric steps to the percentage of the subrange they represent.
        for (index = 0; index < this.xNumSteps.length; index++) {
            handleStepPoint(index, this.xNumSteps[index], this);
        }
    }

    Spectrum.prototype.getMargin = function(value) {
        var step = this.xNumSteps[0];

        if (step && (value / step) % 1 !== 0) {
            throw new Error("noUiSlider (" + VERSION + "): 'limit', 'margin' and 'padding' must be divisible by step.");
        }

        return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
    };

    Spectrum.prototype.toStepping = function(value) {
        value = toStepping(this.xVal, this.xPct, value);

        return value;
    };

    Spectrum.prototype.fromStepping = function(value) {
        return fromStepping(this.xVal, this.xPct, value);
    };

    Spectrum.prototype.getStep = function(value) {
        value = getStep(this.xPct, this.xSteps, this.snap, value);

        return value;
    };

    Spectrum.prototype.getNearbySteps = function(value) {
        var j = getJ(value, this.xPct);

        return {
            stepBefore: {
                startValue: this.xVal[j - 2],
                step: this.xNumSteps[j - 2],
                highestStep: this.xHighestCompleteStep[j - 2]
            },
            thisStep: {
                startValue: this.xVal[j - 1],
                step: this.xNumSteps[j - 1],
                highestStep: this.xHighestCompleteStep[j - 1]
            },
            stepAfter: {
                startValue: this.xVal[j],
                step: this.xNumSteps[j],
                highestStep: this.xHighestCompleteStep[j]
            }
        };
    };

    Spectrum.prototype.countStepDecimals = function() {
        var stepDecimals = this.xNumSteps.map(countDecimals);
        return Math.max.apply(null, stepDecimals);
    };

    // Outside testing
    Spectrum.prototype.convert = function(value) {
        return this.getStep(this.toStepping(value));
    };

    /*	Every input option is tested and parsed. This'll prevent
        endless validation in internal methods. These tests are
        structured with an item for every option available. An
        option can be marked as required by setting the 'r' flag.
        The testing function is provided with three arguments:
            - The provided value for the option;
            - A reference to the options object;
            - The name for the option;

        The testing function returns false when an error is detected,
        or true when everything is OK. It can also modify the option
        object, to make sure all values can be correctly looped elsewhere. */

    var defaultFormatter = {
        to: function(value) {
            return value !== undefined && value.toFixed(2);
        },
        from: Number
    };

    function validateFormat(entry) {
        // Any object with a to and from method is supported.
        if (isValidFormatter(entry)) {
            return true;
        }

        throw new Error("noUiSlider (" + VERSION + "): 'format' requires 'to' and 'from' methods.");
    }

    function testStep(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error("noUiSlider (" + VERSION + "): 'step' is not numeric.");
        }

        // The step option can still be used to set stepping
        // for linear sliders. Overwritten if set in 'range'.
        parsed.singleStep = entry;
    }

    function testRange(parsed, entry) {
        // Filter incorrect input.
        if (typeof entry !== "object" || Array.isArray(entry)) {
            throw new Error("noUiSlider (" + VERSION + "): 'range' is not an object.");
        }

        // Catch missing start or end.
        if (entry.min === undefined || entry.max === undefined) {
            throw new Error("noUiSlider (" + VERSION + "): Missing 'min' or 'max' in 'range'.");
        }

        // Catch equal start or end.
        if (entry.min === entry.max) {
            throw new Error("noUiSlider (" + VERSION + "): 'range' 'min' and 'max' cannot be equal.");
        }

        parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.singleStep);
    }

    function testStart(parsed, entry) {
        entry = asArray(entry);

        // Validate input. Values aren't tested, as the public .val method
        // will always provide a valid location.
        if (!Array.isArray(entry) || !entry.length) {
            throw new Error("noUiSlider (" + VERSION + "): 'start' option is incorrect.");
        }

        // Store the number of handles.
        parsed.handles = entry.length;

        // When the slider is initialized, the .val method will
        // be called with the start options.
        parsed.start = entry;
    }

    function testSnap(parsed, entry) {
        // Enforce 100% stepping within subranges.
        parsed.snap = entry;

        if (typeof entry !== "boolean") {
            throw new Error("noUiSlider (" + VERSION + "): 'snap' option must be a boolean.");
        }
    }

    function testAnimate(parsed, entry) {
        // Enforce 100% stepping within subranges.
        parsed.animate = entry;

        if (typeof entry !== "boolean") {
            throw new Error("noUiSlider (" + VERSION + "): 'animate' option must be a boolean.");
        }
    }

    function testAnimationDuration(parsed, entry) {
        parsed.animationDuration = entry;

        if (typeof entry !== "number") {
            throw new Error("noUiSlider (" + VERSION + "): 'animationDuration' option must be a number.");
        }
    }

    function testConnect(parsed, entry) {
        var connect = [false];
        var i;

        // Map legacy options
        if (entry === "lower") {
            entry = [true, false];
        } else if (entry === "upper") {
            entry = [false, true];
        }

        // Handle boolean options
        if (entry === true || entry === false) {
            for (i = 1; i < parsed.handles; i++) {
                connect.push(entry);
            }

            connect.push(false);
        }

        // Reject invalid input
        else if (!Array.isArray(entry) || !entry.length || entry.length !== parsed.handles + 1) {
            throw new Error("noUiSlider (" + VERSION + "): 'connect' option doesn't match handle count.");
        } else {
            connect = entry;
        }

        parsed.connect = connect;
    }

    function testOrientation(parsed, entry) {
        // Set orientation to an a numerical value for easy
        // array selection.
        switch (entry) {
            case "horizontal":
                parsed.ort = 0;
                break;
            case "vertical":
                parsed.ort = 1;
                break;
            default:
                throw new Error("noUiSlider (" + VERSION + "): 'orientation' option is invalid.");
        }
    }

    function testMargin(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error("noUiSlider (" + VERSION + "): 'margin' option must be numeric.");
        }

        // Issue #582
        if (entry === 0) {
            return;
        }

        parsed.margin = parsed.spectrum.getMargin(entry);

        if (!parsed.margin) {
            throw new Error("noUiSlider (" + VERSION + "): 'margin' option is only supported on linear sliders.");
        }
    }

    function testLimit(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error("noUiSlider (" + VERSION + "): 'limit' option must be numeric.");
        }

        parsed.limit = parsed.spectrum.getMargin(entry);

        if (!parsed.limit || parsed.handles < 2) {
            throw new Error(
                "noUiSlider (" +
                    VERSION +
                    "): 'limit' option is only supported on linear sliders with 2 or more handles."
            );
        }
    }

    function testPadding(parsed, entry) {
        if (!isNumeric(entry) && !Array.isArray(entry)) {
            throw new Error(
                "noUiSlider (" + VERSION + "): 'padding' option must be numeric or array of exactly 2 numbers."
            );
        }

        if (Array.isArray(entry) && !(entry.length === 2 || isNumeric(entry[0]) || isNumeric(entry[1]))) {
            throw new Error(
                "noUiSlider (" + VERSION + "): 'padding' option must be numeric or array of exactly 2 numbers."
            );
        }

        if (entry === 0) {
            return;
        }

        if (!Array.isArray(entry)) {
            entry = [entry, entry];
        }

        // 'getMargin' returns false for invalid values.
        parsed.padding = [parsed.spectrum.getMargin(entry[0]), parsed.spectrum.getMargin(entry[1])];

        if (parsed.padding[0] === false || parsed.padding[1] === false) {
            throw new Error("noUiSlider (" + VERSION + "): 'padding' option is only supported on linear sliders.");
        }

        if (parsed.padding[0] < 0 || parsed.padding[1] < 0) {
            throw new Error("noUiSlider (" + VERSION + "): 'padding' option must be a positive number(s).");
        }

        if (parsed.padding[0] + parsed.padding[1] >= 100) {
            throw new Error("noUiSlider (" + VERSION + "): 'padding' option must not exceed 100% of the range.");
        }
    }

    function testDirection(parsed, entry) {
        // Set direction as a numerical value for easy parsing.
        // Invert connection for RTL sliders, so that the proper
        // handles get the connect/background classes.
        switch (entry) {
            case "ltr":
                parsed.dir = 0;
                break;
            case "rtl":
                parsed.dir = 1;
                break;
            default:
                throw new Error("noUiSlider (" + VERSION + "): 'direction' option was not recognized.");
        }
    }

    function testBehaviour(parsed, entry) {
        // Make sure the input is a string.
        if (typeof entry !== "string") {
            throw new Error("noUiSlider (" + VERSION + "): 'behaviour' must be a string containing options.");
        }

        // Check if the string contains any keywords.
        // None are required.
        var tap = entry.indexOf("tap") >= 0;
        var drag = entry.indexOf("drag") >= 0;
        var fixed = entry.indexOf("fixed") >= 0;
        var snap = entry.indexOf("snap") >= 0;
        var hover = entry.indexOf("hover") >= 0;
        var unconstrained = entry.indexOf("unconstrained") >= 0;

        if (fixed) {
            if (parsed.handles !== 2) {
                throw new Error("noUiSlider (" + VERSION + "): 'fixed' behaviour must be used with 2 handles");
            }

            // Use margin to enforce fixed state
            testMargin(parsed, parsed.start[1] - parsed.start[0]);
        }

        if (unconstrained && (parsed.margin || parsed.limit)) {
            throw new Error(
                "noUiSlider (" + VERSION + "): 'unconstrained' behaviour cannot be used with margin or limit"
            );
        }

        parsed.events = {
            tap: tap || snap,
            drag: drag,
            fixed: fixed,
            snap: snap,
            hover: hover,
            unconstrained: unconstrained
        };
    }

    function testTooltips(parsed, entry) {
        if (entry === false) {
            return;
        }

        if (entry === true) {
            parsed.tooltips = [];

            for (var i = 0; i < parsed.handles; i++) {
                parsed.tooltips.push(true);
            }
        } else {
            parsed.tooltips = asArray(entry);

            if (parsed.tooltips.length !== parsed.handles) {
                throw new Error("noUiSlider (" + VERSION + "): must pass a formatter for all handles.");
            }

            parsed.tooltips.forEach(function(formatter) {
                if (
                    typeof formatter !== "boolean" &&
                    (typeof formatter !== "object" || typeof formatter.to !== "function")
                ) {
                    throw new Error("noUiSlider (" + VERSION + "): 'tooltips' must be passed a formatter or 'false'.");
                }
            });
        }
    }

    function testAriaFormat(parsed, entry) {
        parsed.ariaFormat = entry;
        validateFormat(entry);
    }

    function testFormat(parsed, entry) {
        parsed.format = entry;
        validateFormat(entry);
    }

    function testKeyboardSupport(parsed, entry) {
        parsed.keyboardSupport = entry;

        if (typeof entry !== "boolean") {
            throw new Error("noUiSlider (" + VERSION + "): 'keyboardSupport' option must be a boolean.");
        }
    }

    function testDocumentElement(parsed, entry) {
        // This is an advanced option. Passed values are used without validation.
        parsed.documentElement = entry;
    }

    function testCssPrefix(parsed, entry) {
        if (typeof entry !== "string" && entry !== false) {
            throw new Error("noUiSlider (" + VERSION + "): 'cssPrefix' must be a string or `false`.");
        }

        parsed.cssPrefix = entry;
    }

    function testCssClasses(parsed, entry) {
        if (typeof entry !== "object") {
            throw new Error("noUiSlider (" + VERSION + "): 'cssClasses' must be an object.");
        }

        if (typeof parsed.cssPrefix === "string") {
            parsed.cssClasses = {};

            for (var key in entry) {
                if (!entry.hasOwnProperty(key)) {
                    continue;
                }

                parsed.cssClasses[key] = parsed.cssPrefix + entry[key];
            }
        } else {
            parsed.cssClasses = entry;
        }
    }

    // Test all developer settings and parse to assumption-safe values.
    function testOptions(options) {
        // To prove a fix for #537, freeze options here.
        // If the object is modified, an error will be thrown.
        // Object.freeze(options);

        var parsed = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: true,
            animationDuration: 300,
            ariaFormat: defaultFormatter,
            format: defaultFormatter
        };

        // Tests are executed in the order they are presented here.
        var tests = {
            step: { r: false, t: testStep },
            start: { r: true, t: testStart },
            connect: { r: true, t: testConnect },
            direction: { r: true, t: testDirection },
            snap: { r: false, t: testSnap },
            animate: { r: false, t: testAnimate },
            animationDuration: { r: false, t: testAnimationDuration },
            range: { r: true, t: testRange },
            orientation: { r: false, t: testOrientation },
            margin: { r: false, t: testMargin },
            limit: { r: false, t: testLimit },
            padding: { r: false, t: testPadding },
            behaviour: { r: true, t: testBehaviour },
            ariaFormat: { r: false, t: testAriaFormat },
            format: { r: false, t: testFormat },
            tooltips: { r: false, t: testTooltips },
            keyboardSupport: { r: true, t: testKeyboardSupport },
            documentElement: { r: false, t: testDocumentElement },
            cssPrefix: { r: true, t: testCssPrefix },
            cssClasses: { r: true, t: testCssClasses }
        };

        var defaults = {
            connect: false,
            direction: "ltr",
            behaviour: "tap",
            orientation: "horizontal",
            keyboardSupport: true,
            cssPrefix: "noUi-",
            cssClasses: {
                target: "target",
                base: "base",
                origin: "origin",
                handle: "handle",
                handleLower: "handle-lower",
                handleUpper: "handle-upper",
                horizontal: "horizontal",
                vertical: "vertical",
                background: "background",
                connect: "connect",
                connects: "connects",
                ltr: "ltr",
                rtl: "rtl",
                draggable: "draggable",
                drag: "state-drag",
                tap: "state-tap",
                active: "active",
                tooltip: "tooltip",
                pips: "pips",
                pipsHorizontal: "pips-horizontal",
                pipsVertical: "pips-vertical",
                marker: "marker",
                markerHorizontal: "marker-horizontal",
                markerVertical: "marker-vertical",
                markerNormal: "marker-normal",
                markerLarge: "marker-large",
                markerSub: "marker-sub",
                value: "value",
                valueHorizontal: "value-horizontal",
                valueVertical: "value-vertical",
                valueNormal: "value-normal",
                valueLarge: "value-large",
                valueSub: "value-sub"
            }
        };

        // AriaFormat defaults to regular format, if any.
        if (options.format && !options.ariaFormat) {
            options.ariaFormat = options.format;
        }

        // Run all options through a testing mechanism to ensure correct
        // input. It should be noted that options might get modified to
        // be handled properly. E.g. wrapping integers in arrays.
        Object.keys(tests).forEach(function(name) {
            // If the option isn't set, but it is required, throw an error.
            if (!isSet(options[name]) && defaults[name] === undefined) {
                if (tests[name].r) {
                    throw new Error("noUiSlider (" + VERSION + "): '" + name + "' is required.");
                }

                return true;
            }

            tests[name].t(parsed, !isSet(options[name]) ? defaults[name] : options[name]);
        });

        // Forward pips options
        parsed.pips = options.pips;

        // All recent browsers accept unprefixed transform.
        // We need -ms- for IE9 and -webkit- for older Android;
        // Assume use of -webkit- if unprefixed and -ms- are not supported.
        // https://caniuse.com/#feat=transforms2d
        var d = document.createElement("div");
        var msPrefix = d.style.msTransform !== undefined;
        var noPrefix = d.style.transform !== undefined;

        parsed.transformRule = noPrefix ? "transform" : msPrefix ? "msTransform" : "webkitTransform";

        // Pips don't move, so we can place them using left/top.
        var styles = [["left", "top"], ["right", "bottom"]];

        parsed.style = styles[parsed.dir][parsed.ort];

        return parsed;
    }

    function scope(target, options, originalOptions) {
        var actions = getActions();
        var supportsTouchActionNone = getSupportsTouchActionNone();
        var supportsPassive = supportsTouchActionNone && getSupportsPassive();

        // All variables local to 'scope' are prefixed with 'scope_'
        var scope_Target = target;
        var scope_Locations = [];
        var scope_Base;
        var scope_Handles;
        var scope_HandleNumbers = [];
        var scope_ActiveHandlesCount = 0;
        var scope_Connects;
        var scope_Spectrum = options.spectrum;
        var scope_Values = [];
        var scope_Events = {};
        var scope_Self;
        var scope_Pips;
        var scope_Document = target.ownerDocument;
        var scope_DocumentElement = options.documentElement || scope_Document.documentElement;
        var scope_Body = scope_Document.body;

        // Pips constants
        var PIPS_NONE = -1;
        var PIPS_NO_VALUE = 0;
        var PIPS_LARGE_VALUE = 1;
        var PIPS_SMALL_VALUE = 2;

        // For horizontal sliders in standard ltr documents,
        // make .noUi-origin overflow to the left so the document doesn't scroll.
        var scope_DirOffset = scope_Document.dir === "rtl" || options.ort === 1 ? 0 : 100;

        // Creates a node, adds it to target, returns the new node.
        function addNodeTo(addTarget, className) {
            var div = scope_Document.createElement("div");

            if (className) {
                addClass(div, className);
            }

            addTarget.appendChild(div);

            return div;
        }

        // Append a origin to the base
        function addOrigin(base, handleNumber) {
            var origin = addNodeTo(base, options.cssClasses.origin);
            var handle = addNodeTo(origin, options.cssClasses.handle);

            handle.setAttribute("data-handle", handleNumber);

            if (options.keyboardSupport) {
                // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
                // 0 = focusable and reachable
                handle.setAttribute("tabindex", "0");
            }

            handle.setAttribute("role", "slider");
            handle.setAttribute("aria-orientation", options.ort ? "vertical" : "horizontal");

            if (handleNumber === 0) {
                addClass(handle, options.cssClasses.handleLower);
            } else if (handleNumber === options.handles - 1) {
                addClass(handle, options.cssClasses.handleUpper);
            }

            return origin;
        }

        // Insert nodes for connect elements
        function addConnect(base, add) {
            if (!add) {
                return false;
            }

            return addNodeTo(base, options.cssClasses.connect);
        }

        // Add handles to the slider base.
        function addElements(connectOptions, base) {
            var connectBase = addNodeTo(base, options.cssClasses.connects);

            scope_Handles = [];
            scope_Connects = [];

            scope_Connects.push(addConnect(connectBase, connectOptions[0]));

            // [::::O====O====O====]
            // connectOptions = [0, 1, 1, 1]

            for (var i = 0; i < options.handles; i++) {
                // Keep a list of all added handles.
                scope_Handles.push(addOrigin(base, i));
                scope_HandleNumbers[i] = i;
                scope_Connects.push(addConnect(connectBase, connectOptions[i + 1]));
            }
        }

        // Initialize a single slider.
        function addSlider(addTarget) {
            // Apply classes and data to the target.
            addClass(addTarget, options.cssClasses.target);

            if (options.dir === 0) {
                addClass(addTarget, options.cssClasses.ltr);
            } else {
                addClass(addTarget, options.cssClasses.rtl);
            }

            if (options.ort === 0) {
                addClass(addTarget, options.cssClasses.horizontal);
            } else {
                addClass(addTarget, options.cssClasses.vertical);
            }

            return addNodeTo(addTarget, options.cssClasses.base);
        }

        function addTooltip(handle, handleNumber) {
            if (!options.tooltips[handleNumber]) {
                return false;
            }

            return addNodeTo(handle.firstChild, options.cssClasses.tooltip);
        }

        // The tooltips option is a shorthand for using the 'update' event.
        function tooltips() {
            // Tooltips are added with options.tooltips in original order.
            var tips = scope_Handles.map(addTooltip);

            bindEvent("update", function(values, handleNumber, unencoded) {
                if (!tips[handleNumber]) {
                    return;
                }

                var formattedValue = values[handleNumber];

                if (options.tooltips[handleNumber] !== true) {
                    formattedValue = options.tooltips[handleNumber].to(unencoded[handleNumber]);
                }

                tips[handleNumber].innerHTML = formattedValue;
            });
        }

        function aria() {
            bindEvent("update", function(values, handleNumber, unencoded, tap, positions) {
                // Update Aria Values for all handles, as a change in one changes min and max values for the next.
                scope_HandleNumbers.forEach(function(index) {
                    var handle = scope_Handles[index];

                    var min = checkHandlePosition(scope_Locations, index, 0, true, true, true);
                    var max = checkHandlePosition(scope_Locations, index, 100, true, true, true);

                    var now = positions[index];

                    // Formatted value for display
                    var text = options.ariaFormat.to(unencoded[index]);

                    // Map to slider range values
                    min = scope_Spectrum.fromStepping(min).toFixed(1);
                    max = scope_Spectrum.fromStepping(max).toFixed(1);
                    now = scope_Spectrum.fromStepping(now).toFixed(1);

                    handle.children[0].setAttribute("aria-valuemin", min);
                    handle.children[0].setAttribute("aria-valuemax", max);
                    handle.children[0].setAttribute("aria-valuenow", now);
                    handle.children[0].setAttribute("aria-valuetext", text);
                });
            });
        }

        function getGroup(mode, values, stepped) {
            // Use the range.
            if (mode === "range" || mode === "steps") {
                return scope_Spectrum.xVal;
            }

            if (mode === "count") {
                if (values < 2) {
                    throw new Error("noUiSlider (" + VERSION + "): 'values' (>= 2) required for mode 'count'.");
                }

                // Divide 0 - 100 in 'count' parts.
                var interval = values - 1;
                var spread = 100 / interval;

                values = [];

                // List these parts and have them handled as 'positions'.
                while (interval--) {
                    values[interval] = interval * spread;
                }

                values.push(100);

                mode = "positions";
            }

            if (mode === "positions") {
                // Map all percentages to on-range values.
                return values.map(function(value) {
                    return scope_Spectrum.fromStepping(stepped ? scope_Spectrum.getStep(value) : value);
                });
            }

            if (mode === "values") {
                // If the value must be stepped, it needs to be converted to a percentage first.
                if (stepped) {
                    return values.map(function(value) {
                        // Convert to percentage, apply step, return to value.
                        return scope_Spectrum.fromStepping(scope_Spectrum.getStep(scope_Spectrum.toStepping(value)));
                    });
                }

                // Otherwise, we can simply use the values.
                return values;
            }
        }

        function generateSpread(density, mode, group) {
            function safeIncrement(value, increment) {
                // Avoid floating point variance by dropping the smallest decimal places.
                return (value + increment).toFixed(7) / 1;
            }

            var indexes = {};
            var firstInRange = scope_Spectrum.xVal[0];
            var lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length - 1];
            var ignoreFirst = false;
            var ignoreLast = false;
            var prevPct = 0;

            // Create a copy of the group, sort it and filter away all duplicates.
            group = unique(
                group.slice().sort(function(a, b) {
                    return a - b;
                })
            );

            // Make sure the range starts with the first element.
            if (group[0] !== firstInRange) {
                group.unshift(firstInRange);
                ignoreFirst = true;
            }

            // Likewise for the last one.
            if (group[group.length - 1] !== lastInRange) {
                group.push(lastInRange);
                ignoreLast = true;
            }

            group.forEach(function(current, index) {
                // Get the current step and the lower + upper positions.
                var step;
                var i;
                var q;
                var low = current;
                var high = group[index + 1];
                var newPct;
                var pctDifference;
                var pctPos;
                var type;
                var steps;
                var realSteps;
                var stepSize;
                var isSteps = mode === "steps";

                // When using 'steps' mode, use the provided steps.
                // Otherwise, we'll step on to the next subrange.
                if (isSteps) {
                    step = scope_Spectrum.xNumSteps[index];
                }

                // Default to a 'full' step.
                if (!step) {
                    step = high - low;
                }

                // Low can be 0, so test for false. If high is undefined,
                // we are at the last subrange. Index 0 is already handled.
                if (low === false || high === undefined) {
                    return;
                }

                // Make sure step isn't 0, which would cause an infinite loop (#654)
                step = Math.max(step, 0.0000001);

                // Find all steps in the subrange.
                for (i = low; i <= high; i = safeIncrement(i, step)) {
                    // Get the percentage value for the current step,
                    // calculate the size for the subrange.
                    newPct = scope_Spectrum.toStepping(i);
                    pctDifference = newPct - prevPct;

                    steps = pctDifference / density;
                    realSteps = Math.round(steps);

                    // This ratio represents the amount of percentage-space a point indicates.
                    // For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-divided.
                    // Round the percentage offset to an even number, then divide by two
                    // to spread the offset on both sides of the range.
                    stepSize = pctDifference / realSteps;

                    // Divide all points evenly, adding the correct number to this subrange.
                    // Run up to <= so that 100% gets a point, event if ignoreLast is set.
                    for (q = 1; q <= realSteps; q += 1) {
                        // The ratio between the rounded value and the actual size might be ~1% off.
                        // Correct the percentage offset by the number of points
                        // per subrange. density = 1 will result in 100 points on the
                        // full range, 2 for 50, 4 for 25, etc.
                        pctPos = prevPct + q * stepSize;
                        indexes[pctPos.toFixed(5)] = [scope_Spectrum.fromStepping(pctPos), 0];
                    }

                    // Determine the point type.
                    type = group.indexOf(i) > -1 ? PIPS_LARGE_VALUE : isSteps ? PIPS_SMALL_VALUE : PIPS_NO_VALUE;

                    // Enforce the 'ignoreFirst' option by overwriting the type for 0.
                    if (!index && ignoreFirst) {
                        type = 0;
                    }

                    if (!(i === high && ignoreLast)) {
                        // Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
                        indexes[newPct.toFixed(5)] = [i, type];
                    }

                    // Update the percentage count.
                    prevPct = newPct;
                }
            });

            return indexes;
        }

        function addMarking(spread, filterFunc, formatter) {
            var element = scope_Document.createElement("div");

            var valueSizeClasses = [];
            valueSizeClasses[PIPS_NO_VALUE] = options.cssClasses.valueNormal;
            valueSizeClasses[PIPS_LARGE_VALUE] = options.cssClasses.valueLarge;
            valueSizeClasses[PIPS_SMALL_VALUE] = options.cssClasses.valueSub;

            var markerSizeClasses = [];
            markerSizeClasses[PIPS_NO_VALUE] = options.cssClasses.markerNormal;
            markerSizeClasses[PIPS_LARGE_VALUE] = options.cssClasses.markerLarge;
            markerSizeClasses[PIPS_SMALL_VALUE] = options.cssClasses.markerSub;

            var valueOrientationClasses = [options.cssClasses.valueHorizontal, options.cssClasses.valueVertical];
            var markerOrientationClasses = [options.cssClasses.markerHorizontal, options.cssClasses.markerVertical];

            addClass(element, options.cssClasses.pips);
            addClass(element, options.ort === 0 ? options.cssClasses.pipsHorizontal : options.cssClasses.pipsVertical);

            function getClasses(type, source) {
                var a = source === options.cssClasses.value;
                var orientationClasses = a ? valueOrientationClasses : markerOrientationClasses;
                var sizeClasses = a ? valueSizeClasses : markerSizeClasses;

                return source + " " + orientationClasses[options.ort] + " " + sizeClasses[type];
            }

            function addSpread(offset, value, type) {
                // Apply the filter function, if it is set.
                type = filterFunc ? filterFunc(value, type) : type;

                if (type === PIPS_NONE) {
                    return;
                }

                // Add a marker for every point
                var node = addNodeTo(element, false);
                node.className = getClasses(type, options.cssClasses.marker);
                node.style[options.style] = offset + "%";

                // Values are only appended for points marked '1' or '2'.
                if (type > PIPS_NO_VALUE) {
                    node = addNodeTo(element, false);
                    node.className = getClasses(type, options.cssClasses.value);
                    node.setAttribute("data-value", value);
                    node.style[options.style] = offset + "%";
                    node.innerHTML = formatter.to(value);
                }
            }

            // Append all points.
            Object.keys(spread).forEach(function(offset) {
                addSpread(offset, spread[offset][0], spread[offset][1]);
            });

            return element;
        }

        function removePips() {
            if (scope_Pips) {
                removeElement(scope_Pips);
                scope_Pips = null;
            }
        }

        function pips(grid) {
            // Fix #669
            removePips();

            var mode = grid.mode;
            var density = grid.density || 1;
            var filter = grid.filter || false;
            var values = grid.values || false;
            var stepped = grid.stepped || false;
            var group = getGroup(mode, values, stepped);
            var spread = generateSpread(density, mode, group);
            var format = grid.format || {
                to: Math.round
            };

            scope_Pips = scope_Target.appendChild(addMarking(spread, filter, format));

            return scope_Pips;
        }

        // Shorthand for base dimensions.
        function baseSize() {
            var rect = scope_Base.getBoundingClientRect();
            var alt = "offset" + ["Width", "Height"][options.ort];
            return options.ort === 0 ? rect.width || scope_Base[alt] : rect.height || scope_Base[alt];
        }

        // Handler for attaching events trough a proxy.
        function attachEvent(events, element, callback, data) {
            // This function can be used to 'filter' events to the slider.
            // element is a node, not a nodeList

            var method = function(e) {
                e = fixEvent(e, data.pageOffset, data.target || element);

                // fixEvent returns false if this event has a different target
                // when handling (multi-) touch events;
                if (!e) {
                    return false;
                }

                // doNotReject is passed by all end events to make sure released touches
                // are not rejected, leaving the slider "stuck" to the cursor;
                if (scope_Target.hasAttribute("disabled") && !data.doNotReject) {
                    return false;
                }

                // Stop if an active 'tap' transition is taking place.
                if (hasClass(scope_Target, options.cssClasses.tap) && !data.doNotReject) {
                    return false;
                }

                // Ignore right or middle clicks on start #454
                if (events === actions.start && e.buttons !== undefined && e.buttons > 1) {
                    return false;
                }

                // Ignore right or middle clicks on start #454
                if (data.hover && e.buttons) {
                    return false;
                }

                // 'supportsPassive' is only true if a browser also supports touch-action: none in CSS.
                // iOS safari does not, so it doesn't get to benefit from passive scrolling. iOS does support
                // touch-action: manipulation, but that allows panning, which breaks
                // sliders after zooming/on non-responsive pages.
                // See: https://bugs.webkit.org/show_bug.cgi?id=133112
                if (!supportsPassive) {
                    e.preventDefault();
                }

                e.calcPoint = e.points[options.ort];

                // Call the event handler with the event [ and additional data ].
                callback(e, data);
            };

            var methods = [];

            // Bind a closure on the target for every event type.
            events.split(" ").forEach(function(eventName) {
                element.addEventListener(eventName, method, supportsPassive ? { passive: true } : false);
                methods.push([eventName, method]);
            });

            return methods;
        }

        // Provide a clean event with standardized offset values.
        function fixEvent(e, pageOffset, eventTarget) {
            // Filter the event to register the type, which can be
            // touch, mouse or pointer. Offset changes need to be
            // made on an event specific basis.
            var touch = e.type.indexOf("touch") === 0;
            var mouse = e.type.indexOf("mouse") === 0;
            var pointer = e.type.indexOf("pointer") === 0;

            var x;
            var y;

            // IE10 implemented pointer events with a prefix;
            if (e.type.indexOf("MSPointer") === 0) {
                pointer = true;
            }

            // The only thing one handle should be concerned about is the touches that originated on top of it.
            if (touch) {
                // Returns true if a touch originated on the target.
                var isTouchOnTarget = function(checkTouch) {
                    return checkTouch.target === eventTarget || eventTarget.contains(checkTouch.target);
                };

                // In the case of touchstart events, we need to make sure there is still no more than one
                // touch on the target so we look amongst all touches.
                if (e.type === "touchstart") {
                    var targetTouches = Array.prototype.filter.call(e.touches, isTouchOnTarget);

                    // Do not support more than one touch per handle.
                    if (targetTouches.length > 1) {
                        return false;
                    }

                    x = targetTouches[0].pageX;
                    y = targetTouches[0].pageY;
                } else {
                    // In the other cases, find on changedTouches is enough.
                    var targetTouch = Array.prototype.find.call(e.changedTouches, isTouchOnTarget);

                    // Cancel if the target touch has not moved.
                    if (!targetTouch) {
                        return false;
                    }

                    x = targetTouch.pageX;
                    y = targetTouch.pageY;
                }
            }

            pageOffset = pageOffset || getPageOffset(scope_Document);

            if (mouse || pointer) {
                x = e.clientX + pageOffset.x;
                y = e.clientY + pageOffset.y;
            }

            e.pageOffset = pageOffset;
            e.points = [x, y];
            e.cursor = mouse || pointer; // Fix #435

            return e;
        }

        // Translate a coordinate in the document to a percentage on the slider
        function calcPointToPercentage(calcPoint) {
            var location = calcPoint - offset(scope_Base, options.ort);
            var proposal = (location * 100) / baseSize();

            // Clamp proposal between 0% and 100%
            // Out-of-bound coordinates may occur when .noUi-base pseudo-elements
            // are used (e.g. contained handles feature)
            proposal = limit(proposal);

            return options.dir ? 100 - proposal : proposal;
        }

        // Find handle closest to a certain percentage on the slider
        function getClosestHandle(proposal) {
            var closest = 100;
            var handleNumber = false;

            scope_Handles.forEach(function(handle, index) {
                // Disabled handles are ignored
                if (handle.hasAttribute("disabled")) {
                    return;
                }

                var pos = Math.abs(scope_Locations[index] - proposal);

                if (pos < closest || (pos === 100 && closest === 100)) {
                    handleNumber = index;
                    closest = pos;
                }
            });

            return handleNumber;
        }

        // Fire 'end' when a mouse or pen leaves the document.
        function documentLeave(event, data) {
            if (event.type === "mouseout" && event.target.nodeName === "HTML" && event.relatedTarget === null) {
                eventEnd(event, data);
            }
        }

        // Handle movement on document for handle and range drag.
        function eventMove(event, data) {
            // Fix #498
            // Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
            // https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
            // IE9 has .buttons and .which zero on mousemove.
            // Firefox breaks the spec MDN defines.
            if (navigator.appVersion.indexOf("MSIE 9") === -1 && event.buttons === 0 && data.buttonsProperty !== 0) {
                return eventEnd(event, data);
            }

            // Check if we are moving up or down
            var movement = (options.dir ? -1 : 1) * (event.calcPoint - data.startCalcPoint);

            // Convert the movement into a percentage of the slider width/height
            var proposal = (movement * 100) / data.baseSize;

            moveHandles(movement > 0, proposal, data.locations, data.handleNumbers);
        }

        // Unbind move events on document, call callbacks.
        function eventEnd(event, data) {
            // The handle is no longer active, so remove the class.
            if (data.handle) {
                removeClass(data.handle, options.cssClasses.active);
                scope_ActiveHandlesCount -= 1;
            }

            // Unbind the move and end events, which are added on 'start'.
            data.listeners.forEach(function(c) {
                scope_DocumentElement.removeEventListener(c[0], c[1]);
            });

            if (scope_ActiveHandlesCount === 0) {
                // Remove dragging class.
                removeClass(scope_Target, options.cssClasses.drag);
                setZindex();

                // Remove cursor styles and text-selection events bound to the body.
                if (event.cursor) {
                    scope_Body.style.cursor = "";
                    scope_Body.removeEventListener("selectstart", preventDefault);
                }
            }

            data.handleNumbers.forEach(function(handleNumber) {
                fireEvent("change", handleNumber);
                fireEvent("set", handleNumber);
                fireEvent("end", handleNumber);
            });
        }

        // Bind move events on document.
        function eventStart(event, data) {
            var handle;
            if (data.handleNumbers.length === 1) {
                var handleOrigin = scope_Handles[data.handleNumbers[0]];

                // Ignore 'disabled' handles
                if (handleOrigin.hasAttribute("disabled")) {
                    return false;
                }

                handle = handleOrigin.children[0];
                scope_ActiveHandlesCount += 1;

                // Mark the handle as 'active' so it can be styled.
                addClass(handle, options.cssClasses.active);
            }

            // A drag should never propagate up to the 'tap' event.
            event.stopPropagation();

            // Record the event listeners.
            var listeners = [];

            // Attach the move and end events.
            var moveEvent = attachEvent(actions.move, scope_DocumentElement, eventMove, {
                // The event target has changed so we need to propagate the original one so that we keep
                // relying on it to extract target touches.
                target: event.target,
                handle: handle,
                listeners: listeners,
                startCalcPoint: event.calcPoint,
                baseSize: baseSize(),
                pageOffset: event.pageOffset,
                handleNumbers: data.handleNumbers,
                buttonsProperty: event.buttons,
                locations: scope_Locations.slice()
            });

            var endEvent = attachEvent(actions.end, scope_DocumentElement, eventEnd, {
                target: event.target,
                handle: handle,
                listeners: listeners,
                doNotReject: true,
                handleNumbers: data.handleNumbers
            });

            var outEvent = attachEvent("mouseout", scope_DocumentElement, documentLeave, {
                target: event.target,
                handle: handle,
                listeners: listeners,
                doNotReject: true,
                handleNumbers: data.handleNumbers
            });

            // We want to make sure we pushed the listeners in the listener list rather than creating
            // a new one as it has already been passed to the event handlers.
            listeners.push.apply(listeners, moveEvent.concat(endEvent, outEvent));

            // Text selection isn't an issue on touch devices,
            // so adding cursor styles can be skipped.
            if (event.cursor) {
                // Prevent the 'I' cursor and extend the range-drag cursor.
                scope_Body.style.cursor = getComputedStyle(event.target).cursor;

                // Mark the target with a dragging state.
                if (scope_Handles.length > 1) {
                    addClass(scope_Target, options.cssClasses.drag);
                }

                // Prevent text selection when dragging the handles.
                // In noUiSlider <= 9.2.0, this was handled by calling preventDefault on mouse/touch start/move,
                // which is scroll blocking. The selectstart event is supported by FireFox starting from version 52,
                // meaning the only holdout is iOS Safari. This doesn't matter: text selection isn't triggered there.
                // The 'cursor' flag is false.
                // See: http://caniuse.com/#search=selectstart
                scope_Body.addEventListener("selectstart", preventDefault, false);
            }

            data.handleNumbers.forEach(function(handleNumber) {
                fireEvent("start", handleNumber);
            });
        }

        // Move closest handle to tapped location.
        function eventTap(event) {
            // The tap event shouldn't propagate up
            event.stopPropagation();

            var proposal = calcPointToPercentage(event.calcPoint);
            var handleNumber = getClosestHandle(proposal);

            // Tackle the case that all handles are 'disabled'.
            if (handleNumber === false) {
                return false;
            }

            // Flag the slider as it is now in a transitional state.
            // Transition takes a configurable amount of ms (default 300). Re-enable the slider after that.
            if (!options.events.snap) {
                addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
            }

            setHandle(handleNumber, proposal, true, true);

            setZindex();

            fireEvent("slide", handleNumber, true);
            fireEvent("update", handleNumber, true);
            fireEvent("change", handleNumber, true);
            fireEvent("set", handleNumber, true);

            if (options.events.snap) {
                eventStart(event, { handleNumbers: [handleNumber] });
            }
        }

        // Fires a 'hover' event for a hovered mouse/pen position.
        function eventHover(event) {
            var proposal = calcPointToPercentage(event.calcPoint);

            var to = scope_Spectrum.getStep(proposal);
            var value = scope_Spectrum.fromStepping(to);

            Object.keys(scope_Events).forEach(function(targetEvent) {
                if ("hover" === targetEvent.split(".")[0]) {
                    scope_Events[targetEvent].forEach(function(callback) {
                        callback.call(scope_Self, value);
                    });
                }
            });
        }

        // Attach events to several slider parts.
        function bindSliderEvents(behaviour) {
            // Attach the standard drag event to the handles.
            if (!behaviour.fixed) {
                scope_Handles.forEach(function(handle, index) {
                    // These events are only bound to the visual handle
                    // element, not the 'real' origin element.
                    attachEvent(actions.start, handle.children[0], eventStart, {
                        handleNumbers: [index]
                    });
                });
            }

            // Attach the tap event to the slider base.
            if (behaviour.tap) {
                attachEvent(actions.start, scope_Base, eventTap, {});
            }

            // Fire hover events
            if (behaviour.hover) {
                attachEvent(actions.move, scope_Base, eventHover, {
                    hover: true
                });
            }

            // Make the range draggable.
            if (behaviour.drag) {
                scope_Connects.forEach(function(connect, index) {
                    if (connect === false || index === 0 || index === scope_Connects.length - 1) {
                        return;
                    }

                    var handleBefore = scope_Handles[index - 1];
                    var handleAfter = scope_Handles[index];
                    var eventHolders = [connect];

                    addClass(connect, options.cssClasses.draggable);

                    // When the range is fixed, the entire range can
                    // be dragged by the handles. The handle in the first
                    // origin will propagate the start event upward,
                    // but it needs to be bound manually on the other.
                    if (behaviour.fixed) {
                        eventHolders.push(handleBefore.children[0]);
                        eventHolders.push(handleAfter.children[0]);
                    }

                    eventHolders.forEach(function(eventHolder) {
                        attachEvent(actions.start, eventHolder, eventStart, {
                            handles: [handleBefore, handleAfter],
                            handleNumbers: [index - 1, index]
                        });
                    });
                });
            }
        }

        // Attach an event to this slider, possibly including a namespace
        function bindEvent(namespacedEvent, callback) {
            scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
            scope_Events[namespacedEvent].push(callback);

            // If the event bound is 'update,' fire it immediately for all handles.
            if (namespacedEvent.split(".")[0] === "update") {
                scope_Handles.forEach(function(a, index) {
                    fireEvent("update", index);
                });
            }
        }

        // Undo attachment of event
        function removeEvent(namespacedEvent) {
            var event = namespacedEvent && namespacedEvent.split(".")[0];
            var namespace = event && namespacedEvent.substring(event.length);

            Object.keys(scope_Events).forEach(function(bind) {
                var tEvent = bind.split(".")[0];
                var tNamespace = bind.substring(tEvent.length);

                if ((!event || event === tEvent) && (!namespace || namespace === tNamespace)) {
                    delete scope_Events[bind];
                }
            });
        }

        // External event handling
        function fireEvent(eventName, handleNumber, tap) {
            Object.keys(scope_Events).forEach(function(targetEvent) {
                var eventType = targetEvent.split(".")[0];

                if (eventName === eventType) {
                    scope_Events[targetEvent].forEach(function(callback) {
                        callback.call(
                            // Use the slider public API as the scope ('this')
                            scope_Self,
                            // Return values as array, so arg_1[arg_2] is always valid.
                            scope_Values.map(options.format.to),
                            // Handle index, 0 or 1
                            handleNumber,
                            // Un-formatted slider values
                            scope_Values.slice(),
                            // Event is fired by tap, true or false
                            tap || false,
                            // Left offset of the handle, in relation to the slider
                            scope_Locations.slice()
                        );
                    });
                }
            });
        }

        function toPct(pct) {
            return pct + "%";
        }

        // Split out the handle positioning logic so the Move event can use it, too
        function checkHandlePosition(reference, handleNumber, to, lookBackward, lookForward, getValue) {
            // For sliders with multiple handles, limit movement to the other handle.
            // Apply the margin option by adding it to the handle positions.
            if (scope_Handles.length > 1 && !options.events.unconstrained) {
                if (lookBackward && handleNumber > 0) {
                    to = Math.max(to, reference[handleNumber - 1] + options.margin);
                }

                if (lookForward && handleNumber < scope_Handles.length - 1) {
                    to = Math.min(to, reference[handleNumber + 1] - options.margin);
                }
            }

            // The limit option has the opposite effect, limiting handles to a
            // maximum distance from another. Limit must be > 0, as otherwise
            // handles would be unmovable.
            if (scope_Handles.length > 1 && options.limit) {
                if (lookBackward && handleNumber > 0) {
                    to = Math.min(to, reference[handleNumber - 1] + options.limit);
                }

                if (lookForward && handleNumber < scope_Handles.length - 1) {
                    to = Math.max(to, reference[handleNumber + 1] - options.limit);
                }
            }

            // The padding option keeps the handles a certain distance from the
            // edges of the slider. Padding must be > 0.
            if (options.padding) {
                if (handleNumber === 0) {
                    to = Math.max(to, options.padding[0]);
                }

                if (handleNumber === scope_Handles.length - 1) {
                    to = Math.min(to, 100 - options.padding[1]);
                }
            }

            to = scope_Spectrum.getStep(to);

            // Limit percentage to the 0 - 100 range
            to = limit(to);

            // Return false if handle can't move
            if (to === reference[handleNumber] && !getValue) {
                return false;
            }

            return to;
        }

        // Uses slider orientation to create CSS rules. a = base value;
        function inRuleOrder(v, a) {
            var o = options.ort;
            return (o ? a : v) + ", " + (o ? v : a);
        }

        // Moves handle(s) by a percentage
        // (bool, % to move, [% where handle started, ...], [index in scope_Handles, ...])
        function moveHandles(upward, proposal, locations, handleNumbers) {
            var proposals = locations.slice();

            var b = [!upward, upward];
            var f = [upward, !upward];

            // Copy handleNumbers so we don't change the dataset
            handleNumbers = handleNumbers.slice();

            // Check to see which handle is 'leading'.
            // If that one can't move the second can't either.
            if (upward) {
                handleNumbers.reverse();
            }

            // Step 1: get the maximum percentage that any of the handles can move
            if (handleNumbers.length > 1) {
                handleNumbers.forEach(function(handleNumber, o) {
                    var to = checkHandlePosition(
                        proposals,
                        handleNumber,
                        proposals[handleNumber] + proposal,
                        b[o],
                        f[o],
                        false
                    );

                    // Stop if one of the handles can't move.
                    if (to === false) {
                        proposal = 0;
                    } else {
                        proposal = to - proposals[handleNumber];
                        proposals[handleNumber] = to;
                    }
                });
            }

            // If using one handle, check backward AND forward
            else {
                b = f = [true];
            }

            var state = false;

            // Step 2: Try to set the handles with the found percentage
            handleNumbers.forEach(function(handleNumber, o) {
                state = setHandle(handleNumber, locations[handleNumber] + proposal, b[o], f[o]) || state;
            });

            // Step 3: If a handle moved, fire events
            if (state) {
                handleNumbers.forEach(function(handleNumber) {
                    fireEvent("update", handleNumber);
                    fireEvent("slide", handleNumber);
                });
            }
        }

        // Takes a base value and an offset. This offset is used for the connect bar size.
        // In the initial design for this feature, the origin element was 1% wide.
        // Unfortunately, a rounding bug in Chrome makes it impossible to implement this feature
        // in this manner: https://bugs.chromium.org/p/chromium/issues/detail?id=798223
        function transformDirection(a, b) {
            return options.dir ? 100 - a - b : a;
        }

        // Updates scope_Locations and scope_Values, updates visual state
        function updateHandlePosition(handleNumber, to) {
            // Update locations.
            scope_Locations[handleNumber] = to;

            // Convert the value to the slider stepping/range.
            scope_Values[handleNumber] = scope_Spectrum.fromStepping(to);

            var rule = "translate(" + inRuleOrder(toPct(transformDirection(to, 0) - scope_DirOffset), "0") + ")";
            scope_Handles[handleNumber].style[options.transformRule] = rule;

            updateConnect(handleNumber);
            updateConnect(handleNumber + 1);
        }

        // Handles before the slider middle are stacked later = higher,
        // Handles after the middle later is lower
        // [[7] [8] .......... | .......... [5] [4]
        function setZindex() {
            scope_HandleNumbers.forEach(function(handleNumber) {
                var dir = scope_Locations[handleNumber] > 50 ? -1 : 1;
                var zIndex = 3 + (scope_Handles.length + dir * handleNumber);
                scope_Handles[handleNumber].style.zIndex = zIndex;
            });
        }

        // Test suggested values and apply margin, step.
        function setHandle(handleNumber, to, lookBackward, lookForward) {
            to = checkHandlePosition(scope_Locations, handleNumber, to, lookBackward, lookForward, false);

            if (to === false) {
                return false;
            }

            updateHandlePosition(handleNumber, to);

            return true;
        }

        // Updates style attribute for connect nodes
        function updateConnect(index) {
            // Skip connects set to false
            if (!scope_Connects[index]) {
                return;
            }

            var l = 0;
            var h = 100;

            if (index !== 0) {
                l = scope_Locations[index - 1];
            }

            if (index !== scope_Connects.length - 1) {
                h = scope_Locations[index];
            }

            // We use two rules:
            // 'translate' to change the left/top offset;
            // 'scale' to change the width of the element;
            // As the element has a width of 100%, a translation of 100% is equal to 100% of the parent (.noUi-base)
            var connectWidth = h - l;
            var translateRule = "translate(" + inRuleOrder(toPct(transformDirection(l, connectWidth)), "0") + ")";
            var scaleRule = "scale(" + inRuleOrder(connectWidth / 100, "1") + ")";

            scope_Connects[index].style[options.transformRule] = translateRule + " " + scaleRule;
        }

        // Parses value passed to .set method. Returns current value if not parse-able.
        function resolveToValue(to, handleNumber) {
            // Setting with null indicates an 'ignore'.
            // Inputting 'false' is invalid.
            if (to === null || to === false || to === undefined) {
                return scope_Locations[handleNumber];
            }

            // If a formatted number was passed, attempt to decode it.
            if (typeof to === "number") {
                to = String(to);
            }

            to = options.format.from(to);
            to = scope_Spectrum.toStepping(to);

            // If parsing the number failed, use the current value.
            if (to === false || isNaN(to)) {
                return scope_Locations[handleNumber];
            }

            return to;
        }

        // Set the slider value.
        function valueSet(input, fireSetEvent) {
            var values = asArray(input);
            var isInit = scope_Locations[0] === undefined;

            // Event fires by default
            fireSetEvent = fireSetEvent === undefined ? true : !!fireSetEvent;

            // Animation is optional.
            // Make sure the initial values were set before using animated placement.
            if (options.animate && !isInit) {
                addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
            }

            // First pass, without lookAhead but with lookBackward. Values are set from left to right.
            scope_HandleNumbers.forEach(function(handleNumber) {
                setHandle(handleNumber, resolveToValue(values[handleNumber], handleNumber), true, false);
            });

            // Second pass. Now that all base values are set, apply constraints
            scope_HandleNumbers.forEach(function(handleNumber) {
                setHandle(handleNumber, scope_Locations[handleNumber], true, true);
            });

            setZindex();

            scope_HandleNumbers.forEach(function(handleNumber) {
                fireEvent("update", handleNumber);

                // Fire the event only for handles that received a new value, as per #579
                if (values[handleNumber] !== null && fireSetEvent) {
                    fireEvent("set", handleNumber);
                }
            });
        }

        // Reset slider to initial values
        function valueReset(fireSetEvent) {
            valueSet(options.start, fireSetEvent);
        }

        // Set value for a single handle
        function valueSetHandle(handleNumber, value, fireSetEvent) {
            var values = [];

            // Ensure numeric input
            handleNumber = Number(handleNumber);

            if (!(handleNumber >= 0 && handleNumber < scope_HandleNumbers.length)) {
                throw new Error("noUiSlider (" + VERSION + "): invalid handle number, got: " + handleNumber);
            }

            for (var i = 0; i < scope_HandleNumbers.length; i++) {
                values[i] = null;
            }

            values[handleNumber] = value;

            valueSet(values, fireSetEvent);
        }

        // Get the slider value.
        function valueGet() {
            var values = scope_Values.map(options.format.to);

            // If only one handle is used, return a single value.
            if (values.length === 1) {
                return values[0];
            }

            return values;
        }

        // Removes classes from the root and empties it.
        function destroy() {
            for (var key in options.cssClasses) {
                if (!options.cssClasses.hasOwnProperty(key)) {
                    continue;
                }
                removeClass(scope_Target, options.cssClasses[key]);
            }

            while (scope_Target.firstChild) {
                scope_Target.removeChild(scope_Target.firstChild);
            }

            delete scope_Target.noUiSlider;
        }

        // Get the current step size for the slider.
        function getCurrentStep() {
            // Check all locations, map them to their stepping point.
            // Get the step point, then find it in the input list.
            return scope_Locations.map(function(location, index) {
                var nearbySteps = scope_Spectrum.getNearbySteps(location);
                var value = scope_Values[index];
                var increment = nearbySteps.thisStep.step;
                var decrement = null;

                // If the next value in this step moves into the next step,
                // the increment is the start of the next step - the current value
                if (increment !== false) {
                    if (value + increment > nearbySteps.stepAfter.startValue) {
                        increment = nearbySteps.stepAfter.startValue - value;
                    }
                }

                // If the value is beyond the starting point
                if (value > nearbySteps.thisStep.startValue) {
                    decrement = nearbySteps.thisStep.step;
                } else if (nearbySteps.stepBefore.step === false) {
                    decrement = false;
                }

                // If a handle is at the start of a step, it always steps back into the previous step first
                else {
                    decrement = value - nearbySteps.stepBefore.highestStep;
                }

                // Now, if at the slider edges, there is not in/decrement
                if (location === 100) {
                    increment = null;
                } else if (location === 0) {
                    decrement = null;
                }

                // As per #391, the comparison for the decrement step can have some rounding issues.
                var stepDecimals = scope_Spectrum.countStepDecimals();

                // Round per #391
                if (increment !== null && increment !== false) {
                    increment = Number(increment.toFixed(stepDecimals));
                }

                if (decrement !== null && decrement !== false) {
                    decrement = Number(decrement.toFixed(stepDecimals));
                }

                return [decrement, increment];
            });
        }

        // Updateable: margin, limit, padding, step, range, animate, snap
        function updateOptions(optionsToUpdate, fireSetEvent) {
            // Spectrum is created using the range, snap, direction and step options.
            // 'snap' and 'step' can be updated.
            // If 'snap' and 'step' are not passed, they should remain unchanged.
            var v = valueGet();

            var updateAble = ["margin", "limit", "padding", "range", "animate", "snap", "step", "format"];

            // Only change options that we're actually passed to update.
            updateAble.forEach(function(name) {
                if (optionsToUpdate[name] !== undefined) {
                    originalOptions[name] = optionsToUpdate[name];
                }
            });

            var newOptions = testOptions(originalOptions);

            // Load new options into the slider state
            updateAble.forEach(function(name) {
                if (optionsToUpdate[name] !== undefined) {
                    options[name] = newOptions[name];
                }
            });

            scope_Spectrum = newOptions.spectrum;

            // Limit, margin and padding depend on the spectrum but are stored outside of it. (#677)
            options.margin = newOptions.margin;
            options.limit = newOptions.limit;
            options.padding = newOptions.padding;

            // Update pips, removes existing.
            if (options.pips) {
                pips(options.pips);
            }

            // Invalidate the current positioning so valueSet forces an update.
            scope_Locations = [];
            valueSet(optionsToUpdate.start || v, fireSetEvent);
        }

        // Create the base element, initialize HTML and set classes.
        // Add handles and connect elements.
        scope_Base = addSlider(scope_Target);
        addElements(options.connect, scope_Base);

        // Attach user events.
        bindSliderEvents(options.events);

        // Use the public value method to set the start values.
        valueSet(options.start);

        // noinspection JSUnusedGlobalSymbols
        scope_Self = {
            destroy: destroy,
            steps: getCurrentStep,
            on: bindEvent,
            off: removeEvent,
            get: valueGet,
            set: valueSet,
            setHandle: valueSetHandle,
            reset: valueReset,
            // Exposed for unit testing, don't use this in your application.
            __moveHandles: function(a, b, c) {
                moveHandles(a, b, scope_Locations, c);
            },
            options: originalOptions, // Issue #600, #678
            updateOptions: updateOptions,
            target: scope_Target, // Issue #597
            removePips: removePips,
            pips: pips // Issue #594
        };

        if (options.pips) {
            pips(options.pips);
        }

        if (options.tooltips) {
            tooltips();
        }

        aria();

        return scope_Self;
    }

    // Run the standard initializer
    function initialize(target, originalOptions) {
        if (!target || !target.nodeName) {
            throw new Error("noUiSlider (" + VERSION + "): create requires a single element, got: " + target);
        }

        // Throw an error if the slider was already initialized.
        if (target.noUiSlider) {
            throw new Error("noUiSlider (" + VERSION + "): Slider was already initialized.");
        }

        // Test the options and create the slider environment;
        var options = testOptions(originalOptions, target);
        var api = scope(target, options, originalOptions);

        target.noUiSlider = api;

        return api;
    }

    // Use an object instead of a function for future expandability;
    return {
        // Exposed for unit testing, don't use this in your application.
        __spectrum: Spectrum,
        version: VERSION,
        create: initialize
    };
});

},{}],"roughjs":[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.rough = factory());
}(this, (function () { 'use strict';

    function isType(token, type) {
        return token.type === type;
    }
    const PARAMS = {
        A: 7,
        a: 7,
        C: 6,
        c: 6,
        H: 1,
        h: 1,
        L: 2,
        l: 2,
        M: 2,
        m: 2,
        Q: 4,
        q: 4,
        S: 4,
        s: 4,
        T: 4,
        t: 2,
        V: 1,
        v: 1,
        Z: 0,
        z: 0
    };
    class ParsedPath {
        constructor(d) {
            this.COMMAND = 0;
            this.NUMBER = 1;
            this.EOD = 2;
            this.segments = [];
            this.parseData(d);
            this.processPoints();
        }
        tokenize(d) {
            const tokens = new Array();
            while (d !== '') {
                if (d.match(/^([ \t\r\n,]+)/)) {
                    d = d.substr(RegExp.$1.length);
                }
                else if (d.match(/^([aAcChHlLmMqQsStTvVzZ])/)) {
                    tokens[tokens.length] = { type: this.COMMAND, text: RegExp.$1 };
                    d = d.substr(RegExp.$1.length);
                }
                else if (d.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) {
                    tokens[tokens.length] = { type: this.NUMBER, text: `${parseFloat(RegExp.$1)}` };
                    d = d.substr(RegExp.$1.length);
                }
                else {
                    console.error('Unrecognized segment command: ' + d);
                    return [];
                }
            }
            tokens[tokens.length] = { type: this.EOD, text: '' };
            return tokens;
        }
        parseData(d) {
            const tokens = this.tokenize(d);
            let index = 0;
            let token = tokens[index];
            let mode = 'BOD';
            this.segments = new Array();
            while (!isType(token, this.EOD)) {
                let param_length;
                const params = new Array();
                if (mode === 'BOD') {
                    if (token.text === 'M' || token.text === 'm') {
                        index++;
                        param_length = PARAMS[token.text];
                        mode = token.text;
                    }
                    else {
                        this.parseData('M0,0' + d);
                        return;
                    }
                }
                else {
                    if (isType(token, this.NUMBER)) {
                        param_length = PARAMS[mode];
                    }
                    else {
                        index++;
                        param_length = PARAMS[token.text];
                        mode = token.text;
                    }
                }
                if ((index + param_length) < tokens.length) {
                    for (let i = index; i < index + param_length; i++) {
                        const numbeToken = tokens[i];
                        if (isType(numbeToken, this.NUMBER)) {
                            params[params.length] = +numbeToken.text;
                        }
                        else {
                            console.error('Parameter type is not a number: ' + mode + ',' + numbeToken.text);
                            return;
                        }
                    }
                    if (typeof PARAMS[mode] === 'number') {
                        const segment = { key: mode, data: params };
                        this.segments.push(segment);
                        index += param_length;
                        token = tokens[index];
                        if (mode === 'M')
                            mode = 'L';
                        if (mode === 'm')
                            mode = 'l';
                    }
                    else {
                        console.error('Unsupported segment type: ' + mode);
                        return;
                    }
                }
                else {
                    console.error('Path data ended before all parameters were found');
                }
            }
        }
        get closed() {
            if (typeof this._closed === 'undefined') {
                this._closed = false;
                for (const s of this.segments) {
                    if (s.key.toLowerCase() === 'z') {
                        this._closed = true;
                    }
                }
            }
            return this._closed;
        }
        processPoints() {
            let first = null;
            let currentPoint = [0, 0];
            for (let i = 0; i < this.segments.length; i++) {
                const s = this.segments[i];
                switch (s.key) {
                    case 'M':
                    case 'L':
                    case 'T':
                        s.point = [s.data[0], s.data[1]];
                        break;
                    case 'm':
                    case 'l':
                    case 't':
                        s.point = [s.data[0] + currentPoint[0], s.data[1] + currentPoint[1]];
                        break;
                    case 'H':
                        s.point = [s.data[0], currentPoint[1]];
                        break;
                    case 'h':
                        s.point = [s.data[0] + currentPoint[0], currentPoint[1]];
                        break;
                    case 'V':
                        s.point = [currentPoint[0], s.data[0]];
                        break;
                    case 'v':
                        s.point = [currentPoint[0], s.data[0] + currentPoint[1]];
                        break;
                    case 'z':
                    case 'Z':
                        if (first) {
                            s.point = [first[0], first[1]];
                        }
                        break;
                    case 'C':
                        s.point = [s.data[4], s.data[5]];
                        break;
                    case 'c':
                        s.point = [s.data[4] + currentPoint[0], s.data[5] + currentPoint[1]];
                        break;
                    case 'S':
                        s.point = [s.data[2], s.data[3]];
                        break;
                    case 's':
                        s.point = [s.data[2] + currentPoint[0], s.data[3] + currentPoint[1]];
                        break;
                    case 'Q':
                        s.point = [s.data[2], s.data[3]];
                        break;
                    case 'q':
                        s.point = [s.data[2] + currentPoint[0], s.data[3] + currentPoint[1]];
                        break;
                    case 'A':
                        s.point = [s.data[5], s.data[6]];
                        break;
                    case 'a':
                        s.point = [s.data[5] + currentPoint[0], s.data[6] + currentPoint[1]];
                        break;
                }
                if (s.key === 'm' || s.key === 'M') {
                    first = null;
                }
                if (s.point) {
                    currentPoint = s.point;
                    if (!first) {
                        first = s.point;
                    }
                }
                if (s.key === 'z' || s.key === 'Z') {
                    first = null;
                }
            }
        }
    }
    class RoughPath {
        constructor(d) {
            this._position = [0, 0];
            this._first = null;
            this.bezierReflectionPoint = null;
            this.quadReflectionPoint = null;
            this.parsed = new ParsedPath(d);
        }
        get segments() {
            return this.parsed.segments;
        }
        get closed() {
            return this.parsed.closed;
        }
        get linearPoints() {
            if (!this._linearPoints) {
                const lp = [];
                let points = [];
                for (const s of this.parsed.segments) {
                    const key = s.key.toLowerCase();
                    if (key === 'm' || key === 'z') {
                        if (points.length) {
                            lp.push(points);
                            points = [];
                        }
                        if (key === 'z') {
                            continue;
                        }
                    }
                    if (s.point) {
                        points.push(s.point);
                    }
                }
                if (points.length) {
                    lp.push(points);
                    points = [];
                }
                this._linearPoints = lp;
            }
            return this._linearPoints;
        }
        get first() {
            return this._first;
        }
        set first(v) {
            this._first = v;
        }
        setPosition(x, y) {
            this._position = [x, y];
            if (!this._first) {
                this._first = [x, y];
            }
        }
        get position() {
            return this._position;
        }
        get x() {
            return this._position[0];
        }
        get y() {
            return this._position[1];
        }
    }
    // Algorithm as described in https://www.w3.org/TR/SVG/implnote.html
    // Code adapted from nsSVGPathDataParser.cpp in Mozilla 
    // https://hg.mozilla.org/mozilla-central/file/17156fbebbc8/content/svg/content/src/nsSVGPathDataParser.cpp#l887
    class RoughArcConverter {
        constructor(from, to, radii, angle, largeArcFlag, sweepFlag) {
            this._segIndex = 0;
            this._numSegs = 0;
            this._rx = 0;
            this._ry = 0;
            this._sinPhi = 0;
            this._cosPhi = 0;
            this._C = [0, 0];
            this._theta = 0;
            this._delta = 0;
            this._T = 0;
            this._from = from;
            if (from[0] === to[0] && from[1] === to[1]) {
                return;
            }
            const radPerDeg = Math.PI / 180;
            this._rx = Math.abs(radii[0]);
            this._ry = Math.abs(radii[1]);
            this._sinPhi = Math.sin(angle * radPerDeg);
            this._cosPhi = Math.cos(angle * radPerDeg);
            const x1dash = this._cosPhi * (from[0] - to[0]) / 2.0 + this._sinPhi * (from[1] - to[1]) / 2.0;
            const y1dash = -this._sinPhi * (from[0] - to[0]) / 2.0 + this._cosPhi * (from[1] - to[1]) / 2.0;
            let root = 0;
            const numerator = this._rx * this._rx * this._ry * this._ry - this._rx * this._rx * y1dash * y1dash - this._ry * this._ry * x1dash * x1dash;
            if (numerator < 0) {
                const s = Math.sqrt(1 - (numerator / (this._rx * this._rx * this._ry * this._ry)));
                this._rx = this._rx * s;
                this._ry = this._ry * s;
                root = 0;
            }
            else {
                root = (largeArcFlag === sweepFlag ? -1.0 : 1.0) *
                    Math.sqrt(numerator / (this._rx * this._rx * y1dash * y1dash + this._ry * this._ry * x1dash * x1dash));
            }
            const cxdash = root * this._rx * y1dash / this._ry;
            const cydash = -root * this._ry * x1dash / this._rx;
            this._C = [0, 0];
            this._C[0] = this._cosPhi * cxdash - this._sinPhi * cydash + (from[0] + to[0]) / 2.0;
            this._C[1] = this._sinPhi * cxdash + this._cosPhi * cydash + (from[1] + to[1]) / 2.0;
            this._theta = this.calculateVectorAngle(1.0, 0.0, (x1dash - cxdash) / this._rx, (y1dash - cydash) / this._ry);
            let dtheta = this.calculateVectorAngle((x1dash - cxdash) / this._rx, (y1dash - cydash) / this._ry, (-x1dash - cxdash) / this._rx, (-y1dash - cydash) / this._ry);
            if ((!sweepFlag) && (dtheta > 0)) {
                dtheta -= 2 * Math.PI;
            }
            else if (sweepFlag && (dtheta < 0)) {
                dtheta += 2 * Math.PI;
            }
            this._numSegs = Math.ceil(Math.abs(dtheta / (Math.PI / 2)));
            this._delta = dtheta / this._numSegs;
            this._T = (8 / 3) * Math.sin(this._delta / 4) * Math.sin(this._delta / 4) / Math.sin(this._delta / 2);
        }
        getNextSegment() {
            if (this._segIndex === this._numSegs) {
                return null;
            }
            const cosTheta1 = Math.cos(this._theta);
            const sinTheta1 = Math.sin(this._theta);
            const theta2 = this._theta + this._delta;
            const cosTheta2 = Math.cos(theta2);
            const sinTheta2 = Math.sin(theta2);
            const to = [
                this._cosPhi * this._rx * cosTheta2 - this._sinPhi * this._ry * sinTheta2 + this._C[0],
                this._sinPhi * this._rx * cosTheta2 + this._cosPhi * this._ry * sinTheta2 + this._C[1]
            ];
            const cp1 = [
                this._from[0] + this._T * (-this._cosPhi * this._rx * sinTheta1 - this._sinPhi * this._ry * cosTheta1),
                this._from[1] + this._T * (-this._sinPhi * this._rx * sinTheta1 + this._cosPhi * this._ry * cosTheta1)
            ];
            const cp2 = [
                to[0] + this._T * (this._cosPhi * this._rx * sinTheta2 + this._sinPhi * this._ry * cosTheta2),
                to[1] + this._T * (this._sinPhi * this._rx * sinTheta2 - this._cosPhi * this._ry * cosTheta2)
            ];
            this._theta = theta2;
            this._from = [to[0], to[1]];
            this._segIndex++;
            return {
                cp1: cp1,
                cp2: cp2,
                to: to
            };
        }
        calculateVectorAngle(ux, uy, vx, vy) {
            const ta = Math.atan2(uy, ux);
            const tb = Math.atan2(vy, vx);
            if (tb >= ta)
                return tb - ta;
            return 2 * Math.PI - (ta - tb);
        }
    }
    class PathFitter {
        constructor(sets, closed) {
            this.sets = sets;
            this.closed = closed;
        }
        fit(simplification) {
            const outSets = [];
            for (const set of this.sets) {
                const length = set.length;
                let estLength = Math.floor(simplification * length);
                if (estLength < 5) {
                    if (length <= 5) {
                        continue;
                    }
                    estLength = 5;
                }
                outSets.push(this.reduce(set, estLength));
            }
            let d = '';
            for (const set of outSets) {
                for (let i = 0; i < set.length; i++) {
                    const point = set[i];
                    if (i === 0) {
                        d += 'M' + point[0] + ',' + point[1];
                    }
                    else {
                        d += 'L' + point[0] + ',' + point[1];
                    }
                }
                if (this.closed) {
                    d += 'z ';
                }
            }
            return d;
        }
        distance(p1, p2) {
            return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        }
        reduce(set, count) {
            if (set.length <= count) {
                return set;
            }
            const points = set.slice(0);
            while (points.length > count) {
                let minArea = -1;
                let minIndex = -1;
                for (let i = 1; i < (points.length - 1); i++) {
                    const a = this.distance(points[i - 1], points[i]);
                    const b = this.distance(points[i], points[i + 1]);
                    const c = this.distance(points[i - 1], points[i + 1]);
                    const s = (a + b + c) / 2.0;
                    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
                    if ((minArea < 0) || (area < minArea)) {
                        minArea = area;
                        minIndex = i;
                    }
                }
                if (minIndex > 0) {
                    points.splice(minIndex, 1);
                }
                else {
                    break;
                }
            }
            return points;
        }
    }

    class Segment {
        constructor(p1, p2) {
            this.xi = Number.MAX_VALUE;
            this.yi = Number.MAX_VALUE;
            this.px1 = p1[0];
            this.py1 = p1[1];
            this.px2 = p2[0];
            this.py2 = p2[1];
            this.a = this.py2 - this.py1;
            this.b = this.px1 - this.px2;
            this.c = this.px2 * this.py1 - this.px1 * this.py2;
            this._undefined = ((this.a === 0) && (this.b === 0) && (this.c === 0));
        }
        isUndefined() {
            return this._undefined;
        }
        intersects(otherSegment) {
            if (this.isUndefined() || otherSegment.isUndefined()) {
                return false;
            }
            let grad1 = Number.MAX_VALUE;
            let grad2 = Number.MAX_VALUE;
            let int1 = 0, int2 = 0;
            const a = this.a, b = this.b, c = this.c;
            if (Math.abs(b) > 0.00001) {
                grad1 = -a / b;
                int1 = -c / b;
            }
            if (Math.abs(otherSegment.b) > 0.00001) {
                grad2 = -otherSegment.a / otherSegment.b;
                int2 = -otherSegment.c / otherSegment.b;
            }
            if (grad1 === Number.MAX_VALUE) {
                if (grad2 === Number.MAX_VALUE) {
                    if ((-c / a) !== (-otherSegment.c / otherSegment.a)) {
                        return false;
                    }
                    if ((this.py1 >= Math.min(otherSegment.py1, otherSegment.py2)) && (this.py1 <= Math.max(otherSegment.py1, otherSegment.py2))) {
                        this.xi = this.px1;
                        this.yi = this.py1;
                        return true;
                    }
                    if ((this.py2 >= Math.min(otherSegment.py1, otherSegment.py2)) && (this.py2 <= Math.max(otherSegment.py1, otherSegment.py2))) {
                        this.xi = this.px2;
                        this.yi = this.py2;
                        return true;
                    }
                    return false;
                }
                this.xi = this.px1;
                this.yi = (grad2 * this.xi + int2);
                if (((this.py1 - this.yi) * (this.yi - this.py2) < -0.00001) || ((otherSegment.py1 - this.yi) * (this.yi - otherSegment.py2) < -0.00001)) {
                    return false;
                }
                if (Math.abs(otherSegment.a) < 0.00001) {
                    if ((otherSegment.px1 - this.xi) * (this.xi - otherSegment.px2) < -0.00001) {
                        return false;
                    }
                    return true;
                }
                return true;
            }
            if (grad2 === Number.MAX_VALUE) {
                this.xi = otherSegment.px1;
                this.yi = grad1 * this.xi + int1;
                if (((otherSegment.py1 - this.yi) * (this.yi - otherSegment.py2) < -0.00001) || ((this.py1 - this.yi) * (this.yi - this.py2) < -0.00001)) {
                    return false;
                }
                if (Math.abs(a) < 0.00001) {
                    if ((this.px1 - this.xi) * (this.xi - this.px2) < -0.00001) {
                        return false;
                    }
                    return true;
                }
                return true;
            }
            if (grad1 === grad2) {
                if (int1 !== int2) {
                    return false;
                }
                if ((this.px1 >= Math.min(otherSegment.px1, otherSegment.px2)) && (this.px1 <= Math.max(otherSegment.py1, otherSegment.py2))) {
                    this.xi = this.px1;
                    this.yi = this.py1;
                    return true;
                }
                if ((this.px2 >= Math.min(otherSegment.px1, otherSegment.px2)) && (this.px2 <= Math.max(otherSegment.px1, otherSegment.px2))) {
                    this.xi = this.px2;
                    this.yi = this.py2;
                    return true;
                }
                return false;
            }
            this.xi = ((int2 - int1) / (grad1 - grad2));
            this.yi = (grad1 * this.xi + int1);
            if (((this.px1 - this.xi) * (this.xi - this.px2) < -0.00001) || ((otherSegment.px1 - this.xi) * (this.xi - otherSegment.px2) < -0.00001)) {
                return false;
            }
            return true;
        }
    }

    class HachureIterator {
        constructor(top, bottom, left, right, gap, sinAngle, cosAngle, tanAngle) {
            this.deltaX = 0;
            this.hGap = 0;
            this.top = top;
            this.bottom = bottom;
            this.left = left;
            this.right = right;
            this.gap = gap;
            this.sinAngle = sinAngle;
            this.tanAngle = tanAngle;
            if (Math.abs(sinAngle) < 0.0001) {
                this.pos = left + gap;
            }
            else if (Math.abs(sinAngle) > 0.9999) {
                this.pos = top + gap;
            }
            else {
                this.deltaX = (bottom - top) * Math.abs(tanAngle);
                this.pos = left - Math.abs(this.deltaX);
                this.hGap = Math.abs(gap / cosAngle);
                this.sLeft = new Segment([left, bottom], [left, top]);
                this.sRight = new Segment([right, bottom], [right, top]);
            }
        }
        nextLine() {
            if (Math.abs(this.sinAngle) < 0.0001) {
                if (this.pos < this.right) {
                    const line = [this.pos, this.top, this.pos, this.bottom];
                    this.pos += this.gap;
                    return line;
                }
            }
            else if (Math.abs(this.sinAngle) > 0.9999) {
                if (this.pos < this.bottom) {
                    const line = [this.left, this.pos, this.right, this.pos];
                    this.pos += this.gap;
                    return line;
                }
            }
            else {
                let xLower = this.pos - this.deltaX / 2;
                let xUpper = this.pos + this.deltaX / 2;
                let yLower = this.bottom;
                let yUpper = this.top;
                if (this.pos < (this.right + this.deltaX)) {
                    while (((xLower < this.left) && (xUpper < this.left)) || ((xLower > this.right) && (xUpper > this.right))) {
                        this.pos += this.hGap;
                        xLower = this.pos - this.deltaX / 2;
                        xUpper = this.pos + this.deltaX / 2;
                        if (this.pos > (this.right + this.deltaX)) {
                            return null;
                        }
                    }
                    const s = new Segment([xLower, yLower], [xUpper, yUpper]);
                    if (this.sLeft && s.intersects(this.sLeft)) {
                        xLower = s.xi;
                        yLower = s.yi;
                    }
                    if (this.sRight && s.intersects(this.sRight)) {
                        xUpper = s.xi;
                        yUpper = s.yi;
                    }
                    if (this.tanAngle > 0) {
                        xLower = this.right - (xLower - this.left);
                        xUpper = this.right - (xUpper - this.left);
                    }
                    const line = [xLower, yLower, xUpper, yUpper];
                    this.pos += this.hGap;
                    return line;
                }
            }
            return null;
        }
    }

    function lineLength(line) {
        const p1 = line[0];
        const p2 = line[1];
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    }
    function getIntersectingLines(line, points) {
        const intersections = [];
        const s1 = new Segment([line[0], line[1]], [line[2], line[3]]);
        for (let i = 0; i < points.length; i++) {
            const s2 = new Segment(points[i], points[(i + 1) % points.length]);
            if (s1.intersects(s2)) {
                intersections.push([s1.xi, s1.yi]);
            }
        }
        return intersections;
    }
    function affine(x, y, cx, cy, sinAnglePrime, cosAnglePrime, R) {
        const A = -cx * cosAnglePrime - cy * sinAnglePrime + cx;
        const B = R * (cx * sinAnglePrime - cy * cosAnglePrime) + cy;
        const C = cosAnglePrime;
        const D = sinAnglePrime;
        const E = -R * sinAnglePrime;
        const F = R * cosAnglePrime;
        return [
            A + C * x + D * y,
            B + E * x + F * y
        ];
    }
    function hachureLinesForPolygon(points, o) {
        const ret = [];
        if (points && points.length) {
            let left = points[0][0];
            let right = points[0][0];
            let top = points[0][1];
            let bottom = points[0][1];
            for (let i = 1; i < points.length; i++) {
                left = Math.min(left, points[i][0]);
                right = Math.max(right, points[i][0]);
                top = Math.min(top, points[i][1]);
                bottom = Math.max(bottom, points[i][1]);
            }
            const angle = o.hachureAngle;
            let gap = o.hachureGap;
            if (gap < 0) {
                gap = o.strokeWidth * 4;
            }
            gap = Math.max(gap, 0.1);
            const radPerDeg = Math.PI / 180;
            const hachureAngle = (angle % 180) * radPerDeg;
            const cosAngle = Math.cos(hachureAngle);
            const sinAngle = Math.sin(hachureAngle);
            const tanAngle = Math.tan(hachureAngle);
            const it = new HachureIterator(top - 1, bottom + 1, left - 1, right + 1, gap, sinAngle, cosAngle, tanAngle);
            let rect;
            while ((rect = it.nextLine()) != null) {
                const lines = getIntersectingLines(rect, points);
                for (let i = 0; i < lines.length; i++) {
                    if (i < (lines.length - 1)) {
                        const p1 = lines[i];
                        const p2 = lines[i + 1];
                        ret.push([p1, p2]);
                    }
                }
            }
        }
        return ret;
    }
    function hachureLinesForEllipse(cx, cy, width, height, o, renderer) {
        const ret = [];
        let rx = Math.abs(width / 2);
        let ry = Math.abs(height / 2);
        rx += renderer.getOffset(-rx * 0.05, rx * 0.05, o);
        ry += renderer.getOffset(-ry * 0.05, ry * 0.05, o);
        const angle = o.hachureAngle;
        let gap = o.hachureGap;
        if (gap <= 0) {
            gap = o.strokeWidth * 4;
        }
        let fweight = o.fillWeight;
        if (fweight < 0) {
            fweight = o.strokeWidth / 2;
        }
        const radPerDeg = Math.PI / 180;
        const hachureAngle = (angle % 180) * radPerDeg;
        const tanAngle = Math.tan(hachureAngle);
        const aspectRatio = ry / rx;
        const hyp = Math.sqrt(aspectRatio * tanAngle * aspectRatio * tanAngle + 1);
        const sinAnglePrime = aspectRatio * tanAngle / hyp;
        const cosAnglePrime = 1 / hyp;
        const gapPrime = gap / ((rx * ry / Math.sqrt((ry * cosAnglePrime) * (ry * cosAnglePrime) + (rx * sinAnglePrime) * (rx * sinAnglePrime))) / rx);
        let halfLen = Math.sqrt((rx * rx) - (cx - rx + gapPrime) * (cx - rx + gapPrime));
        for (let xPos = cx - rx + gapPrime; xPos < cx + rx; xPos += gapPrime) {
            halfLen = Math.sqrt((rx * rx) - (cx - xPos) * (cx - xPos));
            const p1 = affine(xPos, cy - halfLen, cx, cy, sinAnglePrime, cosAnglePrime, aspectRatio);
            const p2 = affine(xPos, cy + halfLen, cx, cy, sinAnglePrime, cosAnglePrime, aspectRatio);
            ret.push([p1, p2]);
        }
        return ret;
    }

    class HachureFiller {
        constructor(renderer) {
            this.renderer = renderer;
        }
        fillPolygon(points, o) {
            return this._fillPolygon(points, o);
        }
        fillEllipse(cx, cy, width, height, o) {
            return this._fillEllipse(cx, cy, width, height, o);
        }
        _fillPolygon(points, o, connectEnds = false) {
            const lines = hachureLinesForPolygon(points, o);
            const ops = this.renderLines(lines, o, connectEnds);
            return { type: 'fillSketch', ops };
        }
        _fillEllipse(cx, cy, width, height, o, connectEnds = false) {
            const lines = hachureLinesForEllipse(cx, cy, width, height, o, this.renderer);
            const ops = this.renderLines(lines, o, connectEnds);
            return { type: 'fillSketch', ops };
        }
        renderLines(lines, o, connectEnds) {
            let ops = [];
            let prevPoint = null;
            for (const line of lines) {
                ops = ops.concat(this.renderer.doubleLine(line[0][0], line[0][1], line[1][0], line[1][1], o));
                if (connectEnds && prevPoint) {
                    ops = ops.concat(this.renderer.doubleLine(prevPoint[0], prevPoint[1], line[0][0], line[0][1], o));
                }
                prevPoint = line[1];
            }
            return ops;
        }
    }

    class ZigZagFiller extends HachureFiller {
        fillPolygon(points, o) {
            return this._fillPolygon(points, o, true);
        }
        fillEllipse(cx, cy, width, height, o) {
            return this._fillEllipse(cx, cy, width, height, o, true);
        }
    }

    class HatchFiller extends HachureFiller {
        fillPolygon(points, o) {
            const set = this._fillPolygon(points, o);
            const o2 = Object.assign({}, o, { hachureAngle: o.hachureAngle + 90 });
            const set2 = this._fillPolygon(points, o2);
            set.ops = set.ops.concat(set2.ops);
            return set;
        }
        fillEllipse(cx, cy, width, height, o) {
            const set = this._fillEllipse(cx, cy, width, height, o);
            const o2 = Object.assign({}, o, { hachureAngle: o.hachureAngle + 90 });
            const set2 = this._fillEllipse(cx, cy, width, height, o2);
            set.ops = set.ops.concat(set2.ops);
            return set;
        }
    }

    class DotFiller {
        constructor(renderer) {
            this.renderer = renderer;
        }
        fillPolygon(points, o) {
            o = Object.assign({}, o, { curveStepCount: 4, hachureAngle: 0 });
            const lines = hachureLinesForPolygon(points, o);
            return this.dotsOnLines(lines, o);
        }
        fillEllipse(cx, cy, width, height, o) {
            o = Object.assign({}, o, { curveStepCount: 4, hachureAngle: 0 });
            const lines = hachureLinesForEllipse(cx, cy, width, height, o, this.renderer);
            return this.dotsOnLines(lines, o);
        }
        dotsOnLines(lines, o) {
            let ops = [];
            let gap = o.hachureGap;
            if (gap < 0) {
                gap = o.strokeWidth * 4;
            }
            gap = Math.max(gap, 0.1);
            let fweight = o.fillWeight;
            if (fweight < 0) {
                fweight = o.strokeWidth / 2;
            }
            for (const line of lines) {
                const length = lineLength(line);
                const dl = length / gap;
                const count = Math.ceil(dl) - 1;
                const alpha = Math.atan((line[1][1] - line[0][1]) / (line[1][0] - line[0][0]));
                for (let i = 0; i < count; i++) {
                    const l = gap * (i + 1);
                    const dy = l * Math.sin(alpha);
                    const dx = l * Math.cos(alpha);
                    const c = [line[0][0] - dx, line[0][1] + dy];
                    const cx = this.renderer.getOffset(c[0] - gap / 4, c[0] + gap / 4, o);
                    const cy = this.renderer.getOffset(c[1] - gap / 4, c[1] + gap / 4, o);
                    const ellipse = this.renderer.ellipse(cx, cy, fweight, fweight, o);
                    ops = ops.concat(ellipse.ops);
                }
            }
            return { type: 'fillSketch', ops };
        }
    }

    const fillers = {};
    function getFiller(renderer, o) {
        let fillerName = o.fillStyle || 'hachure';
        if (!fillers[fillerName]) {
            switch (fillerName) {
                case 'zigzag':
                    if (!fillers[fillerName]) {
                        fillers[fillerName] = new ZigZagFiller(renderer);
                    }
                    break;
                case 'cross-hatch':
                    if (!fillers[fillerName]) {
                        fillers[fillerName] = new HatchFiller(renderer);
                    }
                    break;
                case 'dots':
                    if (!fillers[fillerName]) {
                        fillers[fillerName] = new DotFiller(renderer);
                    }
                    break;
                case 'hachure':
                default:
                    fillerName = 'hachure';
                    if (!fillers[fillerName]) {
                        fillers[fillerName] = new HachureFiller(renderer);
                    }
                    break;
            }
        }
        return fillers[fillerName];
    }

    class RoughRenderer {
        line(x1, y1, x2, y2, o) {
            const ops = this.doubleLine(x1, y1, x2, y2, o);
            return { type: 'path', ops };
        }
        linearPath(points, close, o) {
            const len = (points || []).length;
            if (len > 2) {
                let ops = [];
                for (let i = 0; i < (len - 1); i++) {
                    ops = ops.concat(this.doubleLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], o));
                }
                if (close) {
                    ops = ops.concat(this.doubleLine(points[len - 1][0], points[len - 1][1], points[0][0], points[0][1], o));
                }
                return { type: 'path', ops };
            }
            else if (len === 2) {
                return this.line(points[0][0], points[0][1], points[1][0], points[1][1], o);
            }
            return { type: 'path', ops: [] };
        }
        polygon(points, o) {
            return this.linearPath(points, true, o);
        }
        rectangle(x, y, width, height, o) {
            const points = [
                [x, y], [x + width, y], [x + width, y + height], [x, y + height]
            ];
            return this.polygon(points, o);
        }
        curve(points, o) {
            const o1 = this._curveWithOffset(points, 1 * (1 + o.roughness * 0.2), o);
            const o2 = this._curveWithOffset(points, 1.5 * (1 + o.roughness * 0.22), o);
            return { type: 'path', ops: o1.concat(o2) };
        }
        ellipse(x, y, width, height, o) {
            const increment = (Math.PI * 2) / o.curveStepCount;
            let rx = Math.abs(width / 2);
            let ry = Math.abs(height / 2);
            rx += this.getOffset(-rx * 0.05, rx * 0.05, o);
            ry += this.getOffset(-ry * 0.05, ry * 0.05, o);
            const o1 = this._ellipse(increment, x, y, rx, ry, 1, increment * this.getOffset(0.1, this.getOffset(0.4, 1, o), o), o);
            const o2 = this._ellipse(increment, x, y, rx, ry, 1.5, 0, o);
            return { type: 'path', ops: o1.concat(o2) };
        }
        arc(x, y, width, height, start, stop, closed, roughClosure, o) {
            const cx = x;
            const cy = y;
            let rx = Math.abs(width / 2);
            let ry = Math.abs(height / 2);
            rx += this.getOffset(-rx * 0.01, rx * 0.01, o);
            ry += this.getOffset(-ry * 0.01, ry * 0.01, o);
            let strt = start;
            let stp = stop;
            while (strt < 0) {
                strt += Math.PI * 2;
                stp += Math.PI * 2;
            }
            if ((stp - strt) > (Math.PI * 2)) {
                strt = 0;
                stp = Math.PI * 2;
            }
            const ellipseInc = (Math.PI * 2) / o.curveStepCount;
            const arcInc = Math.min(ellipseInc / 2, (stp - strt) / 2);
            const o1 = this._arc(arcInc, cx, cy, rx, ry, strt, stp, 1, o);
            const o2 = this._arc(arcInc, cx, cy, rx, ry, strt, stp, 1.5, o);
            let ops = o1.concat(o2);
            if (closed) {
                if (roughClosure) {
                    ops = ops.concat(this.doubleLine(cx, cy, cx + rx * Math.cos(strt), cy + ry * Math.sin(strt), o));
                    ops = ops.concat(this.doubleLine(cx, cy, cx + rx * Math.cos(stp), cy + ry * Math.sin(stp), o));
                }
                else {
                    ops.push({ op: 'lineTo', data: [cx, cy] });
                    ops.push({ op: 'lineTo', data: [cx + rx * Math.cos(strt), cy + ry * Math.sin(strt)] });
                }
            }
            return { type: 'path', ops };
        }
        svgPath(path, o) {
            path = (path || '').replace(/\n/g, ' ').replace(/(-\s)/g, '-').replace('/(\s\s)/g', ' ');
            let p = new RoughPath(path);
            if (o.simplification) {
                const fitter = new PathFitter(p.linearPoints, p.closed);
                const d = fitter.fit(o.simplification);
                p = new RoughPath(d);
            }
            let ops = [];
            const segments = p.segments || [];
            for (let i = 0; i < segments.length; i++) {
                const s = segments[i];
                const prev = i > 0 ? segments[i - 1] : null;
                const opList = this._processSegment(p, s, prev, o);
                if (opList && opList.length) {
                    ops = ops.concat(opList);
                }
            }
            return { type: 'path', ops };
        }
        solidFillPolygon(points, o) {
            const ops = [];
            if (points.length) {
                const offset = o.maxRandomnessOffset || 0;
                const len = points.length;
                if (len > 2) {
                    ops.push({ op: 'move', data: [points[0][0] + this.getOffset(-offset, offset, o), points[0][1] + this.getOffset(-offset, offset, o)] });
                    for (let i = 1; i < len; i++) {
                        ops.push({ op: 'lineTo', data: [points[i][0] + this.getOffset(-offset, offset, o), points[i][1] + this.getOffset(-offset, offset, o)] });
                    }
                }
            }
            return { type: 'fillPath', ops };
        }
        patternFillPolygon(points, o) {
            const filler = getFiller(this, o);
            return filler.fillPolygon(points, o);
        }
        patternFillEllipse(cx, cy, width, height, o) {
            const filler = getFiller(this, o);
            return filler.fillEllipse(cx, cy, width, height, o);
        }
        patternFillArc(x, y, width, height, start, stop, o) {
            const cx = x;
            const cy = y;
            let rx = Math.abs(width / 2);
            let ry = Math.abs(height / 2);
            rx += this.getOffset(-rx * 0.01, rx * 0.01, o);
            ry += this.getOffset(-ry * 0.01, ry * 0.01, o);
            let strt = start;
            let stp = stop;
            while (strt < 0) {
                strt += Math.PI * 2;
                stp += Math.PI * 2;
            }
            if ((stp - strt) > (Math.PI * 2)) {
                strt = 0;
                stp = Math.PI * 2;
            }
            const increment = (stp - strt) / o.curveStepCount;
            const points = [];
            for (let angle = strt; angle <= stp; angle = angle + increment) {
                points.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
            }
            points.push([cx + rx * Math.cos(stp), cy + ry * Math.sin(stp)]);
            points.push([cx, cy]);
            return this.patternFillPolygon(points, o);
        }
        /// 
        getOffset(min, max, ops) {
            return ops.roughness * ((Math.random() * (max - min)) + min);
        }
        doubleLine(x1, y1, x2, y2, o) {
            const o1 = this._line(x1, y1, x2, y2, o, true, false);
            const o2 = this._line(x1, y1, x2, y2, o, true, true);
            return o1.concat(o2);
        }
        _line(x1, y1, x2, y2, o, move, overlay) {
            const lengthSq = Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2);
            let offset = o.maxRandomnessOffset || 0;
            if ((offset * offset * 100) > lengthSq) {
                offset = Math.sqrt(lengthSq) / 10;
            }
            const halfOffset = offset / 2;
            const divergePoint = 0.2 + Math.random() * 0.2;
            let midDispX = o.bowing * o.maxRandomnessOffset * (y2 - y1) / 200;
            let midDispY = o.bowing * o.maxRandomnessOffset * (x1 - x2) / 200;
            midDispX = this.getOffset(-midDispX, midDispX, o);
            midDispY = this.getOffset(-midDispY, midDispY, o);
            const ops = [];
            if (move) {
                if (overlay) {
                    ops.push({
                        op: 'move', data: [
                            x1 + this.getOffset(-halfOffset, halfOffset, o),
                            y1 + this.getOffset(-halfOffset, halfOffset, o)
                        ]
                    });
                }
                else {
                    ops.push({
                        op: 'move', data: [
                            x1 + this.getOffset(-offset, offset, o),
                            y1 + this.getOffset(-offset, offset, o)
                        ]
                    });
                }
            }
            if (overlay) {
                ops.push({
                    op: 'bcurveTo', data: [
                        midDispX + x1 + (x2 - x1) * divergePoint + this.getOffset(-halfOffset, halfOffset, o),
                        midDispY + y1 + (y2 - y1) * divergePoint + this.getOffset(-halfOffset, halfOffset, o),
                        midDispX + x1 + 2 * (x2 - x1) * divergePoint + this.getOffset(-halfOffset, halfOffset, o),
                        midDispY + y1 + 2 * (y2 - y1) * divergePoint + this.getOffset(-halfOffset, halfOffset, o),
                        x2 + this.getOffset(-halfOffset, halfOffset, o),
                        y2 + this.getOffset(-halfOffset, halfOffset, o)
                    ]
                });
            }
            else {
                ops.push({
                    op: 'bcurveTo', data: [
                        midDispX + x1 + (x2 - x1) * divergePoint + this.getOffset(-offset, offset, o),
                        midDispY + y1 + (y2 - y1) * divergePoint + this.getOffset(-offset, offset, o),
                        midDispX + x1 + 2 * (x2 - x1) * divergePoint + this.getOffset(-offset, offset, o),
                        midDispY + y1 + 2 * (y2 - y1) * divergePoint + this.getOffset(-offset, offset, o),
                        x2 + this.getOffset(-offset, offset, o),
                        y2 + this.getOffset(-offset, offset, o)
                    ]
                });
            }
            return ops;
        }
        _curve(points, closePoint, o) {
            const len = points.length;
            let ops = [];
            if (len > 3) {
                const b = [];
                const s = 1 - o.curveTightness;
                ops.push({ op: 'move', data: [points[1][0], points[1][1]] });
                for (let i = 1; (i + 2) < len; i++) {
                    const cachedVertArray = points[i];
                    b[0] = [cachedVertArray[0], cachedVertArray[1]];
                    b[1] = [cachedVertArray[0] + (s * points[i + 1][0] - s * points[i - 1][0]) / 6, cachedVertArray[1] + (s * points[i + 1][1] - s * points[i - 1][1]) / 6];
                    b[2] = [points[i + 1][0] + (s * points[i][0] - s * points[i + 2][0]) / 6, points[i + 1][1] + (s * points[i][1] - s * points[i + 2][1]) / 6];
                    b[3] = [points[i + 1][0], points[i + 1][1]];
                    ops.push({ op: 'bcurveTo', data: [b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]] });
                }
                if (closePoint && closePoint.length === 2) {
                    const ro = o.maxRandomnessOffset;
                    ops.push({ op: 'lineTo', data: [closePoint[0] + this.getOffset(-ro, ro, o), closePoint[1] + +this.getOffset(-ro, ro, o)] });
                }
            }
            else if (len === 3) {
                ops.push({ op: 'move', data: [points[1][0], points[1][1]] });
                ops.push({
                    op: 'bcurveTo', data: [
                        points[1][0], points[1][1],
                        points[2][0], points[2][1],
                        points[2][0], points[2][1]
                    ]
                });
            }
            else if (len === 2) {
                ops = ops.concat(this.doubleLine(points[0][0], points[0][1], points[1][0], points[1][1], o));
            }
            return ops;
        }
        _ellipse(increment, cx, cy, rx, ry, offset, overlap, o) {
            const radOffset = this.getOffset(-0.5, 0.5, o) - (Math.PI / 2);
            const points = [];
            points.push([
                this.getOffset(-offset, offset, o) + cx + 0.9 * rx * Math.cos(radOffset - increment),
                this.getOffset(-offset, offset, o) + cy + 0.9 * ry * Math.sin(radOffset - increment)
            ]);
            for (let angle = radOffset; angle < (Math.PI * 2 + radOffset - 0.01); angle = angle + increment) {
                points.push([
                    this.getOffset(-offset, offset, o) + cx + rx * Math.cos(angle),
                    this.getOffset(-offset, offset, o) + cy + ry * Math.sin(angle)
                ]);
            }
            points.push([
                this.getOffset(-offset, offset, o) + cx + rx * Math.cos(radOffset + Math.PI * 2 + overlap * 0.5),
                this.getOffset(-offset, offset, o) + cy + ry * Math.sin(radOffset + Math.PI * 2 + overlap * 0.5)
            ]);
            points.push([
                this.getOffset(-offset, offset, o) + cx + 0.98 * rx * Math.cos(radOffset + overlap),
                this.getOffset(-offset, offset, o) + cy + 0.98 * ry * Math.sin(radOffset + overlap)
            ]);
            points.push([
                this.getOffset(-offset, offset, o) + cx + 0.9 * rx * Math.cos(radOffset + overlap * 0.5),
                this.getOffset(-offset, offset, o) + cy + 0.9 * ry * Math.sin(radOffset + overlap * 0.5)
            ]);
            return this._curve(points, null, o);
        }
        _curveWithOffset(points, offset, o) {
            const ps = [];
            ps.push([
                points[0][0] + this.getOffset(-offset, offset, o),
                points[0][1] + this.getOffset(-offset, offset, o),
            ]);
            ps.push([
                points[0][0] + this.getOffset(-offset, offset, o),
                points[0][1] + this.getOffset(-offset, offset, o),
            ]);
            for (let i = 1; i < points.length; i++) {
                ps.push([
                    points[i][0] + this.getOffset(-offset, offset, o),
                    points[i][1] + this.getOffset(-offset, offset, o),
                ]);
                if (i === (points.length - 1)) {
                    ps.push([
                        points[i][0] + this.getOffset(-offset, offset, o),
                        points[i][1] + this.getOffset(-offset, offset, o),
                    ]);
                }
            }
            return this._curve(ps, null, o);
        }
        _arc(increment, cx, cy, rx, ry, strt, stp, offset, o) {
            const radOffset = strt + this.getOffset(-0.1, 0.1, o);
            const points = [];
            points.push([
                this.getOffset(-offset, offset, o) + cx + 0.9 * rx * Math.cos(radOffset - increment),
                this.getOffset(-offset, offset, o) + cy + 0.9 * ry * Math.sin(radOffset - increment)
            ]);
            for (let angle = radOffset; angle <= stp; angle = angle + increment) {
                points.push([
                    this.getOffset(-offset, offset, o) + cx + rx * Math.cos(angle),
                    this.getOffset(-offset, offset, o) + cy + ry * Math.sin(angle)
                ]);
            }
            points.push([
                cx + rx * Math.cos(stp),
                cy + ry * Math.sin(stp)
            ]);
            points.push([
                cx + rx * Math.cos(stp),
                cy + ry * Math.sin(stp)
            ]);
            return this._curve(points, null, o);
        }
        _bezierTo(x1, y1, x2, y2, x, y, path, o) {
            const ops = [];
            const ros = [o.maxRandomnessOffset || 1, (o.maxRandomnessOffset || 1) + 0.5];
            let f = [0, 0];
            for (let i = 0; i < 2; i++) {
                if (i === 0) {
                    ops.push({ op: 'move', data: [path.x, path.y] });
                }
                else {
                    ops.push({ op: 'move', data: [path.x + this.getOffset(-ros[0], ros[0], o), path.y + this.getOffset(-ros[0], ros[0], o)] });
                }
                f = [x + this.getOffset(-ros[i], ros[i], o), y + this.getOffset(-ros[i], ros[i], o)];
                ops.push({
                    op: 'bcurveTo', data: [
                        x1 + this.getOffset(-ros[i], ros[i], o), y1 + this.getOffset(-ros[i], ros[i], o),
                        x2 + this.getOffset(-ros[i], ros[i], o), y2 + this.getOffset(-ros[i], ros[i], o),
                        f[0], f[1]
                    ]
                });
            }
            path.setPosition(f[0], f[1]);
            return ops;
        }
        _processSegment(path, seg, prevSeg, o) {
            let ops = [];
            switch (seg.key) {
                case 'M':
                case 'm': {
                    const delta = seg.key === 'm';
                    if (seg.data.length >= 2) {
                        let x = +seg.data[0];
                        let y = +seg.data[1];
                        if (delta) {
                            x += path.x;
                            y += path.y;
                        }
                        const ro = 1 * (o.maxRandomnessOffset || 0);
                        x = x + this.getOffset(-ro, ro, o);
                        y = y + this.getOffset(-ro, ro, o);
                        path.setPosition(x, y);
                        ops.push({ op: 'move', data: [x, y] });
                    }
                    break;
                }
                case 'L':
                case 'l': {
                    const delta = seg.key === 'l';
                    if (seg.data.length >= 2) {
                        let x = +seg.data[0];
                        let y = +seg.data[1];
                        if (delta) {
                            x += path.x;
                            y += path.y;
                        }
                        ops = ops.concat(this.doubleLine(path.x, path.y, x, y, o));
                        path.setPosition(x, y);
                    }
                    break;
                }
                case 'H':
                case 'h': {
                    const delta = seg.key === 'h';
                    if (seg.data.length) {
                        let x = +seg.data[0];
                        if (delta) {
                            x += path.x;
                        }
                        ops = ops.concat(this.doubleLine(path.x, path.y, x, path.y, o));
                        path.setPosition(x, path.y);
                    }
                    break;
                }
                case 'V':
                case 'v': {
                    const delta = seg.key === 'v';
                    if (seg.data.length) {
                        let y = +seg.data[0];
                        if (delta) {
                            y += path.y;
                        }
                        ops = ops.concat(this.doubleLine(path.x, path.y, path.x, y, o));
                        path.setPosition(path.x, y);
                    }
                    break;
                }
                case 'Z':
                case 'z': {
                    if (path.first) {
                        ops = ops.concat(this.doubleLine(path.x, path.y, path.first[0], path.first[1], o));
                        path.setPosition(path.first[0], path.first[1]);
                        path.first = null;
                    }
                    break;
                }
                case 'C':
                case 'c': {
                    const delta = seg.key === 'c';
                    if (seg.data.length >= 6) {
                        let x1 = +seg.data[0];
                        let y1 = +seg.data[1];
                        let x2 = +seg.data[2];
                        let y2 = +seg.data[3];
                        let x = +seg.data[4];
                        let y = +seg.data[5];
                        if (delta) {
                            x1 += path.x;
                            x2 += path.x;
                            x += path.x;
                            y1 += path.y;
                            y2 += path.y;
                            y += path.y;
                        }
                        const ob = this._bezierTo(x1, y1, x2, y2, x, y, path, o);
                        ops = ops.concat(ob);
                        path.bezierReflectionPoint = [x + (x - x2), y + (y - y2)];
                    }
                    break;
                }
                case 'S':
                case 's': {
                    const delta = seg.key === 's';
                    if (seg.data.length >= 4) {
                        let x2 = +seg.data[0];
                        let y2 = +seg.data[1];
                        let x = +seg.data[2];
                        let y = +seg.data[3];
                        if (delta) {
                            x2 += path.x;
                            x += path.x;
                            y2 += path.y;
                            y += path.y;
                        }
                        let x1 = x2;
                        let y1 = y2;
                        const prevKey = prevSeg ? prevSeg.key : '';
                        let ref = null;
                        if (prevKey === 'c' || prevKey === 'C' || prevKey === 's' || prevKey === 'S') {
                            ref = path.bezierReflectionPoint;
                        }
                        if (ref) {
                            x1 = ref[0];
                            y1 = ref[1];
                        }
                        const ob = this._bezierTo(x1, y1, x2, y2, x, y, path, o);
                        ops = ops.concat(ob);
                        path.bezierReflectionPoint = [x + (x - x2), y + (y - y2)];
                    }
                    break;
                }
                case 'Q':
                case 'q': {
                    const delta = seg.key === 'q';
                    if (seg.data.length >= 4) {
                        let x1 = +seg.data[0];
                        let y1 = +seg.data[1];
                        let x = +seg.data[2];
                        let y = +seg.data[3];
                        if (delta) {
                            x1 += path.x;
                            x += path.x;
                            y1 += path.y;
                            y += path.y;
                        }
                        const offset1 = 1 * (1 + o.roughness * 0.2);
                        const offset2 = 1.5 * (1 + o.roughness * 0.22);
                        ops.push({ op: 'move', data: [path.x + this.getOffset(-offset1, offset1, o), path.y + this.getOffset(-offset1, offset1, o)] });
                        let f = [x + this.getOffset(-offset1, offset1, o), y + this.getOffset(-offset1, offset1, o)];
                        ops.push({
                            op: 'qcurveTo', data: [
                                x1 + this.getOffset(-offset1, offset1, o), y1 + this.getOffset(-offset1, offset1, o),
                                f[0], f[1]
                            ]
                        });
                        ops.push({ op: 'move', data: [path.x + this.getOffset(-offset2, offset2, o), path.y + this.getOffset(-offset2, offset2, o)] });
                        f = [x + this.getOffset(-offset2, offset2, o), y + this.getOffset(-offset2, offset2, o)];
                        ops.push({
                            op: 'qcurveTo', data: [
                                x1 + this.getOffset(-offset2, offset2, o), y1 + this.getOffset(-offset2, offset2, o),
                                f[0], f[1]
                            ]
                        });
                        path.setPosition(f[0], f[1]);
                        path.quadReflectionPoint = [x + (x - x1), y + (y - y1)];
                    }
                    break;
                }
                case 'T':
                case 't': {
                    const delta = seg.key === 't';
                    if (seg.data.length >= 2) {
                        let x = +seg.data[0];
                        let y = +seg.data[1];
                        if (delta) {
                            x += path.x;
                            y += path.y;
                        }
                        let x1 = x;
                        let y1 = y;
                        const prevKey = prevSeg ? prevSeg.key : '';
                        let ref = null;
                        if (prevKey === 'q' || prevKey === 'Q' || prevKey === 't' || prevKey === 'T') {
                            ref = path.quadReflectionPoint;
                        }
                        if (ref) {
                            x1 = ref[0];
                            y1 = ref[1];
                        }
                        const offset1 = 1 * (1 + o.roughness * 0.2);
                        const offset2 = 1.5 * (1 + o.roughness * 0.22);
                        ops.push({ op: 'move', data: [path.x + this.getOffset(-offset1, offset1, o), path.y + this.getOffset(-offset1, offset1, o)] });
                        let f = [x + this.getOffset(-offset1, offset1, o), y + this.getOffset(-offset1, offset1, o)];
                        ops.push({
                            op: 'qcurveTo', data: [
                                x1 + this.getOffset(-offset1, offset1, o), y1 + this.getOffset(-offset1, offset1, o),
                                f[0], f[1]
                            ]
                        });
                        ops.push({ op: 'move', data: [path.x + this.getOffset(-offset2, offset2, o), path.y + this.getOffset(-offset2, offset2, o)] });
                        f = [x + this.getOffset(-offset2, offset2, o), y + this.getOffset(-offset2, offset2, o)];
                        ops.push({
                            op: 'qcurveTo', data: [
                                x1 + this.getOffset(-offset2, offset2, o), y1 + this.getOffset(-offset2, offset2, o),
                                f[0], f[1]
                            ]
                        });
                        path.setPosition(f[0], f[1]);
                        path.quadReflectionPoint = [x + (x - x1), y + (y - y1)];
                    }
                    break;
                }
                case 'A':
                case 'a': {
                    const delta = seg.key === 'a';
                    if (seg.data.length >= 7) {
                        const rx = +seg.data[0];
                        const ry = +seg.data[1];
                        const angle = +seg.data[2];
                        const largeArcFlag = +seg.data[3];
                        const sweepFlag = +seg.data[4];
                        let x = +seg.data[5];
                        let y = +seg.data[6];
                        if (delta) {
                            x += path.x;
                            y += path.y;
                        }
                        if (x === path.x && y === path.y) {
                            break;
                        }
                        if (rx === 0 || ry === 0) {
                            ops = ops.concat(this.doubleLine(path.x, path.y, x, y, o));
                            path.setPosition(x, y);
                        }
                        else {
                            for (let i = 0; i < 1; i++) {
                                const arcConverter = new RoughArcConverter([path.x, path.y], [x, y], [rx, ry], angle, largeArcFlag ? true : false, sweepFlag ? true : false);
                                let segment = arcConverter.getNextSegment();
                                while (segment) {
                                    const ob = this._bezierTo(segment.cp1[0], segment.cp1[1], segment.cp2[0], segment.cp2[1], segment.to[0], segment.to[1], path, o);
                                    ops = ops.concat(ob);
                                    segment = arcConverter.getNextSegment();
                                }
                            }
                        }
                    }
                    break;
                }
                default:
                    break;
            }
            return ops;
        }
    }

    const hasSelf = typeof self !== 'undefined';
    const roughScript = hasSelf && self && self.document && self.document.currentScript && self.document.currentScript.src;
    function createRenderer(config) {
        if (hasSelf && roughScript && self && self.workly && config.async && (!config.noWorker)) {
            const worklySource = config.worklyURL || 'https://cdn.jsdelivr.net/gh/pshihn/workly/dist/workly.min.js';
            if (worklySource) {
                const code = `importScripts('${worklySource}', '${roughScript}');\nworkly.expose(self.rough.createRenderer());`;
                const ourl = URL.createObjectURL(new Blob([code]));
                return self.workly.proxy(ourl);
            }
        }
        return new RoughRenderer();
    }

    const hasSelf$1 = typeof self !== 'undefined';
    class RoughGeneratorBase {
        constructor(config, surface) {
            this.defaultOptions = {
                maxRandomnessOffset: 2,
                roughness: 1,
                bowing: 1,
                stroke: '#000',
                strokeWidth: 1,
                curveTightness: 0,
                curveStepCount: 9,
                fillStyle: 'hachure',
                fillWeight: -1,
                hachureAngle: -41,
                hachureGap: -1
            };
            this.config = config || {};
            this.surface = surface;
            this.renderer = createRenderer(this.config);
            if (this.config.options) {
                this.defaultOptions = this._options(this.config.options);
            }
        }
        _options(options) {
            return options ? Object.assign({}, this.defaultOptions, options) : this.defaultOptions;
        }
        _drawable(shape, sets, options) {
            return { shape, sets: sets || [], options: options || this.defaultOptions };
        }
        get lib() {
            return this.renderer;
        }
        getCanvasSize() {
            const val = (w) => {
                if (w && typeof w === 'object') {
                    if (w.baseVal && w.baseVal.value) {
                        return w.baseVal.value;
                    }
                }
                return w || 100;
            };
            if (this.surface) {
                return [val(this.surface.width), val(this.surface.height)];
            }
            return [100, 100];
        }
        computePolygonSize(points) {
            if (points.length) {
                let left = points[0][0];
                let right = points[0][0];
                let top = points[0][1];
                let bottom = points[0][1];
                for (let i = 1; i < points.length; i++) {
                    left = Math.min(left, points[i][0]);
                    right = Math.max(right, points[i][0]);
                    top = Math.min(top, points[i][1]);
                    bottom = Math.max(bottom, points[i][1]);
                }
                return [(right - left), (bottom - top)];
            }
            return [0, 0];
        }
        polygonPath(points) {
            let d = '';
            if (points.length) {
                d = `M${points[0][0]},${points[0][1]}`;
                for (let i = 1; i < points.length; i++) {
                    d = `${d} L${points[i][0]},${points[i][1]}`;
                }
            }
            return d;
        }
        computePathSize(d) {
            let size = [0, 0];
            if (hasSelf$1 && self.document) {
                try {
                    const ns = 'http://www.w3.org/2000/svg';
                    const svg = self.document.createElementNS(ns, 'svg');
                    svg.setAttribute('width', '0');
                    svg.setAttribute('height', '0');
                    const pathNode = self.document.createElementNS(ns, 'path');
                    pathNode.setAttribute('d', d);
                    svg.appendChild(pathNode);
                    self.document.body.appendChild(svg);
                    const bb = pathNode.getBBox();
                    if (bb) {
                        size[0] = bb.width || 0;
                        size[1] = bb.height || 0;
                    }
                    self.document.body.removeChild(svg);
                }
                catch (err) { }
            }
            const canvasSize = this.getCanvasSize();
            if (!(size[0] * size[1])) {
                size = canvasSize;
            }
            return size;
        }
        toPaths(drawable) {
            const sets = drawable.sets || [];
            const o = drawable.options || this.defaultOptions;
            const paths = [];
            for (const drawing of sets) {
                let path = null;
                switch (drawing.type) {
                    case 'path':
                        path = {
                            d: this.opsToPath(drawing),
                            stroke: o.stroke,
                            strokeWidth: o.strokeWidth,
                            fill: 'none'
                        };
                        break;
                    case 'fillPath':
                        path = {
                            d: this.opsToPath(drawing),
                            stroke: 'none',
                            strokeWidth: 0,
                            fill: o.fill || 'none'
                        };
                        break;
                    case 'fillSketch':
                        path = this.fillSketch(drawing, o);
                        break;
                    case 'path2Dfill':
                        path = {
                            d: drawing.path || '',
                            stroke: 'none',
                            strokeWidth: 0,
                            fill: o.fill || 'none'
                        };
                        break;
                    case 'path2Dpattern': {
                        const size = drawing.size;
                        const pattern = {
                            x: 0, y: 0, width: 1, height: 1,
                            viewBox: `0 0 ${Math.round(size[0])} ${Math.round(size[1])}`,
                            patternUnits: 'objectBoundingBox',
                            path: this.fillSketch(drawing, o)
                        };
                        path = {
                            d: drawing.path,
                            stroke: 'none',
                            strokeWidth: 0,
                            pattern: pattern
                        };
                        break;
                    }
                }
                if (path) {
                    paths.push(path);
                }
            }
            return paths;
        }
        fillSketch(drawing, o) {
            let fweight = o.fillWeight;
            if (fweight < 0) {
                fweight = o.strokeWidth / 2;
            }
            return {
                d: this.opsToPath(drawing),
                stroke: o.fill || 'none',
                strokeWidth: fweight,
                fill: 'none'
            };
        }
        opsToPath(drawing) {
            let path = '';
            for (const item of drawing.ops) {
                const data = item.data;
                switch (item.op) {
                    case 'move':
                        path += `M${data[0]} ${data[1]} `;
                        break;
                    case 'bcurveTo':
                        path += `C${data[0]} ${data[1]}, ${data[2]} ${data[3]}, ${data[4]} ${data[5]} `;
                        break;
                    case 'qcurveTo':
                        path += `Q${data[0]} ${data[1]}, ${data[2]} ${data[3]} `;
                        break;
                    case 'lineTo':
                        path += `L${data[0]} ${data[1]} `;
                        break;
                }
            }
            return path.trim();
        }
    }

    class RoughGenerator extends RoughGeneratorBase {
        constructor(config, surface) {
            super(config, surface);
        }
        line(x1, y1, x2, y2, options) {
            const o = this._options(options);
            return this._drawable('line', [this.lib.line(x1, y1, x2, y2, o)], o);
        }
        rectangle(x, y, width, height, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                const points = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
                if (o.fillStyle === 'solid') {
                    paths.push(this.lib.solidFillPolygon(points, o));
                }
                else {
                    paths.push(this.lib.patternFillPolygon(points, o));
                }
            }
            paths.push(this.lib.rectangle(x, y, width, height, o));
            return this._drawable('rectangle', paths, o);
        }
        ellipse(x, y, width, height, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = this.lib.ellipse(x, y, width, height, o);
                    shape.type = 'fillPath';
                    paths.push(shape);
                }
                else {
                    paths.push(this.lib.patternFillEllipse(x, y, width, height, o));
                }
            }
            paths.push(this.lib.ellipse(x, y, width, height, o));
            return this._drawable('ellipse', paths, o);
        }
        circle(x, y, diameter, options) {
            const ret = this.ellipse(x, y, diameter, diameter, options);
            ret.shape = 'circle';
            return ret;
        }
        linearPath(points, options) {
            const o = this._options(options);
            return this._drawable('linearPath', [this.lib.linearPath(points, false, o)], o);
        }
        arc(x, y, width, height, start, stop, closed = false, options) {
            const o = this._options(options);
            const paths = [];
            if (closed && o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = this.lib.arc(x, y, width, height, start, stop, true, false, o);
                    shape.type = 'fillPath';
                    paths.push(shape);
                }
                else {
                    paths.push(this.lib.patternFillArc(x, y, width, height, start, stop, o));
                }
            }
            paths.push(this.lib.arc(x, y, width, height, start, stop, closed, true, o));
            return this._drawable('arc', paths, o);
        }
        curve(points, options) {
            const o = this._options(options);
            return this._drawable('curve', [this.lib.curve(points, o)], o);
        }
        polygon(points, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    paths.push(this.lib.solidFillPolygon(points, o));
                }
                else {
                    const size = this.computePolygonSize(points);
                    const fillPoints = [
                        [0, 0],
                        [size[0], 0],
                        [size[0], size[1]],
                        [0, size[1]]
                    ];
                    const shape = this.lib.patternFillPolygon(fillPoints, o);
                    shape.type = 'path2Dpattern';
                    shape.size = size;
                    shape.path = this.polygonPath(points);
                    paths.push(shape);
                }
            }
            paths.push(this.lib.linearPath(points, true, o));
            return this._drawable('polygon', paths, o);
        }
        path(d, options) {
            const o = this._options(options);
            const paths = [];
            if (!d) {
                return this._drawable('path', paths, o);
            }
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = { type: 'path2Dfill', path: d, ops: [] };
                    paths.push(shape);
                }
                else {
                    const size = this.computePathSize(d);
                    const points = [
                        [0, 0],
                        [size[0], 0],
                        [size[0], size[1]],
                        [0, size[1]]
                    ];
                    const shape = this.lib.patternFillPolygon(points, o);
                    shape.type = 'path2Dpattern';
                    shape.size = size;
                    shape.path = d;
                    paths.push(shape);
                }
            }
            paths.push(this.lib.svgPath(d, o));
            return this._drawable('path', paths, o);
        }
    }

    const hasDocument = typeof document !== 'undefined';
    class RoughCanvasBase {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
        }
        static createRenderer() {
            return new RoughRenderer();
        }
        draw(drawable) {
            const sets = drawable.sets || [];
            const o = drawable.options || this.getDefaultOptions();
            const ctx = this.ctx;
            for (const drawing of sets) {
                switch (drawing.type) {
                    case 'path':
                        ctx.save();
                        ctx.strokeStyle = o.stroke;
                        ctx.lineWidth = o.strokeWidth;
                        this._drawToContext(ctx, drawing);
                        ctx.restore();
                        break;
                    case 'fillPath':
                        ctx.save();
                        ctx.fillStyle = o.fill || '';
                        this._drawToContext(ctx, drawing);
                        ctx.restore();
                        break;
                    case 'fillSketch':
                        this.fillSketch(ctx, drawing, o);
                        break;
                    case 'path2Dfill': {
                        this.ctx.save();
                        this.ctx.fillStyle = o.fill || '';
                        const p2d = new Path2D(drawing.path);
                        this.ctx.fill(p2d);
                        this.ctx.restore();
                        break;
                    }
                    case 'path2Dpattern': {
                        const doc = this.canvas.ownerDocument || (hasDocument && document);
                        if (doc) {
                            const size = drawing.size;
                            const hcanvas = doc.createElement('canvas');
                            const hcontext = hcanvas.getContext('2d');
                            const bbox = this.computeBBox(drawing.path);
                            if (bbox && (bbox.width || bbox.height)) {
                                hcanvas.width = this.canvas.width;
                                hcanvas.height = this.canvas.height;
                                hcontext.translate(bbox.x || 0, bbox.y || 0);
                            }
                            else {
                                hcanvas.width = size[0];
                                hcanvas.height = size[1];
                            }
                            this.fillSketch(hcontext, drawing, o);
                            this.ctx.save();
                            this.ctx.fillStyle = this.ctx.createPattern(hcanvas, 'repeat');
                            const p2d = new Path2D(drawing.path);
                            this.ctx.fill(p2d);
                            this.ctx.restore();
                        }
                        else {
                            console.error('Cannot render path2Dpattern. No defs/document defined.');
                        }
                        break;
                    }
                }
            }
        }
        computeBBox(d) {
            if (hasDocument) {
                try {
                    const ns = 'http://www.w3.org/2000/svg';
                    const svg = document.createElementNS(ns, 'svg');
                    svg.setAttribute('width', '0');
                    svg.setAttribute('height', '0');
                    const pathNode = self.document.createElementNS(ns, 'path');
                    pathNode.setAttribute('d', d);
                    svg.appendChild(pathNode);
                    document.body.appendChild(svg);
                    const bbox = pathNode.getBBox();
                    document.body.removeChild(svg);
                    return bbox;
                }
                catch (err) { }
            }
            return null;
        }
        fillSketch(ctx, drawing, o) {
            let fweight = o.fillWeight;
            if (fweight < 0) {
                fweight = o.strokeWidth / 2;
            }
            ctx.save();
            ctx.strokeStyle = o.fill || '';
            ctx.lineWidth = fweight;
            this._drawToContext(ctx, drawing);
            ctx.restore();
        }
        _drawToContext(ctx, drawing) {
            ctx.beginPath();
            for (const item of drawing.ops) {
                const data = item.data;
                switch (item.op) {
                    case 'move':
                        ctx.moveTo(data[0], data[1]);
                        break;
                    case 'bcurveTo':
                        ctx.bezierCurveTo(data[0], data[1], data[2], data[3], data[4], data[5]);
                        break;
                    case 'qcurveTo':
                        ctx.quadraticCurveTo(data[0], data[1], data[2], data[3]);
                        break;
                    case 'lineTo':
                        ctx.lineTo(data[0], data[1]);
                        break;
                }
            }
            if (drawing.type === 'fillPath') {
                ctx.fill();
            }
            else {
                ctx.stroke();
            }
        }
    }

    class RoughCanvas extends RoughCanvasBase {
        constructor(canvas, config) {
            super(canvas);
            this.gen = new RoughGenerator(config || null, this.canvas);
        }
        get generator() {
            return this.gen;
        }
        getDefaultOptions() {
            return this.gen.defaultOptions;
        }
        line(x1, y1, x2, y2, options) {
            const d = this.gen.line(x1, y1, x2, y2, options);
            this.draw(d);
            return d;
        }
        rectangle(x, y, width, height, options) {
            const d = this.gen.rectangle(x, y, width, height, options);
            this.draw(d);
            return d;
        }
        ellipse(x, y, width, height, options) {
            const d = this.gen.ellipse(x, y, width, height, options);
            this.draw(d);
            return d;
        }
        circle(x, y, diameter, options) {
            const d = this.gen.circle(x, y, diameter, options);
            this.draw(d);
            return d;
        }
        linearPath(points, options) {
            const d = this.gen.linearPath(points, options);
            this.draw(d);
            return d;
        }
        polygon(points, options) {
            const d = this.gen.polygon(points, options);
            this.draw(d);
            return d;
        }
        arc(x, y, width, height, start, stop, closed = false, options) {
            const d = this.gen.arc(x, y, width, height, start, stop, closed, options);
            this.draw(d);
            return d;
        }
        curve(points, options) {
            const d = this.gen.curve(points, options);
            this.draw(d);
            return d;
        }
        path(d, options) {
            const drawing = this.gen.path(d, options);
            this.draw(drawing);
            return drawing;
        }
    }

    class RoughGeneratorAsync extends RoughGeneratorBase {
        async line(x1, y1, x2, y2, options) {
            const o = this._options(options);
            return this._drawable('line', [await this.lib.line(x1, y1, x2, y2, o)], o);
        }
        async rectangle(x, y, width, height, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                const points = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
                if (o.fillStyle === 'solid') {
                    paths.push(await this.lib.solidFillPolygon(points, o));
                }
                else {
                    paths.push(await this.lib.patternFillPolygon(points, o));
                }
            }
            paths.push(await this.lib.rectangle(x, y, width, height, o));
            return this._drawable('rectangle', paths, o);
        }
        async ellipse(x, y, width, height, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = await this.lib.ellipse(x, y, width, height, o);
                    shape.type = 'fillPath';
                    paths.push(shape);
                }
                else {
                    paths.push(await this.lib.patternFillEllipse(x, y, width, height, o));
                }
            }
            paths.push(await this.lib.ellipse(x, y, width, height, o));
            return this._drawable('ellipse', paths, o);
        }
        async circle(x, y, diameter, options) {
            const ret = await this.ellipse(x, y, diameter, diameter, options);
            ret.shape = 'circle';
            return ret;
        }
        async linearPath(points, options) {
            const o = this._options(options);
            return this._drawable('linearPath', [await this.lib.linearPath(points, false, o)], o);
        }
        async arc(x, y, width, height, start, stop, closed = false, options) {
            const o = this._options(options);
            const paths = [];
            if (closed && o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = await this.lib.arc(x, y, width, height, start, stop, true, false, o);
                    shape.type = 'fillPath';
                    paths.push(shape);
                }
                else {
                    paths.push(await this.lib.patternFillArc(x, y, width, height, start, stop, o));
                }
            }
            paths.push(await this.lib.arc(x, y, width, height, start, stop, closed, true, o));
            return this._drawable('arc', paths, o);
        }
        async curve(points, options) {
            const o = this._options(options);
            return this._drawable('curve', [await this.lib.curve(points, o)], o);
        }
        async polygon(points, options) {
            const o = this._options(options);
            const paths = [];
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    paths.push(await this.lib.solidFillPolygon(points, o));
                }
                else {
                    const size = this.computePolygonSize(points);
                    const fillPoints = [
                        [0, 0],
                        [size[0], 0],
                        [size[0], size[1]],
                        [0, size[1]]
                    ];
                    const shape = await this.lib.patternFillPolygon(fillPoints, o);
                    shape.type = 'path2Dpattern';
                    shape.size = size;
                    shape.path = this.polygonPath(points);
                    paths.push(shape);
                }
            }
            paths.push(await this.lib.linearPath(points, true, o));
            return this._drawable('polygon', paths, o);
        }
        async path(d, options) {
            const o = this._options(options);
            const paths = [];
            if (!d) {
                return this._drawable('path', paths, o);
            }
            if (o.fill) {
                if (o.fillStyle === 'solid') {
                    const shape = { type: 'path2Dfill', path: d, ops: [] };
                    paths.push(shape);
                }
                else {
                    const size = this.computePathSize(d);
                    const points = [
                        [0, 0],
                        [size[0], 0],
                        [size[0], size[1]],
                        [0, size[1]]
                    ];
                    const shape = await this.lib.patternFillPolygon(points, o);
                    shape.type = 'path2Dpattern';
                    shape.size = size;
                    shape.path = d;
                    paths.push(shape);
                }
            }
            paths.push(await this.lib.svgPath(d, o));
            return this._drawable('path', paths, o);
        }
    }

    class RoughCanvasAsync extends RoughCanvasBase {
        constructor(canvas, config) {
            super(canvas);
            this.genAsync = new RoughGeneratorAsync(config || null, this.canvas);
        }
        get generator() {
            return this.genAsync;
        }
        getDefaultOptions() {
            return this.genAsync.defaultOptions;
        }
        async line(x1, y1, x2, y2, options) {
            const d = await this.genAsync.line(x1, y1, x2, y2, options);
            this.draw(d);
            return d;
        }
        async rectangle(x, y, width, height, options) {
            const d = await this.genAsync.rectangle(x, y, width, height, options);
            this.draw(d);
            return d;
        }
        async ellipse(x, y, width, height, options) {
            const d = await this.genAsync.ellipse(x, y, width, height, options);
            this.draw(d);
            return d;
        }
        async circle(x, y, diameter, options) {
            const d = await this.genAsync.circle(x, y, diameter, options);
            this.draw(d);
            return d;
        }
        async linearPath(points, options) {
            const d = await this.genAsync.linearPath(points, options);
            this.draw(d);
            return d;
        }
        async polygon(points, options) {
            const d = await this.genAsync.polygon(points, options);
            this.draw(d);
            return d;
        }
        async arc(x, y, width, height, start, stop, closed = false, options) {
            const d = await this.genAsync.arc(x, y, width, height, start, stop, closed, options);
            this.draw(d);
            return d;
        }
        async curve(points, options) {
            const d = await this.genAsync.curve(points, options);
            this.draw(d);
            return d;
        }
        async path(d, options) {
            const drawing = await this.genAsync.path(d, options);
            this.draw(drawing);
            return drawing;
        }
    }

    const hasDocument$1 = typeof document !== 'undefined';
    class RoughSVGBase {
        constructor(svg) {
            this.svg = svg;
        }
        static createRenderer() {
            return new RoughRenderer();
        }
        get defs() {
            const doc = this.svg.ownerDocument || (hasDocument$1 && document);
            if (doc) {
                if (!this._defs) {
                    const dnode = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    if (this.svg.firstChild) {
                        this.svg.insertBefore(dnode, this.svg.firstChild);
                    }
                    else {
                        this.svg.appendChild(dnode);
                    }
                    this._defs = dnode;
                }
            }
            return this._defs || null;
        }
        draw(drawable) {
            const sets = drawable.sets || [];
            const o = drawable.options || this.getDefaultOptions();
            const doc = this.svg.ownerDocument || (hasDocument$1 && document);
            const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (const drawing of sets) {
                let path = null;
                switch (drawing.type) {
                    case 'path': {
                        path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', this.opsToPath(drawing));
                        path.style.stroke = o.stroke;
                        path.style.strokeWidth = o.strokeWidth + '';
                        path.style.fill = 'none';
                        break;
                    }
                    case 'fillPath': {
                        path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', this.opsToPath(drawing));
                        path.style.stroke = 'none';
                        path.style.strokeWidth = '0';
                        path.style.fill = o.fill || null;
                        break;
                    }
                    case 'fillSketch': {
                        path = this.fillSketch(doc, drawing, o);
                        break;
                    }
                    case 'path2Dfill': {
                        path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', drawing.path || '');
                        path.style.stroke = 'none';
                        path.style.strokeWidth = '0';
                        path.style.fill = o.fill || null;
                        break;
                    }
                    case 'path2Dpattern': {
                        if (!this.defs) {
                            console.error('Cannot render path2Dpattern. No defs/document defined.');
                        }
                        else {
                            const size = drawing.size;
                            const pattern = doc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
                            const id = `rough-${Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER || 999999))}`;
                            pattern.setAttribute('id', id);
                            pattern.setAttribute('x', '0');
                            pattern.setAttribute('y', '0');
                            pattern.setAttribute('width', '1');
                            pattern.setAttribute('height', '1');
                            pattern.setAttribute('height', '1');
                            pattern.setAttribute('viewBox', `0 0 ${Math.round(size[0])} ${Math.round(size[1])}`);
                            pattern.setAttribute('patternUnits', 'objectBoundingBox');
                            const patternPath = this.fillSketch(doc, drawing, o);
                            pattern.appendChild(patternPath);
                            this.defs.appendChild(pattern);
                            path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', drawing.path || '');
                            path.style.stroke = 'none';
                            path.style.strokeWidth = '0';
                            path.style.fill = `url(#${id})`;
                        }
                        break;
                    }
                }
                if (path) {
                    g.appendChild(path);
                }
            }
            return g;
        }
        fillSketch(doc, drawing, o) {
            let fweight = o.fillWeight;
            if (fweight < 0) {
                fweight = o.strokeWidth / 2;
            }
            const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', this.opsToPath(drawing));
            path.style.stroke = o.fill || null;
            path.style.strokeWidth = fweight + '';
            path.style.fill = 'none';
            return path;
        }
    }

    class RoughSVG extends RoughSVGBase {
        constructor(svg, config) {
            super(svg);
            this.gen = new RoughGenerator(config || null, this.svg);
        }
        get generator() {
            return this.gen;
        }
        getDefaultOptions() {
            return this.gen.defaultOptions;
        }
        opsToPath(drawing) {
            return this.gen.opsToPath(drawing);
        }
        line(x1, y1, x2, y2, options) {
            const d = this.gen.line(x1, y1, x2, y2, options);
            return this.draw(d);
        }
        rectangle(x, y, width, height, options) {
            const d = this.gen.rectangle(x, y, width, height, options);
            return this.draw(d);
        }
        ellipse(x, y, width, height, options) {
            const d = this.gen.ellipse(x, y, width, height, options);
            return this.draw(d);
        }
        circle(x, y, diameter, options) {
            const d = this.gen.circle(x, y, diameter, options);
            return this.draw(d);
        }
        linearPath(points, options) {
            const d = this.gen.linearPath(points, options);
            return this.draw(d);
        }
        polygon(points, options) {
            const d = this.gen.polygon(points, options);
            return this.draw(d);
        }
        arc(x, y, width, height, start, stop, closed = false, options) {
            const d = this.gen.arc(x, y, width, height, start, stop, closed, options);
            return this.draw(d);
        }
        curve(points, options) {
            const d = this.gen.curve(points, options);
            return this.draw(d);
        }
        path(d, options) {
            const drawing = this.gen.path(d, options);
            return this.draw(drawing);
        }
    }

    class RoughSVGAsync extends RoughSVGBase {
        constructor(svg, config) {
            super(svg);
            this.genAsync = new RoughGeneratorAsync(config || null, this.svg);
        }
        get generator() {
            return this.genAsync;
        }
        getDefaultOptions() {
            return this.genAsync.defaultOptions;
        }
        opsToPath(drawing) {
            return this.genAsync.opsToPath(drawing);
        }
        async line(x1, y1, x2, y2, options) {
            const d = await this.genAsync.line(x1, y1, x2, y2, options);
            return this.draw(d);
        }
        async rectangle(x, y, width, height, options) {
            const d = await this.genAsync.rectangle(x, y, width, height, options);
            return this.draw(d);
        }
        async ellipse(x, y, width, height, options) {
            const d = await this.genAsync.ellipse(x, y, width, height, options);
            return this.draw(d);
        }
        async circle(x, y, diameter, options) {
            const d = await this.genAsync.circle(x, y, diameter, options);
            return this.draw(d);
        }
        async linearPath(points, options) {
            const d = await this.genAsync.linearPath(points, options);
            return this.draw(d);
        }
        async polygon(points, options) {
            const d = await this.genAsync.polygon(points, options);
            return this.draw(d);
        }
        async arc(x, y, width, height, start, stop, closed = false, options) {
            const d = await this.genAsync.arc(x, y, width, height, start, stop, closed, options);
            return this.draw(d);
        }
        async curve(points, options) {
            const d = await this.genAsync.curve(points, options);
            return this.draw(d);
        }
        async path(d, options) {
            const drawing = await this.genAsync.path(d, options);
            return this.draw(drawing);
        }
    }

    var rough = {
        canvas(canvas, config) {
            if (config && config.async) {
                return new RoughCanvasAsync(canvas, config);
            }
            return new RoughCanvas(canvas, config);
        },
        svg(svg, config) {
            if (config && config.async) {
                return new RoughSVGAsync(svg, config);
            }
            return new RoughSVG(svg, config);
        },
        createRenderer() {
            return RoughCanvas.createRenderer();
        },
        generator(config, surface) {
            if (config && config.async) {
                return new RoughGeneratorAsync(config, surface);
            }
            return new RoughGenerator(config, surface);
        }
    };

    return rough;

})));

},{}]},{},[1,4,5]);
