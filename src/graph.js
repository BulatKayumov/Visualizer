var d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6', '');
var $ = require('jquery');

class Node {
  name = "";
  level;
  description;
  previousNode;
  nextNodes;
  constructor(name) {
    this.name = name;
    this.level = 0;
    this.previousNode = null;
    this.nextNodes = new Set;
  }
}

var nodes;
var links;
var width;
var height;
var dx = 170;
var dy = 400;
var maxDepth;
var maxBreadth;
var nodeWidth = 300;
var nodeHeight = 120;
var nodeXSpacing = 500;
var nodeYSpacing = 100;

function removeGraph(){
  //graph = null;

  d3.select("body")
      .select("svg")
      .selectAll("g")
      .remove()
}

function drawGraph(){
  d3.json("graphData.json")
  .then(data => {
    nodes = data.nodes.map(d => Object.create(d, {
      depth: {
        value: 0,
        enumerable: true,
        writable: true
      },
      x: {
        value: null,
        enumerable: true,
        writable: true
      },
      y: {
        value: 0,
        enumerable: true,
        writable: true
      },
      prevNodes: {
        value: [],
        enumerable: true,
        writable: true
      }
    }));
    const graphChart = chart();
  });
}

function chart(){
  if(nodes != null){

    nodes.forEach((node) => {
      nextNodesArray = [];
      node.nextNodes.forEach((nextNodeId) => {
        nextNodesArray.push(nodes.find(function(element, index, array){
          return element.id == nextNodeId;
        }))
      });
      node.nextNodes = nextNodesArray;
    });

    nodes.forEach((node) => {
      node.nextNodes.forEach((nextNode) => {
        nextNode.prevNodes.push(node);
      });
    });
    // nodes.forEach((node, i) => {
    //   console.log(i);
    //   if(node.nextNodes[0] != null){
    //     if(node.id > node.nextNodes[0])
    //     {
    //       // console.log(thisNode);
    //       // console.log(node);
    //       console.log("nextnodes", node.nextNodes[0]);
    //       nodes.splice(i, 1);
    //       index = nodes.findIndex(function(element, index, array){
    //           return element.id == node.nextNodes[0];
    //       });
    //       console.log("index", index);
    //       nodes.splice(index, 0, node);
    //     }
    //   }
    // });

    nodes = TopologicalSort(nodes);

    maxDepth = 0;
    nodes.forEach((node) => {
      node.nextNodes.forEach((nextNode) => {
        nextNode.depth = Math.max(node.depth + 1, nextNode.depth);
        if(nextNode.depth > maxDepth){
          maxDepth = nextNode.depth;
        }
      });
    });

    var groups = []
    for(var i = 0; i <= maxDepth; i++){
      groups.push(Object.create({
        depth: i,
        nodes: []
      }));
    }

    groups.forEach((group) => {
      nodes.forEach((node) => {
        if(node.depth == group.depth){
          group.nodes.push(node);
        }
      });
    });

    maxBreadth = 0;

    groups.forEach((group) => {
      if(group.nodes.length > maxBreadth){
        maxBreadth = group.nodes.length;
      }
    });

    // Вычисление ширины графа
    width = dy * (maxDepth * 2 + 3);

    // Вычисление высоты графа
    height = dx * (maxBreadth + 20);

    stepY = width / (groups.length + 1);
    currY = dy;
    currX = height / -2 + 4 * dx;
    //stepX = height / (groups[0].nodes.length + 1);
    stepX = dx * 2;

    groups[0].nodes.forEach((node) => {
        currX += stepX;
        node.x = currX;
        node.y = currY;
    });

    console.log(groups);
    let minNeighDistX = dx * 2;

    groups.forEach((group) => {
      group.nodes.forEach((node) => {
        node.y = currY;
      });
      currY += dy * 2;
    });


    // groups.forEach((group) => {
    //         group.nodes.forEach((node) => {
    //                 if(node.nextNodes.length > 0){
    //                   currX = node.x - ((node.nextNodes.length - 1) * minNeighDistX / 2);
    //                   node.nextNodes.forEach((nextNode) => {
    //                     if(nextNode.x == null){
    //                       nextNode.x = currX;
    //                     } else {
    //                       nextNode.x = currX - (currX - nextNode.x) / 2;
    //                     }
    //                     currX += minNeighDistX;
    //                   });
    //                 }
    //           console.log("Node", node.name, "x", node.x);
    //         });
    //   group.nodes.sort(function (a, b) {
    //     return b.x - a.x;
    //   })
    //   if(Math.abs(group.nodes[0].x) >= Math.abs(group.nodes[group.nodes.length - 1])){
    //     for(var i = 0; i < group.nodes.length - 1; i++){
    //       if(group.nodes[i].x - group.nodes[i + 1].x < minNeighDistX){
    //         group.nodes[i + 1].x = group.nodes[i].x - minNeighDistX;
    //       }
    //     }
    //   } else {
    //     for(var i = group.nodes.length - 1; i > 0; i--){
    //       if(group.nodes[i - 1].x - group.nodes[i].x < minNeighDistX){
    //         group.nodes[i - 1].x = group.nodes[i].x + minNeighDistX;
    //       }
    //     }
    //   }
    // });

    // groups.forEach((group) => {
    //   group.nodes.forEach((node) => {
    //     node.y = currY;
    //     if(node.prevNodes.length > 0){
    //       xSum = 0;
    //       node.prevNodes.forEach((prevNode) => {
    //         xSum += prevNode.x;
    //       });
    //       averageX = xSum / node.prevNodes.length;
    //       node.x = averageX;
    //     }
    //   });
    //   group.nodes.sort(function (a, b) {
    //     return b.x - a.x;
    //   })
    //   for(var i = 0; i < group.nodes.length - 1; i++){
    //     averageX = group.nodes[i].x;
    //     count = 1;
    //     firstIndex = i;
    //     lastIndex = i;
    //     let limit = 500;
    //     while(limit > 0){
    //       limit--;
    //       if(limit == 0){
    //         console.error("Limit");
    //       }
    //       if(lastIndex != group.nodes.length - 1 && averageX - group.nodes[lastIndex + 1].x < minNeighDistX * (0.5 + count * 0.5)){
    //         lastIndex++;
    //         count++;
    //         averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
    //         continue;
    //       }
    //       if(firstIndex != 0 && group.nodes[firstIndex - 1].x - averageX < minNeighDistX * (0.5 + count * 0.5)){
    //         firstIndex--;
    //         count++;
    //         averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
    //         continue;
    //       }
    //       break;
    //     }
    //     console.log("First", firstIndex, "Last", lastIndex, "Count", count);
    //     let totalX = averageX + (minNeighDistX * ((count - 1) * 0.5));
    //     for(j = firstIndex; j <= lastIndex; j++){
    //         group.nodes[j].x = totalX;
    //         totalX -= minNeighDistX;
    //     }
    //   }
    //   currY += dy * 2;
    // });
    //
    // for(var j = groups.length - 1; j >= 0; j--){
    //   let group = groups[j];
    //   group.nodes.forEach((node) => {
    //     if(node.nextNodes.length > 0){
    //       xSum = 0;
    //       node.nextNodes.forEach((nextNode) => {
    //         xSum += nextNode.x;
    //       });
    //       averageX = xSum / node.nextNodes.length;
    //       node.x = averageX;
    //     }
    //   });
    //   for(var i = 0; i < group.nodes.length - 1; i++){
    //     averageX = group.nodes[i].x;
    //     count = 1;
    //     firstIndex = i;
    //     lastIndex = i;
    //     let limit = 500;
    //     while(limit > 0){
    //       limit--;
    //       if(limit == 0){
    //         console.error("Limit");
    //       }
    //       if(lastIndex != group.nodes.length - 1 && averageX - group.nodes[lastIndex + 1].x < minNeighDistX * (0.5 + count * 0.5)){
    //         lastIndex++;
    //         count++;
    //         averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
    //         continue;
    //       }
    //       if(firstIndex != 0 && group.nodes[firstIndex - 1].x - averageX < minNeighDistX * (0.5 + count * 0.5)){
    //         firstIndex--;
    //         count++;
    //         averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
    //         continue;
    //       }
    //       break;
    //     }
    //     console.log("First", firstIndex, "Last", lastIndex, "Count", count);
    //     let totalX = averageX + (minNeighDistX * ((count - 1) * 0.5));
    //     for(q = firstIndex; q <= lastIndex; q++){
    //         group.nodes[q].x = totalX;
    //         totalX -= minNeighDistX;
    //     }
    //   }
    // }

    sortedGroups = groups.map(d => Object.create({
      nodes: d.nodes,
      prevNode: null,
      nextNode: null
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
        xSum = 0;
        count = 0;
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
        averageX = xSum / count;
        node.x = averageX;
        }
      });
      for(var i = 0; i < group.nodes.length - 1; i++){
        averageX = group.nodes[i].x;
        count = 1;
        firstIndex = i;
        lastIndex = i;
        let limit = 500;
        while(limit > 0){
          limit--;
          if(limit == 0){
            console.error("Limit");
          }
          if(lastIndex != group.nodes.length - 1 && averageX - group.nodes[lastIndex + 1].x < minNeighDistX * (0.5 + count * 0.5)){
            lastIndex++;
            count++;
            averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
            continue;
          }
          if(firstIndex != 0 && group.nodes[firstIndex - 1].x - averageX < minNeighDistX * (0.5 + count * 0.5)){
            firstIndex--;
            count++;
            averageX = (group.nodes[firstIndex].x + group.nodes[lastIndex].x) / 2;
            continue;
          }
          break;
        }
        console.log("First", firstIndex, "Last", lastIndex, "Count", count);
        let totalX = averageX + (minNeighDistX * ((count - 1) * 0.5));
        for(q = firstIndex; q <= lastIndex; q++){
            group.nodes[q].x = totalX;
            totalX -= minNeighDistX;
        }
      }
    });

    console.log("S", sortedGroups);

    console.log("groups ", groups);
    // console.log("width ", width);
    // console.log("height ", height);
    // // WHAT
    // let x0 = Infinity;
    // let x1 = -x0;
    // root.each(d => {
    //   if (d.x > x1) x1 = d.x;
    //   if (d.x < x0) x0 = d.x;
    // });

    // Очистка холста
    d3.select("body")
        .select("svg")
        .selectAll("g")
        .remove()

    // Устанавливаем размер холста
    const svg = d3.select("body")
        .select("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])

    // Границы
    const borderPath = svg.append("rect")
   			.attr("x", 0)
   			.attr("y", 0)
   			.attr("height", height)
   			.attr("width", width)
   			.style("stroke", "#999999")
   			.style("fill", "none")
   			.style("stroke-width", 4);

    const offset = `translate(${0},${width / 2})`

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", offset);

    links = [];

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

    // Соединения
    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 10)
    .selectAll("path")
      .data(links)
      .join("path")
        .attr("d", d3.linkHorizontal()
            // .source(d => [d[0].x + dx / 2, d[0].y + dy / 2])
            // .target(d => [d[1].x + dx / 2, d[1].y + dy / 2]));
            .x(d => d.y)
            .y(d => d.x));

    // Ноды
    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 10)
      .selectAll("g")
      .data(nodes)
      .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Внешний вид и информация на нодах
    node.append("rect")
        .attr("fill", "#888")
        .attr("stroke", "#DDD")
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
        .attr("stroke", "#DDD")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("x", -dy / 2)
        .attr("y", -dx / 2)
        .attr("width", dy)
        .attr("height", dx / 4)
        .attr("rx", 10)
        .attr("ry", 10);

    node.append("text")
        .attr("x", 0)
        .attr("y", -dx * 0.3)
        .attr("text-anchor", "middle")
        .attr("fill", "#222")
        .attr("font-size", "28")
        .attr("font-weight", "650")
        //.attr("size", dy * 0.9)
        .text(d => d.name)
      .clone(true).lower()
        .attr("stroke", "white");

    node.append("text")
        .text(d => d.description)
        .attr("width", dy / 10)
        .attr("height", dx)
        .attr("x", 0)
        .attr("y", dx * 0.1)
        .attr("text-anchor", "middle")
        .attr("font-size", "24")
        .attr("font-weight", "500")
        //.attr("size", dy * 0.9)
      .clone(true).lower()
        .attr("stroke", "white");

      svg.call(d3.zoom()
        .extent([[width, 0], [width, height]])
        .scaleExtent([0.5, 6])
        //.translateExtent([[0, 0], [width, height / 2]])
        .on("zoom", zoomed));

        // var events = []
        // svg.on('mousemove', (event) => {
        //   var coords = d3.pointer( event );
        //   console.log( coords[0], coords[1] ) // log the mouse x,y position
        //   var circle = svg.append('circle')
        //       .attr('cx', coords[0])
        //       .attr('cy', coords[1])
        //       .attr('r', 10)
        //       .attr('fill', 'red')
        // });

      function zoomed({transform}) {
        g.attr("transform", transform + offset);
      }
  } else{
    console.log("null");
  }
}

function TopologicalSort(nodes){
  let white = nodes
  nodes.forEach((node) => {
    Object.defineProperties(node, {
      colour: {
        value: "white",
        enumerable: true,
        writable: true,
        configurable: true
      },
      stepsCount: {
        value: 0,
        enumerable: true,
        writable: true,
        configurable: true
      }
    });
  });
  let black = [];
  while(white.length > 0){
    if(!Step(white.shift(), white, black)){
      console.error("Found cycle");
      return;
    }
  }
  black.forEach((node) => {
    delete node.colour;
    delete node.stepsCount;
  });

  return black;
}

function Step(node, white, black){
  node.stepsCount++;
  const index = white.indexOf(node);
  if (index > -1) {
    white.splice(index, 1);
  }
  if(node.colour == "white"){
    node.colour = "grey";
    node.nextNodes.forEach((nextNode) => {
      if(nextNode.colour == "grey"){
        return false;
      }
      Step(nextNode, white, black)
    });
  }
  if(node.stepsCount < node.prevNodes.length){
      node.colour = "red";
  } else {
      node.colour = "black";
      black.unshift(node);
  }
  return true;
}

function exportGraph(){
  console.log(graph); //root contains everything you need
      const getCircularReplacer = (deletePorperties) => { //func that allows a circular json to be stringified
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if(deletePorperties){
              delete value.id; //delete all properties you don't want in your json (not very convenient but a good temporary solution)
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

      var myRoot = JSON.stringify(graph, getCircularReplacer(false)); //Stringify a first time to clone the root object (it's allow you to delete properties you don't want to save)
      var myvar= JSON.parse(myRoot);
      myvar= JSON.stringify(myvar, getCircularReplacer(true)); //Stringify a second time to delete the propeties you don't need

      console.log(myvar); //You have your json in myvar
}

module.exports = {
  drawGraph: drawGraph,
  removeGraph: removeGraph,
  exportGraph: exportGraph,
  chart: chart
};
