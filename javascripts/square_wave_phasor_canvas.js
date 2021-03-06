var PHASOR_SUM_SQUARE_CANVAS = function() {

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

var vis = d3.select('#phasorCanvasWrapper');

vis.append("svg").attr("id", "phasorCanvasSpace")
  .attr("class", "caiCanvas")
  .attr("width", "750")
  .attr("height", "750")
  .style("padding-top", "20px");

var canvas = vis.append("canvas")
    .attr("id", "layer1")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

var canvas_rsd = vis.append("canvas")
    .attr("id", "layer2")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

var ctx = canvas.node().getContext("2d");
var ctx_rsd = canvas_rsd.node().getContext("2d");

ctx.translate(MARGINS.top, MARGINS.left);
ctx_rsd.translate(MARGINS.top, MARGINS.left);

var time = radianRange[0];
var amplitudes = [];
var interpolaters = [];

amplitudes[0] = 1.0;
amplitudes[1] = 0.0;
amplitudes[2] = 0.5;
amplitudes[3] = 0.0;
amplitudes[4] = 0.25;

var xComponent = 0;
var yComponent = 0;

var cosComp = 0;
var sinComp = 0;

function draw() {

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#808080"

  ctx.beginPath();
  ctx.moveTo(0, plotHeight/2)
  ctx.lineTo(plotWidth, plotHeight/2)
  ctx.globalAlpha = 1
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(plotWidth/2, 0)
  ctx.lineTo(plotWidth/2, plotHeight)
  ctx.stroke();

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

    ctx.beginPath();
    ctx.moveTo(xStart, yStart)
    ctx.lineTo(xComponent, yComponent)
    ctx.strokeStyle = "steelblue"
    ctx.lineWidth = 2
    ctx.globalAlpha = 1
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xStart, yStart, (xRange(amplitudes[i]) - xRange(0))/3, 0, 2*Math.PI)
    ctx.fillStyle = "steelblue"
    ctx.globalAlpha = 0.4
    ctx.fill();

    if (i==4) {
      ctx_rsd.beginPath();
      ctx_rsd.arc(xComponent, yComponent, 5, 0, 2*Math.PI)
      ctx_rsd.fillStyle = "orange"
      ctx_rsd.globalAlpha = 0.3
      ctx_rsd.fill();

      i = d3.interpolate([xComponent, yComponent], [xRadianRange(time), yComponent])
      interpolaters.push(i)
    }

  }
  time += 0.0125;
  if (time > radianRange[1])
  {
    time = radianRange[0];
    d3.timer(function() {return (polarToCarte()+!clicked_canvas);}, 100)
    return true
  }
  return false
}

var t = 0;
function polarToCarte(){

  t += 0.01
  if (t>1) {
    t = 0
    interpolaters = []
    setTimeout(function(){ctx_rsd.clearRect(-1,-1,plotWidth+1,plotHeight+1)
      d3.timer(function() {ctx.clearRect(-1,-1,plotWidth+1,plotHeight+1); return (draw()+!clicked_canvas);}, 100)}, 1000)
    return true
  }
  ctx_rsd.clearRect(-1,-1,plotWidth+1,plotHeight+1)
  for (var j=0; j<interpolaters.length; j++) { 
    ctx_rsd.beginPath();
    ctx_rsd.arc(interpolaters[j](t)[0], interpolaters[j](t)[1], 5, 0, 2*Math.PI)
    ctx_rsd.fillStyle = "orange"
    ctx_rsd.globalAlpha = 0.3
    ctx_rsd.fill();
  }
  return false
}

d3.timer(function() {ctx.clearRect(-1,-1,plotWidth+1,plotHeight+1); return (draw()+!clicked_canvas);}, 100);

};

var clicked_canvas = false

d3.select("#complex_phasor_canvas").on("click", function(){
  clicked_canvas = !clicked_canvas
  if (clicked_canvas) {
    PHASOR_SUM_SQUARE_CANVAS();
  }
  else {
    d3.select("#phasorCanvasSpace").remove();
    d3.select("#layer1").remove();
    d3.select("#layer2").remove();
  }
});