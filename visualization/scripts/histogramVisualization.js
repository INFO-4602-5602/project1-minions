// http://stackoverflow.com/questions/37812922/grouped-category-bar-chart-with-different-groups-in-d3
// https://plnkr.co/edit/L0eQwtEMQ413CpoS5nvo?p=preview
// https://bl.ocks.org/mbostock/3048450



var HISTOGRAM_CONTAINER_HEIGHT = 400;
var HISTOGRAM_CONTAINER_WIDTH = 800;



//var buildingHistogramOptions = ["Net Classification", "Type"];

var buildingHistogramOptions = {"Net Classification" : "net_classification", 
                                "Type" : "type"};

var buildingHistogramKeys = Object.keys(buildingHistogramOptions);

var current_building_histogram_selection;


var histogram_data = {};

function initializePullDownMenu(d) {
  // Create Pulldown menu to filter google map
  var pulldown_1 = d3.select("#vis_3_button_div");
  
  
  // Set default histogram selection
  current_building_histogram_selection = buildingHistogramKeys[0];
  
  pulldown_1.append("select")
                  .attr("id", "histogram_dropdown")
                  .on("change", function() {
                      current_building_histogram_selection = d3.select(this).property("value");
                      redrawHistogram(d);
                  })
                  .selectAll("option")
                  .data(buildingHistogramKeys).enter()
                .append("option")
                  .text(function (d, i) { return d; });
}



function redrawHistogram(d) {
  d3.selectAll(".histogram").remove();
  initializeHistogram(d);
}



function plotBarChart(xLbl, yLbl) {
  var w, h, xOffset, yOffset;
  w = 700;
  h = 400;
  xOffset = 100;
  yOffset = 50;
  var margin = 20;

  data = histogram_data;

  var data_keys = [], data_vals = [];
  for (var key in histogram_data) {
    data_keys.push(key);
    data_vals.push(histogram_data[key]);
  }

  
  var svg = d3.select("#histogram_group").append("svg:svg")
                         .attr("width", w)
                         .attr("height", h);

  var xScale = d3.scaleLinear()
                 .domain([0, data_vals.length+1])
                 .range([xOffset + margin, w - margin]);


  var xAxisG = svg.append('g')
                 .attr('class', 'axis')
                 .attr('id', 'Xtick')
                 .attr('transform', 'translate(0, ' + (h - yOffset - margin) + ')')
                 .call(d3.axisBottom(xScale).ticks(data_keys.length));


  var xLabel = svg.append("text")
                 .attr('class', 'label')
                 .style('font-size', '16px')
                 .attr('x', w/2)
                 .attr('y', h - margin/2)
                 .text(xLbl);


  var maxYVal = d3.max(data_vals, function(d) { return parseFloat(d); })+1;

  var yScale = d3.scaleLinear()
                .domain([0, maxYVal])
                .range([h - yOffset - margin, margin]);


  var yAxisG = svg.append('g')
                 .attr('class', 'axis')
                 .attr('transform', 'translate(' + (xOffset + margin) + ', 0)')
                 .call(d3.axisLeft(yScale));

  var yLabel = svg.append("text")
                 .attr('class', 'label')
                 .style('font-size', '16px')
                 .attr('x', w*0.05)
                 .attr('y', h/2)
                 .text(yLbl);

  var rectWidth = (w-2*margin)/data_keys.length * 0.8;
  var rectHeight = (yScale(0) - yScale(maxYVal))/maxYVal;

  var histogram = svg.selectAll("g.bars")
                      .data(data_vals).enter()
                      .append("g")
                      .attr("class", "bars");
  
      
  histogram.append("rect")
            .style("fill", "SteelBlue")
            .attr("id", function(d, i) { return "bar_"+(i+1); })
            .attr("x", function(d, i) { return xScale(i+1) - rectWidth/2; })
            .attr("y", function(d) { return yScale(d); })
            .attr("width" , function(d, i) {
              return rectWidth;
            })
            .attr("height", function(d) { return d*rectHeight; })
            .on("mouseover", function(d, i) { 
                d3.selectAll("#"+d3.select(this)
                  .attr('id'))
                  .style("fill", "red");
    
                var data_key = data_keys[i].split(" ").join("_")[0]+i;
                d3.select("#"+data_key+"_histo_label")
                  .transition().duration(250)
                  .style("opacity", 1);
            })
            .on("mouseout", function(d, i) { 
                d3.selectAll("#"+d3.select(this)
                   .attr('id'))
                  .style("fill", "SteelBlue"); 
    
                var data_key = data_keys[i].split(" ").join("_")[0]+i;
                d3.select("#"+data_key+"_histo_label")
                  .transition().duration(250)
                  .style("opacity", 0);
            });
  
  d3.select("#Xtick").selectAll("g").select("text").style("opacity", 0);
  
  // Text!
  histogram.append("text")
            .attr("id", function(d, i) {
    
              var data_key = data_keys[i].split(" ").join("_")[0]+i;
              return data_key+"_histo_label";
            })
            .attr("x", function(d, i) { return xScale(i+1) - rectWidth/2; })
            .attr("y", function(d, i) {
              return h*0.9;
            })
            .text(function(d, i) { return data_keys[i]; })
            .style("opacity", 0);
 }




function getHistogramData(buildings) {
  
  var pre_histo_data = []
  for (var i=0; i < buildings.length; i++) {
    var current_building = buildings[i];
    
    var selection_id = buildingHistogramOptions[current_building_histogram_selection];
    
    var current_data = current_building[selection_id];
    pre_histo_data.push(current_data);
  }
  
  
  histogram_data = {};
  for (var i=0; i < pre_histo_data.length; i++) {
    var current = pre_histo_data[i];
    if (current in histogram_data) {
      histogram_data[current] += 1;
    }
    else {
      histogram_data[current] = 1;
    }
  }
}

function initializeHistogram(d) {
  
  // Text header
  d3.select("#vis_3_svg_container").append("text")
            .attr("class", "histogram")
            .attr("x", 50)
            .attr("y", 50)
            .style("font-size", "40px")
            .style("opacity", 0)
            .text(function() {
              return "Market: " + d.city;
            });
  
  
  
  // Declare the histogram group
  var histo_group = d3.select("#vis_3_svg_container")
                        .append("g")
                        .attr("class", "histogram")
                        .attr("height", HISTOGRAM_CONTAINER_HEIGHT)
                        .attr("width", HISTOGRAM_CONTAINER_WIDTH)
                        .attr("id", "histogram_group")
                        .attr("transform", "translate(20, 100)");;
  
 
  
  
  // Test background
  histo_group.append("rect")
              .attr("class", "histogram")
              .attr("height", HISTOGRAM_CONTAINER_HEIGHT)
              .attr("width", HISTOGRAM_CONTAINER_WIDTH)
              .style("fill", "white")
              .style("opacity", 0);
  
  
  
  // ------------------------------------------------
  
  
  // Select correct city data from the queried data
  var buildings = QUERIED_DATA[d.city];
  
  // Get data array from buildings object
  var histo_data = getHistogramData(buildings);
  
  
  // Populate histogram with data
  plotBarChart("Categories", "Count");
  
  
  
  
  // Transition - fade it all in
  d3.selectAll(".histogram")
            .transition()
            .duration(500)
            .style("opacity", 1);
  
}



function initializeBuildingHistogram(d, object_this) {
  
  // Clear previous
  d3.selectAll(".histogram").remove();
  d3.select("#histogram_dropdown").remove();
  
  // Initialize the pulldown menu
  initializePullDownMenu(d);
  
  // Initialize the histogram
  initializeHistogram(d);
  
}
