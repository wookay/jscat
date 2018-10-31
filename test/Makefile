bundle:
	browserify -r mucko ../index.js test_canvas.js > deps/bundle.js
	date '+%Y-%m-%d %H:%M:%S' > deps/browserified_at

test:
	node runtests.js

canvas:
	node -e 'require("./test_canvas.js"); UnitTest.run(Test)'

3d:
	node -e 'require("./test_3d.js"); UnitTest.run(Test)'
