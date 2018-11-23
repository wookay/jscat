// jscat test_roughjs.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base
var rough = require("roughjs")


function inbrowser_roughjs() {
    let println = Base.println
    svg = document.getElementsByTagName('svg')[0]
    const rc = rough.svg(svg)

    node = rc.rectangle(10, 10, 200, 200, {
        fill: "rgba(10,100,10,0.5)",
        fillWeight: 3,
        hachureGap: 8,
    })
    svg.prepend(node)

    node = rc.circle(260, 50, 80, {
        fill: "rgba(150,50,10,0.5)",
        fillWeight: 1.5, // thicker lines for hachure
        fillStyle: 'cross-hatch',
        stroke: 'green',
        strokeWidth: 1.5,
    })
    svg.prepend(node)

    points = []
    for (let i = 0; i < 20; i++) {
        let x = (400 / 20) * i + 100
        let xdeg = (Math.PI / 100) * x
        let y = Math.round(Math.sin(xdeg) * 90) + 120
        points.push([x, y])
    }
    node = rc.curve(points, {
        stroke: 'green',
        strokeWidth: 3,
    })
    svg.prepend(node)

    let gen = rc.generator
    let rect1 = gen.rectangle(350, 10, 100, 100, {
        fill: 'gray',
        fillStyle: 'cross-hatch',
        stroke: 'green',
        strokeWidth: 1.5,
        hachureAngle: 90, // angle of hachure,
    })
    let rect2 = gen.rectangle(350, 120, 100, 100, {
        fill: 'red',
        fillWeight: 3,
        hachureAngle: 60, // angle of hachure,
        hachureGap: 8,
    })
    node = rc.draw(rect1)
    svg.prepend(node)
    node = rc.draw(rect2)
    svg.prepend(node)

    node = rc.arc(530, 90, 100, 100, Math.PI * 1.1, Math.PI * 1.8, true, {
        fill: 'orange',
        stroke: 'gray',
    })
    svg.prepend(node)
    node = rc.arc(530, 90, 100, 100, Math.PI * 0.3, Math.PI * 1.1, true, {
        fill: 'purple',
        stroke: 'gray',
    })
    svg.prepend(node)
    node = rc.arc(530, 90, 100, 100, -Math.PI * 0.2, Math.PI * 0.3, true, {
        fill: 'blue',
        stroke: 'gray',
    })
    svg.prepend(node)

    node = rc.linearPath([[490, 200], [520, 150], [550, 180], [590, 150]], {
        stroke: 'blue',
        strokeWidth: 2,
    })
    svg.prepend(node)
}

Test.test_roughjs = function () {
    if (Sys.isbrowser()) {
        inbrowser_roughjs()
    }
}
