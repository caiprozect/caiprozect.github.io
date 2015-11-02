var fiveNR = (function() {
var devSize = Math.min($(window).width(), $(window).height());
var canvasWidth =  devSize < 700 ? devSize*0.8 : 700;
var canvasHeight = devSize < 700 ? devSize*0.8 : 700;
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
var xbarRange = d3.scale.linear().range([MARGINS.left+6, plotWidth-6]);
var ybarRange = d3.scale.linear().range([plotHeight/2, MARGINS.top+6]);

xRange.domain([-4, 4]);
yRange.domain([-4, 4]);
var sliceNum = 16;
xbarRange.domain([0, sliceNum]);
ybarRange.domain([0, 50]);

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

var hintButton = d3.select('#animatedWrapper2').insert("button", ":first-child")
  .text("Hint")
  .style("position", "absolute")
  .style("top", -40)
  .style("left", '50%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", hintPlay);

var playButton = d3.select('#animatedWrapper2').insert("button", ":first-child")
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
  pointsNum = $('#numPointsforNR').val();
  updateButtons();
  resetToInitialState();
  drawDots();
  drawLine();
  //drawBars();
}

function hintPlay()
{
  drawPerpen();
}

var points = [];
var xSeries = [];
var ySeries = [];
var dots = [];
var trendlines = [];
var perpens = [];
var slopes = {};

for (var i=0; i<sliceNum; i++){
  slopes[i.toString()] = 0
}

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
    var xVal = normal_random()
    var yVal = normal_random()

    xSeries.push(xVal);
    ySeries.push(yVal);

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
    var x1 = -4;
    var y1 = leastSquaresCoeff[0]*(-4) + leastSquaresCoeff[1];
    var x2 = 4;
    var y2 = leastSquaresCoeff[0]*4 + leastSquaresCoeff[1];
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

    drawCluster(leastSquaresCoeff[0]);
}

function drawPerpen(){
  var leastSquaresCoeff = leastSquares(xSeries, ySeries);

  for (var i=0; i < pointsNum; i++){
    x2 = (xSeries[i]/leastSquaresCoeff[0]+ySeries[i]-leastSquaresCoeff[1])/(leastSquaresCoeff[0]+1/leastSquaresCoeff[0]);
    y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];

    x1 = dots[i].attr("cx")
    y1 = dots[i].attr("cy")

    dots[i].transition()
        .duration(1500)
        .attr("cx", xRange(x2))
        .attr("cy", yRange(y2))
        .transition()
        .delay(2500)
        .duration(1500)
        .attr("cx", x1)
        .attr("cy", y1)
    /*    
    var perpen = vis.append("line")
                  .attr("x1", xRange(xSeries[i]))
                  .attr("y1", yRange(ySeries[i]))
                  .attr("x2", xRange(x2))
                  .attr("y2", yRange(y2))
                  .attr("stroke", "steelblue")
                  .attr("stroke-width", 1);

    perpens.push(perpen);
    */
  }
}

function drawBars(){
  slopes_data = [];
  for (i=0; i<sliceNum; i++){
    slopes_data.push([i, slopes[i.toString()]]);
  }

  vis.selectAll("rect")
        .data(slopes_data)
      .enter().append("rect")
      .attr("x", function(d){return xbarRange(d[0]);})
      .attr("y", function(d){return ybarRange(d[1]);})
      .attr("width", function(d){return xbarRange(1)-8;})
      .attr("height", function(d){return plotHeight/2-ybarRange(d[1]);})
      .attr("fill", "steelblue")
      .attr("opacity", 0.6)
}

function drawCluster(slope){
  x = 4/2*Math.cos(Math.atan(slope));
  y = 4/2*Math.sin(Math.atan(slope));

  vis.append("line")
    .attr("class", "phase-line")
    .attr("x1", xRange(0))
    .attr("y1", yRange(0))
    .attr("x2", xRange(x))
    .attr("y2", yRange(y))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("opacity", 0.6)
  vis.append("line")
    .attr("class", "phase-line")
    .attr("x1", xRange(0))
    .attr("y1", yRange(0))
    .attr("x2", xRange(-x))
    .attr("y2", yRange(-y))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("opacity", 0.6)

  vis.append("circle")
    .attr("cx", xRange(x))
    .attr("cy", yRange(y))
    .attr("fill", "steelblue")
    .attr("r", 5)
    .attr("opacity", 0.3)
  vis.append("circle")
    .attr("cx", xRange(-x))
    .attr("cy", yRange(-y))
    .attr("fill", "steelblue")
    .attr("r", 5)
    .attr("opacity", 0.3)
}

function resetToInitialState()
{
  for (var i = 0; i < dots.length; i++)
  {
    dots[i].remove();
  }

  if (trendlines.length > 0){
    trendlines[0].remove()
  }

  for (var i=0; i < perpens.length; i++)
  {
    perpens[i].remove();
  }

  trendlines = [];
  xSeries = [];
  ySeries = [];
  dots = [];
  perpens = [];
  vis.selectAll("rect").remove();
  vis.selectAll(".phase-line").remove();
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

    var barX = Math.floor((Math.atan(slope)+Math.PI/2)*16/Math.PI);

    slopes[barX.toString()] += 1;
    
    return [slope, intercept, rSquare];
  }

}) ();