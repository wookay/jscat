if ('undefined' != typeof(require)) {
  require.paths.unshift('../jscat')
  require('UnitTest')
}

function draw_diamond(n) {
  return ""
}

function draw_pyramid(n) {
  return ""
}

function draw_inverted_pyramid(n) {
  return ""
}

function draw_left_aligned_triangle(n) {
  return ""
}

function draw_right_aligned_triangle(n) {
  return ""
}



Test.test_draw_diamond = function() {
  assert_equal("\
 * \n\
***\n\
 * ", draw_diamond(3))
}

Test.test_draw_pyramid = function() {
  assert_equal("\
  *  \n\
 *** \n\
*****", draw_pyramid(3))
}

Test.test_draw_inverted_pyramid = function() {
  assert_equal("\
*****\n\
 *** \n\
  *  ", draw_inverted_pyramid(3))
}

Test.test_draw_left_aligned_triangle = function() {
  assert_equal("\
* \n\
**\n\
***", draw_left_aligned_triangle(3))
}

Test.test_draw_right_aligned_triangle = function() {
  assert_equal("\
  *\n\
 **\n\
***", draw_right_aligned_triangle(3))
}

UnitTest.run(Test)
