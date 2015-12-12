var global_links = []
var first_to_draw = true

var devSize = Math.min($(window).width(), $(window).height());
var canvasWidth =  devSize < 700 ? devSize * 0.8 : 700;
var canvasHeight = devSize < 700 ? devSize * 0.8 : 700;
var MARGINS =
  {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  };

var plotWidth = canvasWidth - MARGINS.left - MARGINS.right;
var plotHeight = canvasHeight - MARGINS.top - MARGINS.bottom;

var drawDiredted = function() {
    if (first_to_draw) {
        first_to_draw = false
    }
    else {
        d3.select("#diGraphWrapper").select("svg").remove();
    }
    var nodes = {};
    var links = JSON.parse(JSON.stringify(global_links)); //copying not referencing~!!!
    var first_v = links[0].source;
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {
            name: link.source
        });
        link.target = nodes[link.target] || (nodes[link.target] = {
            name: link.target
        });
        link.value = +link.value;
    });
    var width = plotWidth, height = plotHeight;
    var force = d3.layout.force().nodes(d3.values(nodes)).links(links).size([ width, height ])
    .linkDistance(50).charge(-3000).on("tick", tick);
    nodes[first_v].fixed = true;
    nodes[first_v].x = 200;
    nodes[first_v].y = 200;
    var svg = d3.select("#diGraphWrapper").append("svg").attr("width", width).attr("height", height);
    svg.append("svg:defs").selectAll("marker").data([ "end" ]).enter()
    .append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");
    var path = svg.append("svg:g").selectAll("path").data(force.links()).enter()
    .append("svg:path")
    .attr("class", "link")
    .attr("marker-end", "url(#end)");
    var node = svg.selectAll(".node").data(force.nodes()).enter()
    .append("g")
    .attr("class", "node")
    .call(force.drag);
    node.append("circle").attr("r", 5);
    node.append("text").attr("x", 12).attr("dy", ".35em").text(function(d) {
        return d.name;
    });
    force.start();
    for (var i = 0; i < 100; ++i) force.tick();
    force.stop();
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }
};

function handleClick(event){
    console.log(document.getElementById("myVal_dig").value)
    parse_draw(document.getElementById("myVal_dig").value)
    document.getElementById("myVal_dig").value = ''
    return false;
};
 
function parse_draw(val){
    link = val.split(',')

    if(link.length !== 2){
        alert('You should put two vertex labels separated by comma')
    } 
    else{
        global_links.push({"source": link[0].trim(),
                    "target": link[1].trim(),
                    "value": '3'})
        drawDiredted()
        dig_exist = true
    }
};

var dig_exist = false

d3.select("#directed_graph_generator").on("click", function(){
  if (dig_exist) {
    d3.select("#diGraphWrapper").select("svg").remove();
    dig_exist = false
  }
  else {
    drawDiredted();
    dig_exist = true;
  }
});