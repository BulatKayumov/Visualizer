var d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6', '');
var $ = require('jquery');
var tree = require('./tree');
var DAG = require('./DAG');
const electron = require('electron');
const ipc = electron.ipcRenderer;

var currentGraphClass;
var graphData;

class Options{
  method;
  nodeWidth;
  nodeHeight;
  nodeXSpacing;
  nodeYSpacing;

  constructor(method, nodeWidth, nodeHeight, nodeXSpacing, nodeYSpacing){
    this.method = method;
    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;
    this.nodeXSpacing = nodeXSpacing;
    this.nodeYSpacing = nodeYSpacing;
  }
}

function RemoveGraph(){
  if(currentGraphClass != null){
    currentGraphClass.RemoveGraph();
  }
}

function RecognizeStructure(file){
  d3.json(file)
  .then(data => {
    if(data.children != null){
      currentGraphClass = tree;
      graphData = data;
      ipc.send('graph-recognized-tree');
    }
    if(data.nodes != null){
      currentGraphClass = DAG;
      graphData = data;
      ipc.send('graph-recognized-DAG');
    }
  });
}

function DrawGraph(method, nodeWidth, nodeHeight, nodeYSpacing, nodeXSpacing){
  currentGraphClass.DrawGraph(graphData, new Options(method, nodeWidth, nodeHeight, nodeXSpacing, nodeYSpacing));
}

function ExportGraph(){
  if(currentGraphClass != null){
    currentGraphClass.ExportGraph();
  }
}

module.exports = {
  RecognizeStructure: RecognizeStructure,
  DrawGraph: DrawGraph,
  RemoveGraph: RemoveGraph,
  ExportGraph: ExportGraph
};
