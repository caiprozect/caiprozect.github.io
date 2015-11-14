var PHASOR_SUM_SQUARE = function() {

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

var xRange = d3.scale.linear().range([MARGINS.left, plotWidth]);
var xRadianRange = d3.scale.linear().range([MARGINS.left, plotWidth])
var yRange = d3.scale.linear().range([plotHeight, MARGINS.top]);

var radianRange = [-Math.PI/2, 3*Math.PI/2];

xRange.domain([-1.25 * 2.0, 1.25 * 2.0]);
xRadianRange.domain([radianRange[1], radianRange[0]]);
yRange.domain([-1.25 * 2.0, 1.25 * 2.0]);

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

var vis = d3.select("#phasorWrapper").append("svg").attr("id", "phasorSumSquare")
  .attr("class", "caiCanvas")
  .attr("width", "750")
  .attr("height", "750")
  .style("padding-top", "20px");

vis.append('svg:g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + (plotHeight / 2) + ')')
  .style('opacity', 0.25)
  .call(xAxis);
 
vis.append('svg:g')
  .attr('class', 'y axis')
  .attr('transform', 'translate(' + plotWidth / 2 + ',0)')
  .style('opacity', 0.25)
  .call(yAxis);


var colorScale = d3.scale.category10();
colorScale.domain[d3.range(0, 10, 1)];

var vectors = [];
var frequencyVectors = [];
var circles = [];
var amplitudes = [];
var freqSamples = [];

for (var i = 0; i < 5; i++)
{
  vectors.push(vis.append("line")
    .attr("stroke-width", 2.0)
    .attr("stroke", colorScale(i))
    .style("stroke-linecap", "round")
    .style('opacity', 1.0)
    );

  circles.push(vis.append('svg:circle')
    .attr('stroke-width', 2.5)
    .attr('stroke', colorScale(i))
    .attr('fill', 'none')
    .attr('opacity', 0.35)
  );

  amplitudes.push(0.5);
}

var time = radianRange[0];

amplitudes[0] = 1.0;
amplitudes[1] = 0.0;
amplitudes[2] = 0.5;
amplitudes[3] = 0.0;
amplitudes[4] = 0.25;

vis.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 300)
  .attr("height", 20)
  .attr("fill", "#fff");


var xComponent = 0;
var yComponent = 0;

var cosComp = 0;
var sinComp = 0;

draw = function() {

  cosComp = 0;
  sinComp = 0;

  for (var i = 0; i < 5; i++)
  {
    var xStart = xRange(cosComp);
    var yStart = yRange(sinComp);

    cosComp += Math.cos(time * (i + 1)) * amplitudes[i];
    sinComp += Math.sin(time * (i + 1)) * amplitudes[i];

    xComponent = xRange(cosComp);
    yComponent = yRange(sinComp);

    vectors[i]
      .attr('x1', xStart)
      .attr('y1', yStart)
      .attr('x2', xComponent)
      .attr('y2', yComponent);

    circles[i]
      .attr('cx', xStart)
      .attr('cy', yStart)
      .attr('r', (xRange(amplitudes[i]) - xRange(0))/3)
      .attr('fill', colorScale(i))
    if (i==4) { 
      vis.append('circle').attr('class', 'brush')
        .attr('r', 5)
        .attr('fill', 'orange')
        .attr('opacity', 0.25)
        .attr('cx', vectors[4].attr('x2'))
        .attr('cy', vectors[4].attr('y2'))
        .transition().duration(1000)
        .attr('cx', function(){return xRadianRange(time);})
        .transition().duration(2500)
        .remove();
    }
  }

  time += 0.0125;
  if (time > radianRange[1])
  {
    time = radianRange[0];
  }
}

 d3.timer(function(){draw(); return !clicked}, 100);
}

var clicked = false

d3.select("#complex_phasor_svg").on("click", function(){
  clicked = !clicked
  if (clicked) {
    PHASOR_SUM_SQUARE();
  }
  else {
    d3.select("#phasorSumSquare").remove();
  }
});