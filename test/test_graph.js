// jscat test_graph.js

var mucko = require("mucko")
var Test = mucko.Test
var Base = mucko.Base
var Sys = mucko.Sys


function inbrowser_graph() {
    let println = Base.println
    var vis = require("vis")

    graph = {
        nodes: [
            {id: 1, label: 'Node 1', color: 'lime'},
            {id: 2, label: 'Node 2', group: 'student'},
            {id: 3, label: 'Node 3', group: 'student'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'},
  	  	],
  	  	edges: [
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5},
  	  	]
    }
    var nodes = new vis.DataSet(graph.nodes)
    var edges = new vis.DataSet(graph.edges)

    var container = document.getElementById('vis-network')
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        nodes: {
            font: {
                size: 30,
            },
        },
        edges: {
            width: 5,
        },
        groups: {
            student: {
                color: {
                    background: 'red',
                },
                shape: 'diamond',
            },
        },
        autoResize: true,
        width: '600',
        height: '200',
        interaction: {
            zoomView: false,
        }
    }
    var network = new vis.Network(container, data, options)
}


Test.test_graph = function () {
    if (Sys.isbrowser()) {
        inbrowser_graph()
    }
}
