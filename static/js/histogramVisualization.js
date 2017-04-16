// http://stackoverflow.com/questions/37812922/grouped-category-bar-chart-with-different-groups-in-d3
// https://plnkr.co/edit/L0eQwtEMQ413CpoS5nvo?p=preview
// https://bl.ocks.org/mbostock/3048450


var current_building_histogram_selection;
var HISTOGRAM_CONTAINER_HEIGHT = 300;
var HISTOGRAM_CONTAINER_WIDTH = 600;


function initializePullDownMenu(d) {
  // Create Pulldown menu to filter google map
  var pulldown_1 = d3.select("#vis_3_button_div");
  
  
  buildingHistogramOptions = ["Build Cost", "Profit", "Net Proximity"];
  
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


function makeHistogram(buildings) {
  
  
  // Get data
  var histo_data = []
  for (var i=0; i < buildings.length; i++) {
    var current_building = buildings[i];
    current_building_histogram_selection = current_building_histogram_selection.toLowerCase();
    var current_data = current_building[current_building_histogram_selection];
    histo_data.push(current_data);
  }
  
  console.log(histo_data);
  
  // Set group
  var histo_group = d3.select("#histogram_group");
  
  var margin = {top: 10, right: 30, bottom: 30, left: 30};
  var histo_width = HISTOGRAM_CONTAINER_WIDTH;
  var histo_height = HISTOGRAM_CONTAINER_HEIGHT;
  
  
  // set the ranges
  var x = d3.scaleLinear()
              .rangeRound([0, histo_width]);
  
  var bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(10))
                (histo_data);
  
  var y = d3.scaleLinear()
              .domain([0, d3.max(bins, function(d) { return d.length; })])
              .range([histo_height, 0]);

  
  
  var bar = histo_group.selectAll("g.bar")
                          .data(bins).enter()
                          .append("g")
                          .attr("class", "bar")
                          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
                            
  bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
//    .attr("height", function(d) { return histo_height - y(d.length); });
    .attr("height", function(d) {
      console.log(d);
      console.log(d.length);
      console.log(y(d.length));
      return histo_height; 
    });

}



function initializeHistogram(d) {
  
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
              return "Current Market: " + d.city;
            });
  
  
  // Test background
  histo_group.append("rect")
              .attr("class", "histogram")
              .attr("height", HISTOGRAM_CONTAINER_HEIGHT)
              .attr("width", HISTOGRAM_CONTAINER_WIDTH)
              .style("fill", "white")
              .style("stroke", "black")
              .style("opacity", 0)
  
 
  
  // Populate histogram with data
  var buildings = QUERIED_DATA[d.city];
  makeHistogram(buildings);
  
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
