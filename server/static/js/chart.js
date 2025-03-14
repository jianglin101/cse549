/*
  Partial reference:
  D3js website scatter chart example:
  http://bl.ocks.org/weiglemc/6185069

  @data: input data, array list
  @query_object: query information.
  @regression: regression linear spot[x1,y1, x2, y2]
  @pictype: chart type. There are 3 chart type:
    1. User select one algorithm, display
       x, y attribute which user choose.
    2. User select two algorithm, display 
       x, y attribute which user choose.
    3. User select two algorithm, display
       one attribute and relavent regression.

*/
function drawScatter(data, query_object,regression, pictype){

  // Processed time check
  var currentTime = Date.now();
  console.log("test start");
  console.log("current time is:"+currentTime);

  // canvas width and height
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // x attribute name
  var xName;
  // x axis name
  var xAxis_name;
  // y attribute name
  var yName;
  // y axis name
  var yAxis_name;
  // category name
  var category;

  // Assign value
  if(pictype == 1){
    xName = query_object.x;
    yName = query_object.y;
    category = query_object.alg;
    xAxis_name = query_object.x;
    yAxis_name = query_object.y;
  }else if(pictype == 2){
    category = "alg";
    xName = query_object.x;
    yName = query_object.y;
    xAxis_name = query_object.x;
    yAxis_name = query_object.y;
  }else if(pictype == 3){
    xName = query_object.attr1 + "_" + query_object.alg1;//
    yName = query_object.attr1 + "_" + query_object.alg2;//
    category = query_object.attr1;
    xAxis_name = query_object.alg1;
    yAxis_name = query_object.alg2;
  }

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { 
          return d[xName];  
    }, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { 
        return d[yName];        
    }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { 
    return d[category];  
  },
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(xAxis_name);

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yAxis_name);

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["name"] + "<br/> (" + xValue(d) 
	        + ", " + yValue(d) + ")" )
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px"); 
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  // draw linear chart
  if(regression != null){
    var p1 = regression.p1;
    var p2 = regression.p2;
    var trendData = [[p1.x,p1.y,p2.x,p2.y]];

    var trendline = svg.selectAll(".trendline")
      .data(trendData);
      
    trendline.enter()
      .append("line")
      .attr("class", "trendline")
      .attr("x1", function(d) { return xScale(d[0]); })
      .attr("y1", function(d) { return yScale(d[1]); })
      .attr("x2", function(d) { return xScale(d[2]); })
      .attr("y2", function(d) { return yScale(d[3]); })
      .attr("stroke", "red")
      .attr("stroke-width", 3);
  }
  
  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { 
        return "translate(0," + i * 20 + ")"; 
      });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { 
        if(pictype == 2){
          return d;
        }else{
          return category;  
        }})

var afterTime = Date.now();
console.log("after time is:"+afterTime);
console.log("total time is:" + (afterTime - currentTime));
}