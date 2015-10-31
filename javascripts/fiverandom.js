var CONTINUUM = (function() {

var canvasWidth = $(window).width() < 600 ? $(window).width()*0.9 : $(window).width()*0.5;
var canvasHeight = $(window).height()*0.8;
var MARGINS =
  {
    top: 2,
    right: 10,
    bottom: 2,
    left: 40
  };

var plotWidth = canvasWidth - MARGINS.left - MARGINS.right;
var plotHeight = canvasHeight - MARGINS.top - MARGINS.bottom;

var xRange = d3.scale.linear().range([MARGINS.left+6, plotWidth-6]);
var yRange = d3.scale.linear().range([plotHeight-6, MARGINS.top+6]);

xRange.domain([-1.1, 1.1]);
yRange.domain([-1.1, 1.1]);

var xAxis = d3.svg.axis()
  .scale(xRange)
  .tickSize(1)
  .ticks(0)
  .tickSubdivide(true);

var yAxis = d3.svg.axis()
  .scale(yRange)
  .tickSize(1)
  .ticks(0)
  .orient('left')
  .tickSubdivide(true);

var colorScale = d3.scale.category10();
colorScale.domain[d3.range(0, 10, 1)];

var vis = d3.select('#fiverandom');

var xAx = vis.append('svg:g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + (plotHeight / 2) + ')')
  .style("opacity", 0.6)
  .call(xAxis);
 
vis.append('svg:g')
  .attr('class', 'y axis')
  .attr('transform', 'translate(' + (plotWidth / 2) + ',0)')
  .style("opacity", 0.6)
  .call(yAxis);

var playButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Play")
  .style("position", "relative")
  .style("top", -40)
  .style("left", canvasWidth/2)
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", handlePlay);

var isPlaying = false;

function updateButtons()
{
  var className = isPlaying ? "disabled" : "active";
  playButton.attr("class", className); 
}

updateButtons();

function handlePlay()
{
  if (isPlaying)
  {
    return;
  }

  isPlaying = true;
  updateButtons();
  resetToInitialState();
  drawDots();
}

var points = [];
var dots = [];
var pointRadius = 10;
var pointsNum = 5;

function drawDots()
{
  for (var i = 0; i < pointsNum; i++)
  {
    var xVal = xRange(Math.random()*2-1)
    var yVal = yRange(Math.random()*2-1)

    points.push((xVal, yVal))

    var circle = 
      vis.append("circle")
        .attr("cx", xVal)
        .attr("cy", yVal)
        .attr("r", pointRadius)
        .attr("stroke", "none")
        .attr("fill", colorScale(i))
        .attr("opacity", 0.0);

    circle
        .transition()
          .duration(200)
          .delay(i * 50)
          .attr("opacity", 1.0)
          //.attr("r", pointRadius)

    dots.push(circle);
  }

  isPlaying = false;
  updateButtons();
  return true;
}

function resetToInitialState()
{
  for (var i = 0; i < dots.length; i++)
  {
    dots[i].remove();
  }

  dots = [];
}

}) ();