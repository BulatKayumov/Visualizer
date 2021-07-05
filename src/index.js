"use strict"
var graph = require('./graph');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcRenderer;
const path = require('path');
const url = require('url');
const d3 = require('d3')

const createGraphBtn = document.getElementById('createGraphBtn')
createGraphBtn.addEventListener('click', function(){
  ShowImportGraphModal();
})

const removeGraphBtn = document.getElementById('removeGraphBtn')
removeGraphBtn.addEventListener('click', function(){
  ipc.send('removeGraphBtnClicked')
})

function ShowRemoveButton() {
  removeGraphBtn.setAttribute("style", "display:block")
}

function HideRemoveButton() {
  removeGraphBtn.setAttribute("style", "display:none")
}

const settingsBtn = document.getElementById('settingsBtn')
settingsBtn.addEventListener('click', function(){
  ShowSettingsModal(structureType, false)
})

function ShowSettingsButton() {
  settingsBtn.setAttribute("style", "display:block")
}

function HideSettingsButton() {
  settingsBtn.setAttribute("style", "display:none")
}

const fileText = document.getElementById('fileText')

const inputElement = document.getElementById("file-upload");
inputElement.addEventListener("change", handleFiles, false);

var file;

function handleFiles() {
  const fileList = this.files;
  file = fileList[0];
  fileText.innerHTML = file.name;
}

const importGraphModal = document.getElementById("importGraphModal");

function ShowImportGraphModal(){
  importGraphModal.setAttribute("style", "display:block");
}

function HideImportGraphModal(){
  importGraphModal.setAttribute("style", "display:none");
}

const settingsModal = document.getElementById("settingsModal");

var structureType;

function ShowSettingsModal(structure, defaultValue){
  let options;
  structureType = structure;
  if(structureType == "Tree"){
    options = treeMethods;
  }
  if(structureType == "DAG"){
    options = dagMethods;
  }

  for(let i = 0; i < options.length; i++){
    methodsSelect.options[i] = options[i];
  }

  for(let i = options.length; i < methodsSelect.options.length; i++){
    methodsSelect.options[i] = null;
  }

  console.log(methodsSelect.options);
  if(defaultValue){
    nodeWidthInput.value = defaultNodeWidth;
    nodeWidthInputRange.value = defaultNodeWidth;
    nodeHeightInput.value = defaultNodeHeight;
    nodeHeightInputRange.value = defaultNodeHeight;
    horizontalSpacingInput.value = defaultHorizontalSpacing;
    horizontalSpacingInputRange.value = defaultHorizontalSpacing;
    verticalSpacingInput.value = defaultVerticalSpacing;
    verticalSpacingInputRange.value = defaultVerticalSpacing;
  }
  settingsModal.setAttribute("style", "display:block");
}

function HideSettingsModal(){
  settingsModal.setAttribute("style", "display:none");
}

const importBtn = document.getElementById("importButton");
importBtn.addEventListener('click', function(){
  graph.RecognizeStructure(file.name);
})

const closeImportBtn = document.getElementById("closeImportButton");
closeImportBtn.addEventListener('click', function(){
  HideImportGraphModal();
})

const applySettingsBtn = document.getElementById("applySettingsButton");
applySettingsBtn.addEventListener('click', function(){
  graph.DrawGraph(methodsSelect.value, parseInt(nodeWidthInput.value), parseInt(nodeHeightInput.value), parseInt(horizontalSpacingInput.value), parseInt(verticalSpacingInput.value));
  HideSettingsModal();
  ShowRemoveButton();
  ShowSettingsButton();
})

const closeSettingsBtn = document.getElementById("closeSettingsButton");
closeSettingsBtn.addEventListener('click', function(){
  HideSettingsModal();
})

var minNodeWidth = 400;
var maxNodeWidth = 2000;
var minNodeHeight = 150;
var maxNodeHeight = 1000;
var minHorizontalSpacing = 0;
var maxHorizontalSpacing = 2000;
var minVerticalSpacing = 0;
var maxVerticalSpacing = 2000;

const defaultNodeWidth = 400;
const defaultNodeHeight = 170;
const defaultHorizontalSpacing = 500;
const defaultVerticalSpacing = 300;

const nodeWidthInput = document.getElementById("nodeWidth");
nodeWidth.oninput = function() {
  nodeWidthInputRange.value = nodeWidthInput.value;
}
nodeWidthInput.onchange = function() {
  if(nodeWidthInput.value < minNodeWidth){
    nodeWidthInput.value = minNodeWidth;
  }
  if(nodeWidthInput.value > maxNodeWidth){
    nodeWidthInput.value = maxNodeWidth;
  }
}

const nodeWidthInputRange = document.getElementById("nodeWidthRange");
nodeWidthInputRange.oninput = function() {
  nodeWidthInput.value = nodeWidthInputRange.value;
}

const nodeHeightInput = document.getElementById("nodeHeight");
nodeHeight.oninput = function() {
  nodeHeightInputRange.value = nodeHeightInput.value;
}
nodeHeightInput.onchange = function() {
  if(nodeHeightInput.value < minNodeHeight){
    nodeHeightInput.value = minNodeHeight;
  }
  if(nodeHeightInput.value > maxNodeHeight){
    nodeHeightInput.value = maxNodeHeight;
  }
}

const nodeHeightInputRange = document.getElementById("nodeHeightRange");
nodeHeightInputRange.oninput = function() {
  nodeHeightInput.value = nodeHeightInputRange.value;
}

const horizontalSpacingInput = document.getElementById("horizontalSpacing");
horizontalSpacing.oninput = function() {
  horizontalSpacingInputRange.value = horizontalSpacingInput.value;
}
horizontalSpacingInput.onchange = function() {
  if(horizontalSpacingInput.value < minHorizontalSpacing){
    horizontalSpacingInput.value = minHorizontalSpacing;
  }
  if(horizontalSpacingInput.value > maxHorizontalSpacing){
    horizontalSpacingInput.value = maxHorizontalSpacing;
  }
}

const horizontalSpacingInputRange = document.getElementById("horizontalSpacingRange");
horizontalSpacingInputRange.oninput = function() {
  horizontalSpacingInput.value = horizontalSpacingInputRange.value;
}

const verticalSpacingInput = document.getElementById("verticalSpacing");
verticalSpacing.oninput = function() {
  verticalSpacingInputRange.value = verticalSpacingInput.value;
}
verticalSpacingInput.onchange = function() {
  if(verticalSpacingInput.value < minVerticalSpacing){
    verticalSpacingInput.value = minVerticalSpacing;
  }
  if(verticalSpacingInput.value > maxVerticalSpacing){
    verticalSpacingInput.value = maxVerticalSpacing;
  }
}

const verticalSpacingInputRange = document.getElementById("verticalSpacingRange");
verticalSpacingInputRange.oninput = function() {
  verticalSpacingInput.value = verticalSpacingInputRange.value;
}

var dagMethods = [new Option("Barycenters", "Barycenters"),
                  new Option("Clusters", "Clusters"),
                  new Option("Equal Distribution", "Equal Distribution"),
                  new Option("Force Simulation", "Force Simulation")];

var treeMethods = [new Option("Tidy", "Tidy"),
                  new Option("Clusters", "Clusters")];

const methodsSelect = document.getElementById("selectMethod");

ipc.on('graph-recognized', function(event, arg) {
  HideImportGraphModal();
  ShowSettingsModal(arg, true);
})

ipc.on('removeGraph', function (event) {
  graph.RemoveGraph();
  HideRemoveButton();
  HideSettingsButton();
})

window.onscroll = function() {
            window.scrollTo(0, 0);
        };
