bundle:
	browserify -r mucko -r nouislider -r roughjs -r d3 -r d3-3d -r vis > deps/bundle.js
	date '+%Y-%m-%d %H:%M:%S' > deps/browserified_at

test:
	node runtests.js

canvas:
	node -e 'require("./test_canvas.js"); UnitTest.run(Test)'

slider:
	node -r nouislider -e 'require("./test_slider.js"); UnitTest.run(Test)'

3d:
	node -r d3 -r d3-3d -e 'require("./test_3d.js"); UnitTest.run(Test)'

waveform:
	node -e 'require("./test_waveform.js"); UnitTest.run(Test)'

roughjs:
	node -r roughjs -e 'require("./test_roughjs.js"); UnitTest.run(Test)'

graph:
	node -r vis -e 'require("./test_graph.js"); UnitTest.run(Test)'

knob:
	node -e 'require("./test_knob.js"); UnitTest.run(Test)'
