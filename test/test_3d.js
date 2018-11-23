// jscat test_3d.js

var mucko = require("mucko")
var Test = mucko.Test
var Meta = mucko.Meta
var Base = mucko.Base
var Sys = mucko.Sys


// https://bl.ocks.org/niekes/293aa96c653b669ef0ca04fa4f1d5403
function inbrowser_winding_order() {
    var d3 = require("d3")
    var D3 = require("d3-3d")
    let println = Base.println
    var data = [
        [{x:0,y:-1,z: 0},{x:-1,y:1,z: 0},{x:1,y:1,z: 0}],
        [{x:0,y:-1,z:-1},{x:-1,y:1,z:-1},{x:1,y:1,z:-1}],
        [{x:0,y:-1,z:-2},{x:-1,y:1,z:-2},{x:1,y:1,z:-2}],
        [{x:0,y:-1,z:-3},{x:-1,y:1,z:-3},{x:1,y:1,z:-3}],
        [{x:0,y:-1,z:-4},{x:-1,y:1,z:-4},{x:1,y:1,z:-4}]
    ];
    var width = 600
    var height = 400
    var origin  = [260, 180]
    var svg     = d3.select('#triangles').append('svg')
        .attr("width", width)
        .attr("height", height)
        .call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
    var ccw     = true
    var color   = [d3.color('crimson'), d3.color('teal'), d3.color('limegreen'), d3.color('purple'), d3.color('tomato')];
    var alpha   = -0.3097959422289935, beta = -0.6021385919380436, mx = 260, my = 358
    var mouseX  = -69, mouseY = 71

    var _3d = D3._3d()
        .scale(100)
        .x(function(d){ return d.x; })
        .y(function(d){ return d.y; })
        .z(function(d){ return d.z; })
        .origin(origin)
        .rotateCenter([0,0,-2])
        .shape('LINE_STRIP');

    var data3D = _3d(data);

    function dragStart(){
        mx = d3.event.x;
        my = d3.event.y;
    }

    function dragged(){
        mouseX = mouseX || 0;
        mouseY = mouseY || 0;
        beta   = (d3.event.x - mx + mouseX) * Math.PI / 360;
        alpha  = (d3.event.y - my + mouseY) * Math.PI / 720 * (-1);
        processData(_3d.rotateY(beta).rotateX(alpha)(data));
        // println("alpha = ", alpha, ", beta = ", beta, ", mx = ", mx, ", my = ", my)
    }

    function dragEnd(){
        mouseX = d3.event.x - mx + mouseX;
        mouseY = d3.event.y - my + mouseY;
        // println("mouseX = ", mouseX, ", mouseY = ", mouseY)
    }

    function processData(data){

        var triangles = svg.selectAll('path').data(data);

        triangles
            .enter()
            .append('path')
            .merge(triangles)
            .attr('stroke', function(d, i){
                return ccw ? color[i].brighter(1) : color[i].darker(2);
            })
            .attr('fill', function(d, i){
                return ccw ? color[i] : color[i].darker(1);
            })
            .attr('fill-opacity', 0.95)
            .sort(_3d.sort)
            .attr('d', _3d.draw);

        triangles.exit().remove();
    }

    processData(_3d.rotateY(beta).rotateX(alpha)(data3D));
    assert_true(!Meta.isundef(D3._3d))
}

Test.test_3d = function () {
    if (Sys.isbrowser()) {
        inbrowser_winding_order()
    } else {
        var D3 = require("d3-3d")
        assert_true(!Meta.isundef(D3._3d))
    }
}
