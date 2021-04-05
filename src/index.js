var graph = require('./graph');
var tree = require('./tree');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcRenderer;
const path = require('path');
const url = require('url');
const d3 = require('d3')

// const createTreeBtn = document.getElementById('createTreeBtn')
// createTreeBtn.addEventListener('click', function(){
//   ipc.send('createTreeBtnClicked')
// })
//
// const removeTreeBtn = document.getElementById('removeTreeBtn')
// removeTreeBtn.addEventListener('click', function(){
//   ipc.send('removeTreeBtnClicked')
// })

// const exportTreeBtn = document.getElementById('exportTreeBtn')
// exportTreeBtn.addEventListener('click', function(){
//   ipc.send('exportTreeBtnClicked')
// })

const createGraphBtn = document.getElementById('createGraphBtn')
createGraphBtn.addEventListener('click', function(){
  ipc.send('createGraphBtnClicked')
})

const removeGraphBtn = document.getElementById('removeGraphBtn')
removeGraphBtn.addEventListener('click', function(){
  ipc.send('removeGraphBtnClicked')
})

// const exportGraphBtn = document.getElementById('exportTreeBtn')
// exportGraphBtn.addEventListener('click', function(){
//   ipc.send('exportGraphBtnClicked')
// })

ipc.on('tree-create-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('tree-remove-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('tree-export-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('graph-create-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('graph-remove-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('graph-export-button-clicked', function(event, arg){
  console.log(arg)
})

ipc.on('createTree', function(){
  tree.drawTree()
})

ipc.on('removeTree', function(){
  tree.removeTree()
})

ipc.on('exportTree', function(){
  tree.exportTree()
})

ipc.on('createGraph', function(){
  graph.drawGraph()
})

ipc.on('removeGraph', function(){
  graph.removeGraph()
})

ipc.on('exportGraph', function(){
  graph.exportGraph()
})

window.onscroll = function() {
            window.scrollTo(0, 0);
        };
