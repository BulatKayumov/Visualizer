var d3 = require('d3', 'd3-scale', 'd3-scale-chromatic', 'd3-array', 'd3@6');
var $ = require('jquery');
var d3plus = require('d3plus');

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

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 20)
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
        .attr("stroke", "#333")
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
        .attr("stroke", "#333")
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
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "20")
        .attr("font-weight", "500")
      .clone(true).lower()
        .attr("stroke", "white");

    const zoom = d3.zoom();

    svg.call(zoom.transform, d3.zoomIdentity);

    svg.call(zoom
      .scaleExtent([0.1, 6])
      .on("zoom", zoomed));

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
        lineNumber = 0,
        lineHeight = 1.2,
        x = text.attr("x") ? text.attr("x") : 50,
        y = text.attr("y") ? text.attr("y") : 0,
        dy = text.attr("dy") ? text.attr("dy") : 0;
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
  console.log(tree);
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

      var myRoot = JSON.stringify(tree, getCircularReplacer(false));
      var myvar= JSON.parse(myRoot);
      myvar= JSON.stringify(myvar, getCircularReplacer(true));

      console.log(myvar);
}

module.exports = {
  DrawGraph: drawTree,
  RemoveGraph: removeTree,
  ExportGraph: exportTree
};
