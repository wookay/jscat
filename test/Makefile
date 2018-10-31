bundle:
	browserify -r mucko ../index.js runtests.js > deps/bundle.js
	date '+%Y-%m-%d %H:%M:%S' > deps/browserified

test:
	node runtests.js

canvas:
	node -e 'require("./test_canvas.js"); UnitTest.run(Test)'
