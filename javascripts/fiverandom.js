var isTrying_R = false;
var isPlaying_R = false;
var isBaring_R = false;
var isHinting_R = false;
var isBeating_R = false;
var clearLock_R = false;
var played_R = false;
var barShow_R = false;
var orposx_R = [];
var orposy_R = [];
var slopes_R = {};

for (var i=0; i<16; i++){
  slopes_R[i.toString()] = 0
}

var fiveR = function() {
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

var xRange = d3.scale.linear().range([MARGINS.left+6, plotWidth-6]);
var yRange = d3.scale.linear().range([plotHeight-6, MARGINS.top+6]);
var xbarRange = d3.scale.linear().range([MARGINS.left+6, plotWidth-6]);
var ybarRange = d3.scale.linear().range([plotHeight/2, MARGINS.top+6]);

xRange.domain([-1.1, 1.1]);
yRange.domain([-1.1, 1.1]);
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

d3.select("#five_random_canvas").append("div").attr("id", "animatedWrapper").style("position", "relative");
d3.select("#five_random_canvas").append("div").attr("id", "controlPanel_fR");

d3.select("#controlPanel_fR").append("input")
  .attr("type", "range")
  .attr("id", "numPointsforR")
  .attr("class", "contorler")
  .attr("min", 1)
  .attr("max", 10)
  .attr("value", 5)
  .attr("step", 1)
  .style("width", "80%");

var vis = d3.select("#animatedWrapper").append("svg").attr("id", "fiverandom")
  .attr("class", "caiCanvas")
  .attr("width", "750")
  .attr("height", "750")
  .style("padding-top", "20px");

var drag = d3.behavior.drag()
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

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

var beatButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Beat Me")
  .style("position", "absolute")
  .style("top", -40)
  .style("left", '5%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", handleBeat);

var clearButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Clear")
  .style("position", "absolute")
  .style("top", '95%')
  .style("left", '80%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", handleClear);

var barButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Bar")
  .style("position", "absolute")
  .style("top", -40)
  .style("left", '80%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", barPlay);

var hintButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Hint")
  .style("position", "absolute")
  .style("top", -40)
  .style("left", '50%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", hintPlay);

var playButton = d3.select('#animatedWrapper').insert("button", ":first-child")
  .text("Play")
  .style("position", "absolute")
  .style("top", '95%')
  .style("left", '5%')
  //.style("height", '10%')
  //.style("width", '10%')
  .on("click", handlePlay);

function updateButtons()
{
  var className = isPlaying_R ? "disabled" : "active";
  playButton.attr("class", className);
  var barActive = isBaring_R ? "disabled" : "active";
  barButton.attr("class", barActive);
  var barBName = barShow_R ? "Scatter" : "Bar";
  barButton.text(barBName);
  var hintActive = isHinting_R ? "disabled" : "active";
  hintButton.attr("class", hintActive);
  var beatActive = isBeating_R ? "disabled" : "active";
  beatButton.attr("class", beatActive);
  var beatBName = isTrying_R ? "Give Up" : "Beat Me";
  beatButton.text(beatBName);
  var clearActive = clearLock_R ? "disabled" : "active";
  clearButton.attr("class", clearActive);
}

updateButtons();

function handlePlay()
{
  if (isPlaying_R)
  {
    return;
  }

  played_R = true;
  isPlaying_R = true; 
  pointsNum = $('#numPointsforR').val();
  updateButtons();
  resetToInitialState();
  drawDots();
  drawLine();
  drawBars();
}

function hintPlay()
{
  if (isHinting_R) {
    return;
  }

  if (played_R) {
    isHinting_R = true;
    updateButtons();
    drawPerpen();
  }
}

function barPlay()
{
  if (isBaring_R)
  {
    return;
  }

  else if (played_R) {
    isBaring_R = true;
    barShow_R = !barShow_R;
    updateButtons();
    moveCluster();
  }
}

function handleBeat(){
  if (isBeating_R)
  {
    return;
  }

  else if (played_R) {
    isBeating_R = true;
    isTrying_R = !isTrying_R;
    isPlaying_R = true;
    isHinting_R = true;
    isBaring_R = true;
    clearLock_R = true;
    updateButtons();
    drawBeat();
    }
}

function handleClear(){
  if (!clearLock_R) {
    clearPlot();
  }
}

var points = [];
var xSeries = [];
var ySeries = [];
var dots = [];
var trendlines = [];
var perpens = [];
var slopes = slopes_R;

var pointRadius = 15;
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
      vis.append("circle").datum([xVal, yVal])
        .attr("class", "stone")
        .attr("cx", xRange(xVal))
        .attr("cy", yRange(yVal))
        .attr("r", function(){return pointRadius})
        .attr("stroke", "none")
        .attr("fill", colorScale(i))
        .attr("opacity", 0.0)
        .call(drag);

    circle
        .transition()
          .duration(200)
          .delay(i * 50)
          .attr("opacity", 1.0)
          .each("end", function(){isPlaying_R=false; updateButtons();})
          //.attr("r", pointRadius)

    dots.push(circle);
  }
}

function drawLine()
{
 var leastSquaresCoeff = leastSquares(xSeries, ySeries);
    
    // apply the reults of the least squares regression
    var x1 = -1.1;
    var y1 = leastSquaresCoeff[0]*(-1.1) + leastSquaresCoeff[1];
    var x2 = 1.1;
    var y2 = leastSquaresCoeff[0]*(1.1) + leastSquaresCoeff[1];

    if (y1>1.1){
      x1 = (1.1 - leastSquaresCoeff[1])/leastSquaresCoeff[0];
      y1 = leastSquaresCoeff[0]*x1 + leastSquaresCoeff[1];
    }
    else if(y1<-1.1){
      x1 = (-1.1 - leastSquaresCoeff[1])/leastSquaresCoeff[0];
      y1 = leastSquaresCoeff[0]*x1 + leastSquaresCoeff[1];
    }
    if (y2>1.1){
      x2 = (1.1 - leastSquaresCoeff[1])/leastSquaresCoeff[0];
      y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];
    }
    else if(y2<-1.1){
      x2 = (-1.1 - leastSquaresCoeff[1])/leastSquaresCoeff[0];
      y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];
    }

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
      .attr("stroke-width", 2)
      .on("mouseenter", handleMouseover)
      .on("mouseout", handleMouseout);
 
    trendlines.push(trendline)

    drawCluster(leastSquaresCoeff[0]);
}

function drawPerpen(){
  var leastSquaresCoeff = leastSquares(xSeries, ySeries);

  for (var i=0; i < pointsNum; i++){
    x1 = dots[i].attr("cx")
    y1 = dots[i].attr("cy")

    x2 = xSeries[i];
    y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];    

    dots[i].transition()
        .duration(1500)
        .attr("cx", xRange(x2))
        .attr("cy", yRange(y2))
        .transition()
        .delay(2500)
        .duration(1500)
        .attr("cx", x1)
        .attr("cy", y1)
        .each("end", function(){isHinting_R=false; updateButtons();})

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

function drawBeat(){
  if (isTrying_R) {
    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    for (var i=0; i < pointsNum; i++){
        x1 = dots[i].attr("cx")
        y1 = dots[i].attr("cy")

        x2 = xSeries[i];
        y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];    
      
        var perpen = vis.append("line").attr("class", "beats")
                      .attr("x1", x1)
                      .attr("y1", y1)
                      .attr("x2", xRange(x2))
                      .attr("y2", yRange(y2))
                      .attr("stroke", "red")
                      .attr("stroke-width", 3)
                      .attr("opacity", 0);
    }
      vis.selectAll(".beats").transition()
        .duration(2000)
        .attr("opacity", 0.9)
        .each("end", function(){isBeating_R=false; updateButtons();})
  }
  else {
    vis.selectAll(".beats").remove();
    isPlaying_R = false;
    isHinting_R = false;
    isBaring_R = false;
    clearLock_R = false;
    isBeating_R = false;
    updateButtons();
  }
}

function drawBars(){
  slopes_data = [];
  for (i=0; i<sliceNum; i++){
    slopes_data.push([i, slopes[i.toString()]]);
  }

  vis.selectAll("rect")
        .data(slopes_data)
      .enter().append("rect").attr("class", "bar")
      .attr("x", function(d){return xbarRange(d[0]);})
      .attr("y", function(d){return ybarRange(d[1]);})
      .attr("width", function(d){return xbarRange(1)-8;})
      .attr("height", function(d){return plotHeight/2-ybarRange(d[1]);})
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .attr("opacity", barShow_R ? 0.6 : 0)
}

function drawCluster(slope){
  x = 1.1/2*Math.cos(Math.atan(slope));
  y = 1.1/2*Math.sin(Math.atan(slope));

  vis.append("line")
    .attr("class", "phase-line")
    .attr("x1", xRange(0))
    .attr("y1", yRange(0))
    .attr("x2", xRange(x))
    .attr("y2", yRange(y))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("opacity", barShow_R ? 0 : 0.6)
  vis.append("line")
    .attr("class", "phase-line")
    .attr("x1", xRange(0))
    .attr("y1", yRange(0))
    .attr("x2", xRange(-x))
    .attr("y2", yRange(-y))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("opacity", barShow_R ? 0 : 0.6)

  clut = vis.append("circle")
    .attr("class", "phase-dot")
    .attr("cx", xRange(x))
    .attr("cy", yRange(y))
    .attr("fill", "steelblue")
    .attr("r", 5)
    .attr("opacity", 0.3)

  if(barShow_R) {
    clut.attr("cx", function(){ sel = d3.select(this);
                              orposx_R.push(sel.attr("cx"));
                              orposy_R.push(sel.attr("cy"));
                              trans = (Math.atan((plotHeight/2-sel.attr("cy"))/(sel.attr("cx")-plotWidth/2))+Math.PI/2)*16/Math.PI;
                              return xbarRange(trans); })
        .attr("cy", function(){ var sel = d3.select(this); 
                              trans = (Math.atan((plotHeight/2-sel.attr("cy"))/(sel.attr("cx")-plotWidth/2))+Math.PI/2)*16/Math.PI;
                              idx = Math.floor(trans);
                              return ybarRange(slopes[idx.toString()]*Math.random()); })
        .attr("fill", "orange")
        .attr("opacity", 0.6)
  } 

  vis.append("circle")
    .attr("class", "low-phase-dot")
    .attr("cx", xRange(-x))
    .attr("cy", yRange(-y))
    .attr("fill", "steelblue")
    .attr("r", 5)
    .attr("opacity", barShow_R ? 0 : 0.3)
}

function moveCluster(){
  if (barShow_R){
    vis.selectAll(".phase-line")
      .transition()
      .attr("opacity", 0)
    vis.selectAll(".low-phase-dot")
      .transition().duration(2000)
      .attr("opacity", 0)
    vis.selectAll(".phase-dot")
      .transition().duration(2000)
      .attr("fill", "orange")
      .attr("opacity", 0.6)
      .attr("cx", function(){ var sel = d3.select(this);
                              orposx_R.push(sel.attr("cx"));
                              orposy_R.push(sel.attr("cy"));
                              trans = (Math.atan((plotHeight/2-sel.attr("cy"))/(sel.attr("cx")-plotWidth/2))+Math.PI/2)*16/Math.PI;
                              return xbarRange(trans); })
      .attr("cy", function(){ var sel = d3.select(this); 
                              trans = (Math.atan((plotHeight/2-sel.attr("cy"))/(sel.attr("cx")-plotWidth/2))+Math.PI/2)*16/Math.PI;
                              idx = Math.floor(trans);
                              return ybarRange(slopes[idx.toString()]*Math.random()); })
      .each("end", function(){isBaring_R=false; updateButtons();})
    vis.selectAll(".bar")
      .transition().duration(2000)
      .attr("opacity", 0.6)}
  else {
    vis.selectAll(".bar")
      .transition().duration(2000)
      .attr("opacity", 0)
    vis.selectAll(".phase-dot")
      .transition().duration(2000)
      .attr("fill", "steelblue")
      .attr("opacity", 0.3)
      .attr("cx", function(d, i){return orposx_R[i];})
      .attr("cy", function(d, i){return orposy_R[i];})
      .each("end", function(){isBaring_R=false; updateButtons();})
    vis.selectAll(".low-phase-dot")
      .transition().duration(2000)
      .attr("opacity", 0.3)
    vis.selectAll(".phase-line")
      .transition()
      .delay(2000)
      .attr("opacity", 0.6)
    orposx_R = [];
    orposy_R = [];
  }
}

function resetToInitialState()
{
  vis.selectAll(".stone").remove();

  vis.selectAll(".trendline").remove();

  for (var i = 0; i < perpens.length; i++)
  {
    perpens[i].remove();
  }

  dots = [];
  trendlines = [];
  perpens = [];
  xSeries = [];
  ySeries = [];
  vis.selectAll("rect").remove();
  vis.selectAll(".phase-line").remove();
  vis.selectAll(".beats").remove();
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

function dragstarted() {
  if (!isTrying_R){
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
  vis.selectAll(".beats").remove()}
}

function dragged() {
  if (!isTrying_R){
  d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);}
}

function dragended() {
  if (!isTrying_R){
  var x = d3.select(this).datum()[0];
  var y = d3.select(this).datum()[1];
  for(var i=0; i<xSeries.length; i++){
    if (xSeries[i]==x && ySeries[i]==y) {
      xSeries[i] = xRange.invert(+d3.select(this).attr("cx"))
      ySeries[i] = yRange.invert(+d3.select(this).attr("cy"))
      d3.select(this).datum()[0] = xSeries[i]
      d3.select(this).datum()[1] = ySeries[i]
      dots[i] = d3.select(this)
    }
  }
  d3.select(this).classed("dragging", false);
  vis.select(".trendline").remove()
  trendlines = [];
  if(!barShow_R){vis.selectAll(".phase-line").remove()}
  vis.selectAll(".bar").remove()
  drawLine();
  drawBars();}
}

function handleMouseover(d, i){
  d3.select(this).attr("stroke-width", 30).attr("opacity", 0.6);
  vis.append("text").attr("id", "question").attr("text-anchor", "middle")
    .attr({
      transform: function(){return "translate("+xRange((d[0]+d[2])/2)+","+yRange((d[1]+d[3])/2)+")rotate("+(-1)*Math.atan((d[3]-d[1])/(d[2]-d[0]))*180/Math.PI+")"},
      dy: 10
    })
    .attr("font-size", 25)
    .attr("fill", "white")
    .attr("stroke", "black")
    .text("Huh? What's this line?").style("font-weight", "bold")
}

function handleMouseout(d, i){
  d3.select(this).attr("stroke-width", 2).attr("opacity", 1);
  d3.select("#question").remove();
}

clearPlot = function(){
  for (var i=0; i<sliceNum; i++){
  slopes[i.toString()] = 0
  }

  orposx_R = [];
  orposy_R = [];
  vis.selectAll('circle').remove();
  vis.selectAll('rect').remove();
  vis.selectAll('line').remove();

  barShow_R = false;
  played_R = false;
  updateButtons();
}

if (residue_R.length > 0) {
  while (residue_R[0][0].length > 0) {
    var rsd_dot = vis.append("circle")
        .attr("class", residue_R[0].attr("class"))
        .attr("cx", residue_R[0].attr("cx"))
        .attr("cy", residue_R[0].attr("cy"))
        .attr("r", residue_R[0].attr("r"))
        .attr("fill", residue_R[0].attr("fill"))
        .attr("opacity", residue_R[0].attr("opacity"))
    if (rsd_dot.attr("class") == "stone") {
      rsd_dot.datum(residue_R[0].datum()).call(drag);
      xSeries.push(rsd_dot.datum()[0]);
      ySeries.push(rsd_dot.datum()[1]);
      dots.push(rsd_dot);
    }
    residue_R[0][0].shift();
  }
  while (residue_R[1][0].length > 0) {
    var rsd_line = vis.append("line")
      .attr("class", residue_R[1].attr("class"))
      .attr("x1", residue_R[1].attr("x1"))
      .attr("y1", residue_R[1].attr("y1"))
      .attr("x2", residue_R[1].attr("x2"))
      .attr("y2", residue_R[1].attr("y2"))
      .attr("stroke", residue_R[1].attr("stroke"))
      .attr("stroke-width", residue_R[1].attr("stroke-width"))
      .attr("opacity", residue_R[1].attr("opacity"))
    if (rsd_line.attr("class") == "trendline") {
    rsd_line.datum(residue_R[1].data()[0])
      .on("mouseenter", handleMouseover)
      .on("mouseout", handleMouseout);
    }
    residue_R[1][0].shift();
  }
  drawBars();
  residue_R = [];
}

};

var clicked_fiveR = false
var residue_R = [];

d3.select("#five_random").on("click", function(){
  if (isTrying_R || isPlaying_R || isBaring_R || isHinting_R || isBeating_R) { return; }
  clicked_fiveR = !clicked_fiveR
  if (clicked_fiveR) {
    fiveR();
  }
  else {
    residue_R.push(d3.select("#fiverandom").selectAll("circle")); 
    residue_R.push(d3.select("#fiverandom").selectAll("line"));
    d3.select("#animatedWrapper").remove();
    d3.select("#controlPanel_fR").remove();
  }
});