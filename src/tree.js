var d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6');
var $ = require('jquery');
var d3plus = require('d3plus');

// function removeTree(){
//   console.log("43");
//   d3.select("svg")
//   .remove()
// }

// function drawTree(){
//   removeTree();
//   const treeChart = chart();
// }

var tree;
var width;
var height;
var dx = 170;
var dy = 800;
var nodeXSpacing = 300;
var nodeYSpacing = 500;
var method;

function removeTree(){
  tree = null;

  d3.select("body")
      .select("svg")
      .selectAll("g")
      .remove()
}

function drawTree(data, options){
  tree = d3.hierarchy(data)
  method = options.method;
  dx = options.nodeWidth;
  dy = options.nodeHeight;
  nodeXSpacing = options.nodeXSpacing;
  nodeYSpacing = options.nodeYSpacing;
  // console.log("data ", data);
  // console.log("tree ", tree);
  const treeChart = chart();
}

function chart(){
  if(tree != null){
    var root = tree;
    root.dx = dx + nodeXSpacing;
    root.dy = dy + nodeYSpacing;

    qwe = root
    console.log("qwe", qwe);

    switch (method) {
      case "Tidy":
        root = d3.tree().nodeSize([root.dx, root.dy])(root);
        break;
      case "Clusters":
        root = d3.cluster().nodeSize([root.dx, root.dy])(root);
        break;
      default:

    }
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    console.log("root", root);

    d3.select("body")
        .select("svg")
        .selectAll("g")
        .remove()

    width = (root.height + 1) * 400;
    height = x1 - x0 + root.dx * 2 + 300

    const svg = d3.select("body")
        .select("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])
        .attr("preserveAspectRatio", "none");

    // const borderPath = svg.append("rect")
   	// 		.attr("x", 0)
   	// 		.attr("y", 0)
   	// 		.attr("height", height)
   	// 		.attr("width", width)
   	// 		.style("stroke", "#999999")
   	// 		.style("fill", "none")
   	// 		.style("stroke-width", 4);

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 10)
    .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 10)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("rect")
        .attr("fill", "#888")
        .attr("stroke", "#DDD")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("x", dx / -2)
        .attr("y", dy / -2)
        .attr("width", dx)
        .attr("height", dy)
        .attr("rx", 10)
        .attr("ry", 10);

    node.append("rect")
        .attr("fill", "#AAA")
        .attr("stroke", "#DDD")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("x", dx / -2)
        .attr("y", dy / -2)
        .attr("width", dx)
        .attr("height", 30)
        .attr("rx", 10)
        .attr("ry", 10);

    node.append("text")
        .attr("x", 0)
        .attr("y", dy / -2 + 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "24")
        .attr("font-weight", "500")
        .text(d => d.data.name)
      .clone(true).lower()
        .attr("stroke", "white");

    node.append("text")
        .text(d => d.data.description)
        // .attr("class", "textwrap")
        //.call(wrap, dy - 50)
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "20")
        .attr("font-weight", "500")
        //.attr("size", dy * 0.9)
      .clone(true).lower()
        .attr("stroke", "white");

    // d3plus.textwrap()
    //   .container(node)
    //   .width(270)
    //   .height(90)
    //   .draw();

      svg.call(d3.zoom()
        .extent([[-width / 2, 0], [width, height]])
        .scaleExtent([0.05, 4])
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
        g.attr("transform", transform);
      }
  } else{
    console.log("null");
  }
}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0, //<-- 0!
        lineHeight = 1.2, // ems
        x = text.attr("x") ? text.attr("x") : 50, //<-- include the x!
        y = text.attr("y") ? text.attr("y") : 0,
        dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").attr("dx", "0em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").attr("dx", "0em").text(word);
            }
        }
    });
}

function exportTree(){
  console.log(tree); //root contains everything you need
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

      var myRoot = JSON.stringify(tree, getCircularReplacer(false)); //Stringify a first time to clone the root object (it's allow you to delete properties you don't want to save)
      var myvar= JSON.parse(myRoot);
      myvar= JSON.stringify(myvar, getCircularReplacer(true)); //Stringify a second time to delete the propeties you don't need

      console.log(myvar); //You have your json in myvar
}

module.exports = {
  DrawGraph: drawTree,
  removeGraph: removeTree,
  exportGraph: exportTree
};
