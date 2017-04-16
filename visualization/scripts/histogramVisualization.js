// http://stackoverflow.com/questions/37812922/grouped-category-bar-chart-with-different-groups-in-d3
// https://plnkr.co/edit/L0eQwtEMQ413CpoS5nvo?p=preview
// https://bl.ocks.org/mbostock/3048450


var current_building_histogram_selection;
var HISTOGRAM_CONTAINER_HEIGHT = 300;
var HISTOGRAM_CONTAINER_WIDTH = 600;


function initializePullDownMenu(d) {
  // Create Pulldown menu to filter google map
  var pulldown_1 = d3.select("#vis_3_button_div");
  
  
  var buildingHistogramOptions = ["Build Cost", "Profit", "Net proximity"];
  
  // Set default histogram selection
  current_building_histogram_selection = buildingHistogramOptions[0];
  
  pulldown_1.append("select")
                  .attr("id", "histogram_dropdown")
                  .on("change", function() {
                      current_building_histogram_selection = d3.select(this).property("value");
                      redrawHistogram(d);
                  })
                  .selectAll("option")
                  .data(buildingHistogramOptions).enter()
                .append("option")
                  .text(function (d, i) { return d; });
}




function redrawHistogram(d) {
  d3.selectAll(".histogram").remove();
  initializeHistogram(d);
}


function makeHistogram(histo_data) {
  var data = histo_data;

  var formatCount = d3.format(",.0f");

  var svg = d3.select("#histogram_group"),
      margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear()
      .rangeRound([0, width]);

  var bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20))
      (data);

  var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([height, 0]);

  var bar = g.selectAll(".bar")
    .data(bins)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) { return height - y(d.length); });

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatCount(d.length); });

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  
}



function getHistogramData(buildings) {
  var histo_data = []
  for (var i=0; i < buildings.length; i++) {
    var current_building = buildings[i];
    current_building_histogram_selection = current_building_histogram_selection.toLowerCase();
    var current_data = current_building[current_building_histogram_selection];
    histo_data.push(current_data);
  }
  
  return histo_data;
}

function initializeHistogram(d) {
  
  // Declar the histogram group
  var histo_group = d3.select("#vis_3_svg_container")
                        .append("g")
                        .attr("class", "histogram")
                        .attr("height", HISTOGRAM_CONTAINER_HEIGHT)
                        .attr("width", HISTOGRAM_CONTAINER_WIDTH)
                        .attr("id", "histogram_group")
                        .attr("transform", "translate(100, 100)");;
  
 
  // Text header
  histo_group.append("text")
            .attr("class", "histogram")
            .attr("x", 50)
            .attr("y", 50)
            .style("font-size", "40px")
            .style("opacity", 0)
            .text(function() {
              return "Market: " + d.city;
            });
  
  
  // Test background
  histo_group.append("rect")
              .attr("class", "histogram")
              .attr("height", HISTOGRAM_CONTAINER_HEIGHT)
              .attr("width", HISTOGRAM_CONTAINER_WIDTH)
              .style("fill", "white")
              .style("stroke", "black")
              .style("opacity", 0);
  
  
  // Select correct city data from the queried data
  var buildings = QUERIED_DATA[d.city];
  
  // Get data array from buildings object
  var histo_data = getHistogramData(buildings);
  
  // Populate histogram with data
  makeHistogram(histo_data);
  
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
