var CONTINUUM = (function() {

var canvasWidth = 700;
var canvasHeight = 700;
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

xRange.domain([-4, 4]);
yRange.domain([-4, 4]);

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

var vis = d3.select('#fivenormrandom');

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

var playButton = d3.select('#animatedWrapper2').insert("button", ":first-child")
  .text("Play")
  .style("position", "relative")
  .style("top", -40)
  .style("left", canvasWidth/2)
  .style("height", 25)
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

function normal_random(mean, variance) {
  if (mean == undefined)
    mean = 0.0;
  if (variance == undefined)
    variance = 1.0;
  var V1, V2, S;
  do {
    var U1 = Math.random();
    var U2 = Math.random();
    V1 = 2 * U1 - 1;
    V2 = 2 * U2 - 1;
    S = V1 * V1 + V2 * V2;
  } while (S > 1);

  X = Math.sqrt(-2 * Math.log(S) / S) * V1;
//Y = Math.sqrt(-2 * Math.log(S) / S) * V2;
  X = mean + Math.sqrt(variance) * X;
//Y = mean + Math.sqrt(variance) * Y ;
  return X;
}


function drawDots()
{
  for (var i = 0; i < pointsNum; i++)
  {
    var xVal = xRange(normal_random())
    var yVal = yRange(normal_random())

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