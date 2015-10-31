var CONTINUUM = (function() {

var canvasWidth = $(window).width() < 600 ? $(window).width()*0.9 : $(window).width()*0.5;
var canvasHeight = $(window).width() < 600 ? $(window).width()*0.9 : $(window).height()*0.8;
var MARGINS =
  {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
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
  drawLine();
}

var points = [];
var xSeries = [];
var ySeries = [];
var dots = [];
var trendlines = [];
var pointRadius = 10;
var pointsNum = 5;

function drawDots()
{
  for (var i = 0; i < pointsNum; i++)
  {
    var xVal = Math.random()*2-1
    var yVal = Math.random()*2-1

    xSeries.push(xVal)
    ySeries.push(yVal)

    var circle = 
      vis.append("circle")
        .attr("cx", xRange(xVal))
        .attr("cy", yRange(yVal))
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

function drawLine()
{
 var leastSquaresCoeff = leastSquares(xSeries, ySeries);
    
    // apply the reults of the least squares regression
    var x1 = -1;
    var y1 = leastSquaresCoeff[0]*(-1) + leastSquaresCoeff[1];
    var x2 = 1;
    var y2 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];
    
    var trendline = vis.selectAll(".trendline")
      .data(trendData);
      
    trendline.enter()
      .append("line")
      .attr("class", "trendline")
      .attr("x1", function(d) { return xRange(d[0]); })
      .attr("y1", function(d) { return yRange(d[1]); })
      .attr("x2", function(d) { return xRange(d[2]); })
      .attr("y2", function(d) { return yRange(d[3]); })
      .attr("stroke", "teal")
      .attr("stroke-width", 2);
 
    trendlines.push(trendline)
}

function resetToInitialState()
{
  for (var i = 0; i < dots.length; i++)
  {
    dots[i].remove();
  }

  if (trendlines.length > 0){
    trendlines[0].remove();
  }

  dots = [];
  trendlines = [];
  xSeries = [];
  ySeries = [];
}

function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };
    
    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
      .reduce(reduceSumFunc);
    
    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
      .reduce(reduceSumFunc);
      
    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
      .reduce(reduceSumFunc);
      
    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
    
    return [slope, intercept, rSquare];
  }

}) ();