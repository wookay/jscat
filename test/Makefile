bundle:
	browserify -r mucko -r bootstrap-slider -r roughjs ../index.js test_canvas.js test_slider.js > deps/bundle.js
	date '+%Y-%m-%d %H:%M:%S' > deps/browserified_at

test:
	node runtests.js

canvas:
	node -e 'require("./test_canvas.js"); UnitTest.run(Test)'

slider:
	node -e 'require("./test_slider.js"); UnitTest.run(Test)'

3d:
	node -e 'require("./test_3d.js"); UnitTest.run(Test)'

waveform:
	node -e 'require("./test_waveform.js"); UnitTest.run(Test)'

roughjs:
	node -r roughjs -e 'require("./test_roughjs.js"); UnitTest.run(Test)'
