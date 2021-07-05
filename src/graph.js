var d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6', '');
var $ = require('jquery');
var tree = require('./tree');
var DAG = require('./DAG');
const electron = require('electron');
const ipc = electron.ipcRenderer;

var currentGraphClass;
var graphData;

const defaultParameters = ["id", "nodes", "name", "nextNodes", "children", "x", "y", "nestedScenario"];

var info;

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

function SaveInfoTree(root) {
  let keys = Object.keys(root);
  keys.forEach((key) => {
    if(!defaultParameters.includes(key)){
      info.add(key);
    }
  });
  if(root.children != null){
    root.children.forEach((child) => {
      SaveInfoTree(child);
    });
  }
}

function SaveInfoDAG(data) {
  data.nodes.forEach((node) => {
    let keys = Object.keys(node);
    keys.forEach((key) => {
      if(!defaultParameters.includes(key)){
        info.add(key);
      }
    });
  });
}

function RemoveGraph(){
  if(currentGraphClass != null){
    currentGraphClass.RemoveGraph();
  }
}

function RecognizeStructure(file){
  d3.json(file)
  .then(data => {
    console.log("DATA", data);
    if(data.children != null){
      info = new Set();
      SaveInfoTree(data);
      console.log("INFO", info);
      currentGraphClass = tree;
      graphData = data;
      ipc.send('graph-recognized-tree');
    }
    if(data.nodes != null){
      info = new Set();
      SaveInfoDAG(data);
      console.log("INFO", info);
      currentGraphClass = DAG;
      graphData = data;
      ipc.send('graph-recognized-DAG');
    }
  });
}

function DrawGraph(method, nodeWidth, nodeHeight, nodeYSpacing, nodeXSpacing){
  currentGraphClass.DrawGraph(graphData, new Options(method, nodeWidth, nodeHeight, nodeXSpacing, nodeYSpacing), info);
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
