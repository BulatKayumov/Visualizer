"use strict";
const d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6', '');
const d3plus = require('d3plus');
const $ = require('jquery');

class Node{
  name = "Node";
  info = [];
  text = "";
  description = "Description";
  nextNodes = [];
  prevNodes = [];
  depth = 0;
  x = 0;
  y = 0;
  dy;
  type = "simple";
  color = "#888";
  influentedNodes = [];
  influencingNodes = [];
  parentCluster;
  cluster;
  _nodesCount;
  groupIndex;

  instantiate(node){
    this.id = node.id;
    this.name = node.name;
    this.nextNodes = node.nextNodes;
    this.info = new Map();

    let keys = Object.keys(node);

    if(keys.includes("nestedScenario")){
      this.nestedScenario = node.nestedScenario;
      this.type = "nested";
    }

    keys.forEach((key) => {
      if(info.has(key) && node[key] !== undefined && node[key] != null){
        this.info.set(key, node[key]);
      }
    });

    let str = "";
    for (var [key, value] of this.info) {

      str += key[0].toUpperCase() + key.slice(1) + ": ";
      if(typeof value !== 'object'){
       str += value + "\n";
      }
      else {
        if(Symbol.iterator in Object(value)){
          for(let elem of value){
            str += elem + ", ";
          }
          str = str.slice(0, str.length - 2) + "\n";
        }
        else {
          str += value[Object.keys(value)[0]] + "\n";
        }
      }
    }
    this.text = str.slice(0, str.length - 1);
  }

  setNextNodes(){
    let nextNodesArray = [];
    this.nextNodes.forEach((nextNodeId) => {
      nextNodesArray.push(nodes.find(function(element, index, array){
        return element.id == nextNodeId;
      }))
    });
    this.nextNodes = nextNodesArray;
  }
}

class Group{
  depth;
  nodes;

  constructor(depth){
    this.depth = depth;
    this.nodes = [];
  }

  addNode(node){
    this.nodes.push(node);
  }

  move(x){
    this.nodes.forEach((node) => {
      node.x += x;
    });

  }
}

class ClusterGroup{
  depth;
  clusters;

  constructor(depth){
    this.depth = depth;
    this.clusters = [];
  }

  addCluster(cluster){
    this.clusters.push(node);
  }
}

class Influence{
  from = null;
  to = null;
  percent = 0;

  constructor(from, to, percent){
    this.from = from;
    this.to = to;
    this.percent = percent;
  }
}

class Cluster{
  id;
  root;
  x;
  _height;
  globalX = 0;
  minNeighDistX = 0;
  _maxDepth;
  parent;
  children = [];
  groups = [];
  path = [];
  depths = [];
  topClusters;
  botClusters;
  neighbours = [];
  topValue = 0;
  botValue = 0;
  groupIndex;

  constructor(root, minNeighDistX){
    this.root = root;
    this.minNeighDistX = minNeighDistX;
    _clusters.unshift(this);
  }

  AddChild(cluster){
    cluster.minNeighDistX = this.minNeighDistX;
    cluster.parent = this;
    this.children.push(cluster);
  }

  SetGlobalPosX(x){
    this.root.x = x + this.x;
    this.globalX = x + this.x;
    this.children.forEach((child) => {
      child.SetGlobalPosX(this.root.x);
    });

  }

  SetGroups(){
    this.groups = [];
    if(this.children.length > 0){

      for (let i = this.root.depth + 1; i <= this.maxDepth; i++){
        let group = new ClusterGroup(i);

        this.children.forEach((child) => {
          if(child.root.depth <= i && child.maxDepth >= i){
            group.clusters.push(child);
          }
        });

        this.groups.push(group);
      }

      this.children.forEach((child) => {
        child.SetGroups();
      });
    }
  }

  SetNeighs(){
    this.children.forEach((child) => {
      child.topClusters = new Set();
      child.botClusters = new Set();
      child.topNeighs = new Set();
      child.botNeighs = new Set();
    });

    this.groups.forEach((group) => {
      group.clusters.forEach((cluster, i) => {
        for(let j = 0; j < i; j++){
          cluster.topClusters.add(group.clusters[j]);
        }
        for(let j = i + 1; j < group.clusters.length; j++){
          cluster.botClusters.add(group.clusters[j]);
        }

        if(i != 0){
          cluster.topNeighs.add(group.clusters[i - 1]);
        }
        if(i != group.clusters.length - 1){
          cluster.botNeighs.add(group.clusters[i + 1]);
        }
      });

    });

  }

  SetClustersPositions(){
    if(this.children.length > 0){
      this.children.forEach((child) => {
        child.SetClustersPositions();
      });
      this.SetNeighs();

      if(this.groups[0].clusters.length > 0){
        let height = 0;
        this.groups[0].clusters.forEach((cluster) => {
          height += cluster.height;
        });

        let currX = height / -2;
        this.groups[0].clusters.forEach((cluster) => {
          currX += cluster.height / 2;
          cluster.x = currX;
          currX += cluster.height / 2;
        });

        this._height = height;
      }

      this.groups.forEach((group, i) => {
        if(i > 0){
          let m_group = [];
          let topCluster = undefined;
          group.clusters.forEach((cluster) => {
            if(cluster.root.depth == group.depth){
              m_group.push(cluster);
            } else {
              if(m_group.length > 0){
                let height = 0;
                m_group.forEach((m_cluster) => {
                  height += m_cluster.height;
                });

                if(topCluster === undefined){
                  let center = (this.height / -2 + cluster.topEdge) / 2;
                  let currX = center - height / 2;
                  m_group.forEach((m_cluster) => {
                    currX += m_cluster.height / 2;
                    m_cluster.x = currX;
                    currX += m_cluster.height / 2;
                  });
                  if(cluster.topEdge < currX){
                    cluster.Move(currX - cluster.topEdge);
                  }
                }
                else {
                  let center = (topCluster.botEdge + cluster.topEdge) / 2;
                  let currX = center - height / 2;
                  m_group.forEach((m_cluster) => {
                    currX += m_cluster.height / 2;
                    m_cluster.x = currX;
                    currX += m_cluster.height / 2;
                  });

                  let diff = center - height / 2 - topCluster.botEdge;
                  if(diff < 0){
                    topCluster.Move(diff);
                  }
                  diff = center + height / 2 - cluster.topEdge;
                  if(diff > 0){
                    cluster.Move(diff);
                  }
                }
              }
              topCluster = cluster;
              m_group = [];
            }
          });

          if(m_group.length > 0){
            let height = 0;
            m_group.forEach((m_cluster) => {
              height += m_cluster.height;
            });

            if(topCluster === undefined){
              let currX = height / -2;
              m_group.forEach((m_cluster) => {
                currX += m_cluster.height / 2;
                m_cluster.x = currX;
                currX += m_cluster.height / 2;
              });
              this._height = Math.max(this.height, height);
            }
            else {
              let center = (this.height / 2 + topCluster.botEdge) / 2
              let currX = center - height / 2;
              m_group.forEach((m_cluster) => {
                currX += m_cluster.height / 2;
                m_cluster.x = currX;
                currX += m_cluster.height / 2;
              });
              if(this.height / 2 < currX){
                topCluster.Move(this.height / 2 - currX);
              }
            }
          }
        }
      });

    }
  }

  Move(x){
    this.x += x;
    if(x > 0){
      if(this.parent._height < this.botEdge * 2){
        this.parent._height = this.botEdge * 2;
      }
      this.botNeighs.forEach((neighbour) => {
        if(neighbour.x !== undefined){
          let diff = this.botEdge - neighbour.topEdge;
          if(diff > 0){
            neighbour.Move(diff);
          }
        }
      });
    }
    if(x < 0){
      if(this.parent.height < this.topEdge * -2){
        this.parent._height = this.topEdge * -2;
      }
      this.topNeighs.forEach((neighbour) => {
        if(neighbour.x !== undefined){
          let diff = this.topEdge - neighbour.botEdge;
          if(diff < 0){
            neighbour.Move(diff);
          }
        }
      });
    }
  }

  get maxDepth(){
    if(this._maxDepth === undefined){
      this._maxDepth = this.root.depth;
      if(this.children.length != 0){
        this.children.forEach((cluster) => {
          this._maxDepth = Math.max(this._maxDepth, cluster.maxDepth);
        });
      }
      return this._maxDepth;
    }
    else {
      return this._maxDepth;
    }
  }

  get height(){
    if(this._height === undefined){
      if(this.children.length == 0){
        this._height = this.minNeighDistX;
        return this._height;
      }
      this._height = 0;
      return this._height;
    }
    else {
      return this._height;
    }
  }

  get nodesCount(){
    if(nodesCount === undefined){
      this._nodesCount = 0;
      this.children.forEach(() => {
        this._nodesCount += child.nodesCount;
      });
    }
    return this._nodesCount;
  }

  get topEdge(){
    return this.x - this.height / 2;
  }

  get botEdge(){
    return this.x + this.height / 2;
  }
}

class Neighbourhood {
  neighbour;
  value;
  rate;
  clusters = [];
  constructor(cluster) {
    this.neighbour = cluster;
    this.value = 0;
    this.clusters = [];
  }

  Increase(array){
    this.value++;
    array.forEach((cluster) => {
      this.clusters.push(cluster);
    });

  }
}

const windowInnerWidth = window.innerWidth;
const windowInnerHeight = window.innerHeight;
const center = windowInnerHeight / -2;

var dataNodes;
var nodes;
var backupLinks = [];
var links;
var width;
var height;
var dx = 170;
var dy = 400;
var maxDepth;
var maxBreadth;
var nodeXSpacing = 300;
var nodeYSpacing = 500;

var backupData;

var rootCluster;
var _clusters = [];
var clustersVisualization;
var info;

const showClustersButton = document.getElementById('showClustersBtn')
showClustersButton.addEventListener('click', function(){
  ShowClusters();
  showClustersButton.setAttribute("style", "display:none")
  hideClustersButton.setAttribute("style", "display:block")
})

const hideClustersButton = document.getElementById('hideClustersBtn')
hideClustersButton.addEventListener('click', function(){
  HideClusters();
  showClustersButton.setAttribute("style", "display:block")
  hideClustersButton.setAttribute("style", "display:none")
})

const nestedBackButton = document.getElementById('nestedBackBtn')
nestedBackButton.addEventListener('click', function(){
  Back();
})

// SortingGroups
// Centering
// Clusters
// Barycenters
// Force Simulation
var method = "Clusters";

function RemoveGraph(){
  clearSVG();
  nodes = [];
  _clusters = [];
  links = [];
  backupLinks = [];
}

function DrawDAG(data, options, _info){
  info = _info;
  dataNodes = data.nodes;
  method = options.method;
  dy = options.nodeWidth;
  dx = options.nodeHeight;
  nodeXSpacing = options.nodeXSpacing;
  nodeYSpacing = options.nodeYSpacing;
  Draw();
}

function Draw(){
  RemoveGraph();
  dataNodes.forEach((dataNode) => {
    let node = new Node();
    node.instantiate(dataNode);
    nodes.push(node)
  });

  const graphChart = chart();
}

function chart(){
  if(nodes != null){

    nodes.forEach((node) => {
      node.setNextNodes();
    });

    CreatePrevNodesArray();

    nodes = TopologicalSort(nodes);

    CalculateDepths();

    maxDepth = CalculateMaxDepth(nodes);

    var groups = CreateGroups(nodes, maxDepth);

    maxBreadth = CalculateMaxBreadth(groups);

    width = dy * (maxDepth * 2 + 3);

    height = dx * (maxBreadth + 20);

    SetYPositions(groups);

    let minNeighDistX = dx + nodeXSpacing;

    CalculatePositions(groups, minNeighDistX);

    console.log(nodes);
    console.log(_clusters);
    ShowGraph();

  } else{
    console.log("null");
  }
}

function CreatePrevNodesArray(){
  nodes.forEach((node) => {
    node.nextNodes.forEach((nextNode) => {
      nextNode.prevNodes.push(node);
    });
  });
}

function CalculateDepths(){
  nodes.forEach((node) => {
    node.prevNodes.forEach((prevNode) => {
      node.depth = Math.max(prevNode.depth + 1, node.depth);
    });
  });
}

function AddFictitiousNodes(){
  nodes.forEach((node) => {
    node.nextNodes.forEach((nextNode) => {
      if(nextNode.depth - node.depth > 1){
        let prevNode = node;
        let fictitiousNode;
        for(var i = node.depth + 1; i < nextNode.depth; i++){
          fictitiousNode = new Node();
          fictitiousNode.type = "fictitious";
          fictitiousNode.color = "#333";
          fictitiousNode.depth = i;
          nodes.push(fictitiousNode);
          prevNode.nextNodes.push(fictitiousNode);
          fictitiousNode.prevNodes.push(prevNode);
          prevNode = fictitiousNode;
        }
        fictitiousNode.nextNodes.push(nextNode);
        nextNode.prevNodes.push(fictitiousNode);
        backupLinks.push(Object.create({
          prevNode: node,
          nextNode: nextNode
        }));
      }
    });
    for(let i = 0; i < node.nextNodes.length; i++){
      let nextNode = node.nextNodes[i];
      if(nextNode.depth - node.depth > 1){
        node.nextNodes.splice(node.nextNodes.indexOf(nextNode), 1);
        i--;
        nextNode.prevNodes.splice(nextNode.prevNodes.indexOf(node), 1);
      }
    }

  });
}

function DeleteFictitiousNodes(){
  for(let i = 0; i < nodes.length; i++){
    let node = nodes[i];
    if(node.type == "fictitious"){
      nodes.splice(i, 1);
      i--;
    }
    else {
      for(let j = 0; j < node.prevNodes.length; j++){
        if(node.prevNodes[j].type == "fictitious"){
          node.prevNodes.splice(j, 1);
          j--;
        }
      }
      for(let j = 0; j < node.nextNodes.length; j++){
        if(node.nextNodes[j].type == "fictitious"){
          node.nextNodes.splice(j, 1);
          j--;
        }
      }
    }
  }

  backupLinks.forEach((link) => {
    link.prevNode.nextNodes.push(link.nextNode);
    link.nextNode.prevNodes.push(link.prevNode);
  });

  backupLinks = [];
}

function TopologicalSort(nodes){
  nodes.forEach((node) => {
    Object.defineProperties(node, {
      colour: {
        value: "white",
        enumerable: true,
        writable: true,
        configurable: true
      }
    });
  });
  let black = [];
  nodes.forEach((node) => {
    if(!Step(node, black)){
      console.error("Found cycle");
      return;
    }
  });

  black.forEach((node) => {
    delete node.colour;
  });

  return black;
}

function Step(node, black){
  if(node.colour == "black"){
    return true;
  }
  if(node.colour == "grey"){
    return false;
  }
  node.colour = "grey";
  node.nextNodes.forEach((nextNode) => {
    Step(nextNode, black)
  });
  node.colour = "black";
  black.unshift(node);
  return true;
}

function ChangeOrientation(node, nextNode) {

}

function CalculateMaxDepth(nodes) {
  let maxDepth = 0;
  nodes.forEach((node) => {
    if(node.depth > maxDepth){
      maxDepth = node.depth;
    }
  });
  return maxDepth
}

function CreateGroups(nodes, maxDepth){
  let groups = []
  for(var i = 0; i <= maxDepth; i++){
    groups.push(new Group(i));
  }

  groups.forEach((group) => {
    nodes.forEach((node) => {
      if(node.depth == group.depth){
        group.addNode(node);
      }
    });
  });
  return groups;
}

function CalculateMaxBreadth(groups) {
  let maxBreadth = 0;

  groups.forEach((group) => {
    if(group.nodes.length > maxBreadth){
      maxBreadth = group.nodes.length;
    }
  });
  return maxBreadth;
}

function SetYPositions(groups){
  let currY = dy;
  groups.forEach((group) => {
    group.nodes.forEach((node) => {
      node.y = currY;
    });
    currY += dy + nodeYSpacing;
  });
}

function CalculatePositions(groups, minNeighDistX) {
  switch (method) {
    case "SortingGroups":
      SortingGroupsMethod(groups, minNeighDistX);
      break;
    case "Clusters":
      ClustersMethod(groups, minNeighDistX);
      break;
    case "Barycenters":
      BarycentersMethod(groups, minNeighDistX);
      break;
    case "Equal Distribution":
      CenteringMethod(groups, minNeighDistX);
      break;
    case "Force Simulation":
      ForceSimulationMethod(groups, minNeighDistX);
      break;
    default:
      console.error(method, "Is Wrong Calculate Positions Method");
  }
}

function CenteringMethod(groups, minNeighDistX){
  BM_SortNodesInGroups(groups);
  BM_SetPreliminaryXPositions(groups, minNeighDistX);
}

function BarycentersMethod(groups, minNeighDistX){
  BM_SortNodesInGroups(groups);
  BM_SetPreliminaryXPositions(groups, minNeighDistX);
  let count = 1;
  for(let i = 0; i < count; i++){
    BM_SetXPositionsIncrease(groups, minNeighDistX, i);
    BM_SetXPositionsDecrease(groups, minNeighDistX, i);
    MoveRoot(groups);
  }
}

function BM_SortNodesInGroups(groups){
  groups.forEach((group, i) => {
    if(i > 0){
      group.nodes.sort(function(a, b){
        let aRate = 0;
        let bRate = 0;
        a.prevNodes.forEach((aPrevNode) => {
          b.prevNodes.forEach((bPrevNode) => {
            if(aPrevNode.groupIndex < bPrevNode.groupIndex){
              bRate++;
            }
            if(aPrevNode.groupIndex > bPrevNode.groupIndex){
              aRate++;
            }
          });
        });
        return aRate - bRate;
      });
    }

    group.nodes.forEach((node, i) => {
      node.groupIndex = i;
    });
  });

}

function BM_SetPreliminaryXPositions(groups, minNeighDistX){
  groups.forEach((group) => {
    DistributeNodes(0, group.nodes, minNeighDistX);
  });
}

function BM_SetXPositionsIncrease(groups, minNeighDistX, index){
  groups.forEach((group) => {
    group.nodes.forEach((node) => {
      if(index == 0){
        if(node.prevNodes.length >= node.nextNodes.length){
          node.x = AverageX(node.prevNodes);
        }
      }
      else {
        if(node.prevNodes.length > node.nextNodes.length){
          node.x = AverageX(node.prevNodes);
        }
        else {
          node.x = AverageX(node.prevNodes.concat(node.nextNodes));
        }
      }
    });

    let median = group.nodes[0].x;
    let medianNodes = [];
    group.nodes.forEach((node) => {
      if(Math.abs(node.x) < Math.abs(median)){
        median = node.x;
        medianNodes = [];
      }
      if(node.x == median){
        medianNodes.push(node);
      }
    });

    let preMedianNodes = []
    let upperMedianNodes = [];

    group.nodes.forEach((node) => {
      if(node.x < median){
        preMedianNodes.push(node);
      }
      if(node.x > median){
        upperMedianNodes.push(node);
      }
    });

    DistributeNodes(median, medianNodes, minNeighDistX)

    if(preMedianNodes.length > 0){
      DistributeNodesGroups(preMedianNodes, minNeighDistX);
    }

    if(upperMedianNodes.length > 0){
      DistributeNodesGroups(upperMedianNodes, minNeighDistX);
    }

    let topEdge = medianNodes[0].x;
    let botEdge = medianNodes[medianNodes.length - 1].x;
    preMedianNodes.reverse();

    preMedianNodes.forEach((node) => {
      if(node.x > topEdge - minNeighDistX){
        node.x = topEdge - minNeighDistX;
      }
      topEdge = node.x;
    });

    upperMedianNodes.forEach((node) => {
      if(node.x < botEdge + minNeighDistX){
        node.x = botEdge + minNeighDistX;
      }
      botEdge = node.x;
    });

  });

}

function BM_SetXPositionsDecrease(groups, minNeighDistX, index){
  var reverseGroups = groups.slice();
  reverseGroups.reverse();
  reverseGroups.forEach((group) => {
    group.nodes.forEach((node) => {
      if(index == 0){
        if(node.nextNodes.length >= node.prevNodes.length){
          node.x = AverageX(node.nextNodes);
        }
      }
      else {
        if(node.nextNodes.length > node.prevNodes.length){
          node.x = AverageX(node.nextNodes);
        }
        else {
          node.x = AverageX(node.nextNodes.concat(node.prevNodes));
        }
      }
    });

    let median = group.nodes[0].x;
    let medianNodes = [];
    group.nodes.forEach((node) => {
      if(Math.abs(node.x) < Math.abs(median)){
        median = node.x;
        medianNodes = [];
      }
      if(node.x == median){
        medianNodes.push(node);
      }
    });

    let preMedianNodes = []
    let upperMedianNodes = [];

    group.nodes.forEach((node) => {
      if(node.x < median){
        preMedianNodes.push(node);
      }
      if(node.x > median){
        upperMedianNodes.push(node);
      }
    });

    DistributeNodes(median, medianNodes, minNeighDistX)

    if(preMedianNodes.length > 0){
      DistributeNodesGroups(preMedianNodes, minNeighDistX);
    }

    if(upperMedianNodes.length > 0){
      DistributeNodesGroups(upperMedianNodes, minNeighDistX);
    }

    let topEdge = medianNodes[0].x;
    let botEdge = medianNodes[medianNodes.length - 1].x;
    preMedianNodes.reverse();

    preMedianNodes.forEach((node) => {
      if(node.x > topEdge - minNeighDistX){
        node.x = topEdge - minNeighDistX;
      }
      topEdge = node.x;
    });

    upperMedianNodes.forEach((node) => {
      if(node.x < botEdge + minNeighDistX){
        node.x = botEdge + minNeighDistX;
      }
      botEdge = node.x;
    });

  });

}

function MoveRoot(groups){
  let dist = -AverageX(groups[0].nodes);
  groups.forEach((group) => {
    group.move(dist);
  });
}

function AverageX(nodes) {
  let xSum = 0;
  nodes.forEach((node) => {
    xSum += node.x;
  });
  return xSum / nodes.length;
}

function DistributeNodes(center, nodes, minNeighDistX){
  let currX = center - (nodes.length - 1) * minNeighDistX / 2;
  nodes.forEach((node) => {
    node.x = currX;
    currX += minNeighDistX;
  });
}

function DistributeNodesGroups(nodes, minNeighDistX){
  let group = [];
  let median = nodes[0].x;
  nodes.forEach((node) => {
    if(node.x == median){
      group.push(node);
    }
    else {
      DistributeNodes(median, group, minNeighDistX);
      group = [];
      group.push(node);
      median = node.x;
    }
  });
  DistributeNodes(median, group, minNeighDistX);
}

function SortingGroupsMethod(groups, minNeighDistX){
  let sortedGroups = groups.map(d => Object.create({
    nodes: d.nodes,
    prevGroup: null,
    nextGroup: null
  }));

  sortedGroups.forEach((group, i) => {
    if(i != 0){
      group.prevGroup = sortedGroups[i - 1];
    }
    if(i != sortedGroups.length - 1){
      group.nextGroup = sortedGroups[i + 1];
    }
  });

  sortedGroups.sort(function(a, b){
    return b.nodes.length - a.nodes.length;
  });

  sortedGroups.forEach((group) => {
    group.nodes.forEach((node) => {
      Object.defineProperty(node, "groupBreadth", {
        value: group.nodes.length,
        writable: true
      });
    });
  });

  sortedGroups.forEach((group) => {
    group.nodes.forEach((node) => {
      let xSum = 0;
      let count = 0;
      node.nextNodes.forEach((nextNode) => {
        if(nextNode.groupBreadth >= node.groupBreadth){
          xSum += nextNode.x;
          count += 1;
        }
      });
      node.prevNodes.forEach((prevNode) => {
        if(prevNode.groupBreadth >= node.groupBreadth){
          xSum += prevNode.x;
          count += 1;
        }
      });
      if (count > 0) {
      AverageX = xSum / count;
      node.x = AverageX;
      }
    });
    for(var i = 0; i < group.nodes.length - 1; i++){
      AverageX = group.nodes[i].x;
      let count = 1;
      let firstIndex = i;
      let lastIndex = i;
      let limit = 500;
      while(limit > 0){
        limit--;
        if(limit == 0){
          console.error("Limit");
        }
        if(lastIndex != group.nodes.length - 1 && AverageX - group.nodes[lastIndex + 1].x < minNeighDistX * (0.5 + count * 0.5)){
          lastIndex++;
          count++;
          AverageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
          continue;
        }
        if(firstIndex != 0 && group.nodes[firstIndex - 1].x - AverageX < minNeighDistX * (0.5 + count * 0.5)){
          firstIndex--;
          count++;
          AverageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
          continue;
        }
        break;
      }
      let totalX = AverageX + (minNeighDistX * ((count - 1) * 0.5));
      for(let q = firstIndex; q <= lastIndex; q++){
          group.nodes[q].x = totalX;
          totalX -= minNeighDistX;
      }
    }
  });
}

function ClustersMethod(groups, minNeighDistX){
   CM_DistributeInfluences(groups);
   CM_CreateCLusters(groups, minNeighDistX);
   CM_CreatePaths();
   CM_FillNeighboursArrays(rootCluster);
   CM_CalculateNeighbourhoods();
   CM_SortChildren(rootCluster);
   CM_SetXPositions(groups);
}

function CM_DistributeInfluences(groups){
  groups.forEach((group) => {
    group.nodes.forEach((node) => {
      node.prevNodes.forEach((prevNode) => {
        let percent = 100 / node.prevNodes.length;
        let influence = new Influence(prevNode, node, percent);
        prevNode.influentedNodes.push(influence);
        node.influencingNodes.push(influence);

        prevNode.influencingNodes.forEach((influencingNode) => {
          influence = influencingNode.from.influentedNodes.find(function(element, index, array){
            return element.to == node;
          });
          if(influence !== undefined) {
            influence.percent += influencingNode.percent * percent / 100;
          }
          else {
            influence = new Influence(influencingNode.from, node, influencingNode.percent * percent / 100);
            influencingNode.from.influentedNodes.push(influence);
            node.influencingNodes.push(influence);
          }
        });
      });
    });
  });
}

function CM_CreateCLusters(groups, minNeighDistX){
  let reversedGroups = groups.slice(0);
  reversedGroups.reverse();
  reversedGroups.forEach((group) => {
    group.nodes.forEach((node) => {
      node.cluster = new Cluster(node, minNeighDistX);
      node.cluster.id = node.id;
      node.influentedNodes.forEach((influence) => {
        if(influence.percent > 50 && influence.to.cluster.parent === undefined){
          node.cluster.AddChild(influence.to.cluster);
        }
      });
    });
  });
  var abstractNode = new Node();
  abstractNode.name = "abstract";
  abstractNode.x = 0;
  abstractNode.y = -2 * dy;
  abstractNode.depth = -1;
  rootCluster = new Cluster(abstractNode, minNeighDistX);
  rootCluster.x = 0;
  nodes.forEach((node) => {
    if(node.cluster.parent == undefined){
      rootCluster.AddChild(node.cluster);
    }
  });
}

function CM_CreatePaths(){
  rootCluster.path = [rootCluster];
  rootCluster.children.forEach((child) => {
    CM_CreatePath(child);
  });
}

function CM_CreatePath(cluster){
  cluster.path = cluster.parent.path.slice(0);
  cluster.path.push(cluster);
  cluster.children.forEach((child) => {
    CM_CreatePath(child);
  });
}

function CM_FillNeighboursArrays(cluster){
  cluster.children.forEach((child, i) => {
    CM_FillNeighboursArrays(child);
    cluster.children.forEach((neighbourChild, j) => {
      if(i != j){
        child.neighbours.push(new Neighbourhood(neighbourChild));
      }
    });
  });
}

function CM_FindSameParentCluster(path1, path2){
  for(let i = path1.length - 1; i >= 0; i--){
    if(path2.includes(path1[i])){
      return(path1[i]);
    }
  }
  return undefined;
}

function CM_CalculateNeighbourhoods(){
  nodes.forEach((node) => {
    node.prevNodes.forEach((prevNode) => {
      if(!node.cluster.path.includes(prevNode.cluster)){
        let parentCluster = CM_FindSameParentCluster(node.cluster.path, prevNode.cluster.path);
        if(parentCluster === undefined){
          console.error("undefined parent cluster");
        } else {
          let cluster = node.cluster.path[node.cluster.path.indexOf(parentCluster) + 1];
          let neighbour = prevNode.cluster.path[prevNode.cluster.path.indexOf(parentCluster) + 1];
          let neighbourhood = CM_FindNeigbourhood(cluster, neighbour);
          let array = [];
          for(let i = node.cluster.path.indexOf(parentCluster) + 2; i < node.cluster.path.length; i++){
            array.push(node.cluster.path[i]);
          }
          neighbourhood.Increase(array);
          neighbourhood = CM_FindNeigbourhood(neighbour, cluster);
          array = [];
          for(let i = prevNode.cluster.path.indexOf(parentCluster) + 2; i < prevNode.cluster.path.length; i++){
            array.push(prevNode.cluster.path[i]);
          }
          neighbourhood.Increase(array);
        }
      }
    });
  });

  _clusters.forEach((cluster) => {
    let sum = 0;
    cluster.neighbours.forEach((neighbourhood) => {
      sum += neighbourhood.value;
    });

    cluster.neighbours.forEach((neighbourhood) => {
      neighbourhood.rate = neighbourhood.value / sum * 100;
    });

  });


}

function CM_FindNeigbourhood(cluster, neighbour){
  return cluster.neighbours.find(function(element, index, array){
    return element.neighbour == neighbour;
  });
}

function CM_SortChildren(cluster) {
  if(cluster.children.length > 0){
    let array = [];
    let topIndex = -1;
    let botIndex;
    let sum;

    cluster.children.sort(function(a, b){
      if(a.root.depth == b.root.depth){
        let aValue = a.topValue + a.botValue;
        let bValue = b.topValue + b.botValue;

        a.neighbours.forEach((neighbour) => {
          aValue += neighbour.value;
        });

        b.neighbours.forEach((neighbour) => {
          bValue += neighbour.value;
        });

        return bValue - aValue;
      }
      else {
        return a.root.depth - b.root.depth;
      }
    });

    cluster.children.forEach((child) => {
      if(array.length == 0){
        array.push(child);
      }
      else {
        sum = child.topValue + child.botValue;
        botIndex = array.length;
        let approximateIndex = 0;
        approximateIndex += child.topValue * topIndex;
        approximateIndex += child.botValue * botIndex;
        array.forEach((item, i) => {
          let neighbourhood = CM_FindNeigbourhood(child, item);
          approximateIndex += neighbourhood.value * i;
          sum += neighbourhood.value;
        });
        if(sum == 0){
          if(array[array.length - 1].botValue > 0){
            if(array[0].topValue > 0){
              let index = Math.floor(array.length);
              let newArray = [];
              array.forEach((item, i) => {
                if(index == i){
                  newArray.push(child);
                }
                newArray.push(item);
              });
              array = newArray;
            }
            else {
              array.unshift(child);
            }
          }
          else {
            array.push(child);
          }
        }
        else {
          approximateIndex /= sum;
          let index = Math.ceil(approximateIndex);
          if(index == -1){
            index = 0;
          }
          if(index == 0 && child.topValue < array[0].topValue){
            index++;
          }
          if(index == array.length && child.botValue < array[array.length - 1]){
            index--;
          }
          if(index == array.length){
            array.push(child);
          }
          else {
            let newArray = [];
            array.forEach((item, i) => {
              if(index == i){
                newArray.push(child);
              }
              newArray.push(item);
            });
            array = newArray;
          }

        }
      }
    });

    cluster.children = array;

    cluster.children.forEach((child, i) => {
      let neighbourIndex;
      child.neighbours.forEach((neighbourhood) => {
        neighbourIndex = cluster.children.indexOf(neighbourhood.neighbour);
        neighbourhood.clusters.forEach((cl) => {
          if(i < neighbourIndex){
            cl.botValue++;
          }
          else {
            cl.topValue++;
          }
        });

      });

      CM_SortChildren(child);
    });
  }
}

function CM_SetXPositions(groups, minNeighDistX){
  rootCluster.SetGroups();
  rootCluster.SetClustersPositions();
  rootCluster.SetGlobalPosX(0);
}

function ForceSimulationMethod(groups, minNeighDistX){
  BM_SetPreliminaryXPositions(groups, minNeighDistX);
  Simulate(groups, minNeighDistX);
}

function Simulate(groups, minNeighDistX){
  let links = [];

  nodes.forEach((node) => {
    node.nextNodes.forEach((nextNode) => {
      links.push(Object.create({
        source: node,
        target:  nextNode
      }))
    });
  });

  nodes.forEach((node) => {
    node.fy = node.y;
  });

  var simulation = d3.forceSimulation(nodes);

  simulation
    .force("center", d3.forceCenter(window.innerWidth * 5, window.innerHeight * 5))
    .force("link", d3.forceLink(links))
    .force("charge", d3.forceManyBody().strength(-30))
    .force('collide', d3.forceCollide().radius(minNeighDistX / 2)).restart();

  simulation.tick(1000);

  MoveRoot(groups);

  console.log("simulation", simulation);
  console.log("sim nodes", simulation.nodes());
}

function ShowGraph(){
  const svg = SVG();


  const offset = Offset();

  const g = Groups(svg, offset);

  if(method == "Clusters"){
    clustersVisualization = DrawClusters(g);
    clustersVisualization
      .attr("style", "display:none");
    showClustersButton.setAttribute("style", "display:block");
    hideClustersButton.setAttribute("style", "display:none");
  }
  else {
    showClustersButton.setAttribute("style", "display:none");
    hideClustersButton.setAttribute("style", "display:none");
  }

  const link = DrawLinks(nodes, g);

  const node = DrawNode(nodes, g);

  const nestedButtons = DrawNestedButtons(node);

  //WrapText();

  Zoom(svg, g, offset);

}

// ?????????????? ????????????
function clearSVG() {
  d3.select("body")
      .select("svg")
      .selectAll("g")
      .remove()
}

function SVG() {
  return d3.select("body")
          .select("svg")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("viewBox", [0, 0, window.innerWidth * 10, window.innerHeight * 10])
          .attr("preserveAspectRatio", "none");
}

function BorderPath(svg) {
  return svg.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("height", height)
          .attr("width", width)
          .style("stroke", "#999999")
          .style("fill", "none")
          .style("stroke-width", 4);;
}

function Offset() {
  return `translate(${0},${window.innerWidth * 10 / 2})`;
}

function Groups(svg, offset){
  return svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("transform", offset);
}

function GetLinks(){
  let links = [];

  nodes.forEach((node) => {
    node.nextNodes.forEach((nextNode) => {
      links.push(Object.create({
        source: Object.create({
          x: node.x,
          y: node.y + dy / 2
        }),
        target:  Object.create({
          x: nextNode.x,
          y: nextNode.y - dy / 2
        })
      }))
    });
  });

  return links;
}

function DrawLinks(nodes, g) {
  let links = GetLinks();

    return g.append("g")
              .attr("fill", "none")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.8)
              .attr("stroke-width", 20)
            .selectAll("path")
              .data(links)
              .join("path")
              //.attr('marker-end', 'url(#arrowhead)')
              .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x));
}

function DrawClusters(g){
  let cluster = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 10)
    .selectAll("g")
    .data(_clusters)
    .join("g")
      .attr("transform", d => `translate(${d.root.y},${d.globalX})`);

  cluster.append("rect")
      .attr("fill", "#FF4040")
      .attr("fill-opacity", 0.10)
      .attr("stroke", "#DDD")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("x", d => -dy / 2)
      .attr("y", d => d.height / -2)
      .attr("width", d => (d.maxDepth - d.root.depth + 1) * (dy + nodeYSpacing))
      .attr("height", d => d.height)
      .attr("rx", 50)
      .attr("ry", 50);

  return cluster;
}

function ShowClusters() {
  clustersVisualization
    .attr("style", "display:block");
}

function HideClusters() {
  clustersVisualization
    .attr("style", "display:none");
}

function DrawNode(nodes, g) {
  let node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 10)
    .selectAll("g")
    .data(nodes)
    .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("rect")
      .attr("fill", d => d.color)
      .attr("stroke", "#333")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("x", -dy / 2)
      .attr("y", -dx / 2)
      .attr("width", dy)
      .attr("height", dx)
      .attr("rx", 10)
      .attr("ry", 10);

  node.append("rect")
      .attr("fill", "#AAA")
      .attr("stroke", "#333")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("x", -dy / 2)
      .attr("y", -dx / 2)
      .attr("width", dy)
      .attr("height", 40)
      .attr("rx", 10)
      .attr("ry", 10);

  node.append("text")
      .attr("x", 0)
      .attr("y", -dx / 2 + 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#222")
      .attr("font-size", "28")
      .attr("font-weight", "650")
      .text(d => d.name)
    .clone(true).lower()
      .attr("stroke", "white");

      node.append(d => createSVGtext({text: d.text,
            //x: -dx / 2 + 50,
            //y: -dy / 2 + 10,
            x: 0,
            y: -dx / 2 + 70,
            fontSize: 18,
            fill: "#111",
            textAnchor: "middle",
            maxCharsPerLine: dy / 10}))

    return node;
}

function DrawNestedButtons(node){
  let button = node.filter(function (d, i) {
    return d.type == "nested";
  })
  .each(function (d) {
    d3.select(this)
      .append("circle")
      .attr("cx", dy / 2 - 19)
      .attr("cy", dx / 2 - 19)
      .attr("r", 20)
      .attr("fill", "#52442D")
      .attr("stroke", "#333")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 3)
      .on('click', function(dc) {
        console.log(d);
        backupData = dataNodes;
        dataNodes = d.nestedScenario.nodes;
        nestedBackButton.setAttribute("style", "display:block")
        Draw();
      });
  })

}

function createSVGtext(config = {}) {

  let {text, x = 0, y = 0,
       fontSize = 14, fill = '#333',
       textAnchor = "left",
       maxCharsPerLine = 65,
       lineHeight = 1.3} = config;

  if (typeof config == "string") text = config;

  let svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  svgText.setAttributeNS(null, 'x', x);
  svgText.setAttributeNS(null, 'y', y);
  svgText.setAttributeNS(null, 'font-size', fontSize);
  svgText.setAttributeNS(null, 'fill', fill);
  svgText.setAttributeNS(null, 'text-anchor', textAnchor);

  //console.log("STR", text);

  let array = text.split(/\n+/);

  console.log("LINES", array);
  let dy = 0;

  array.forEach((item) => {
    let words = item.trim().split(/\s+/).reverse(),
    word,
    lineNumber = 0,
    line = [];
    console.log(words);

    while(word = words.pop()) {

      line.push(word);
      let testLineLength = line.join(" ").length;

      if (testLineLength > maxCharsPerLine){
        line.pop();

        let svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        svgTSpan.setAttributeNS(null, 'x', x);
        svgTSpan.setAttributeNS(null, 'dy', dy + "em");

        let tSpanTextNode = document.createTextNode(line.join(" "));
        svgTSpan.appendChild(tSpanTextNode);
        svgText.appendChild(svgTSpan);

        line = [word];
        dy = lineHeight;
      }
    }

      let svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      svgTSpan.setAttributeNS(null, 'x', x);
      svgTSpan.setAttributeNS(null, 'dy', dy + "em");

      let tSpanTextNode = document.createTextNode(line.join(" "));
      svgTSpan.appendChild(tSpanTextNode);
      svgText.appendChild(svgTSpan);
      dy = lineHeight;
  });

  return svgText;
}

function Zoom(svg, g, offset) {
  const zoom = d3.zoom();

  svg.call(zoom.transform, d3.zoomIdentity);

  svg.call(zoom
    .scaleExtent([0.1, 6])
    .on("zoom", zoomed));

  function zoomed({transform}) {
    g.attr("transform", transform + offset);
  }

}

function Back() {
  dataNodes = backupData;
  nestedBackButton.setAttribute("style", "display:none")
  Draw();
}

function ExportGraph(){
  console.log(graph);
      const getCircularReplacer = (deletePorperties) => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if(deletePorperties){
              delete value.id;
              delete value.x0;
              delete value.y0;
              delete value.y;
              delete value.x;
              delete value.depth;
              delete value.size;
            }
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };

      var myRoot = JSON.stringify(graph, getCircularReplacer(false));
      var myvar= JSON.parse(myRoot);
      myvar= JSON.stringify(myvar, getCircularReplacer(true));

      console.log(myvar);
}

module.exports = {
  DrawGraph: DrawDAG,
  RemoveGraph: RemoveGraph,
  ExportGraph: ExportGraph
};
