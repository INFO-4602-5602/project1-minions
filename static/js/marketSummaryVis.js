


function writeStats(stats) {
  
  // Clear previous writing
  d3.select(".summary").remove();
  
  // Set svg cotainer
  var svg_container = d3.select("#vis_4_svg_container");
  
  // Declare states group
  var stats_group = svg_container.append("g").attr("class", "summary");
  
  // Write out the summary text
  stats_group.append("text")
              .selectAll("tspan")
                .data(stats).enter()
              .append("tspan") 
                .attr("x", 5)
                .attr("y", function(d, i)
                {
                  return 30 + i*30;
                })
                .attr("transform", "translate(20, 0)")
                .text(function(d) { return d; })
                .on("mouseover", function()
                {
                  d3.select(this)
                        .style("font-size", "20px");
                })
                .on("mouseout", function()
                {
                  d3.select(this)
                        .style("fill", "black")
                        .style("font-size", "16px");
                })
                .on("click", function(d)
                {
                  
                });
}


function calculateSummaryStats(d) {
  
  // Select correct city data from the queried data
  var buildings = QUERIED_DATA[d.city];
  
  // Initialize average values to 0
  var average_network_prox = 0.0;
  var average_build_cost = 0.0;
  var average_profit = 0.0;
  var total_profit = 0.0;
  
  // Initialize num of buildings
  var num_buildings = buildings.length
  
  for (var i=0; i < num_buildings; i++) {
    var current_building = buildings[i];
    // Average network prox  
    average_network_prox += current_building["net prox"] / num_buildings;
    
    // Average build cost
    average_build_cost += current_building["build cost"] / num_buildings;
    
    // Total profit
    total_profit += current_building["profit"];
  }
  
  // Average profit
  average_profit = total_profit / num_buildings;
  
  var stats = ["Number of Buildings: " + num_buildings,
               "Number of Accounts: " + "ADD TO QUERY RETURN",
               "Number of Sites: " + "ADD TO QUERY RETURN",
               "Average build cost: " + average_build_cost,
               "Average network proximity: " + average_network_prox,
               "Average profit: " + average_profit,
               "Total Profit: " + total_profit];
  
  return stats;
}


function initializeMarketSummary(d, object_this) {
//  No: Accounts
//  No: Sites
//  No: Buildings
//  Total Profit
//  Top Product Group
//  Average network prox
//  Average build cost
  
  
  // Clear previous
  d3.selectAll(".summary").remove();
  
  // Initialize the histogram
  var market_stats = calculateSummaryStats(d);
  
  // Write the stats
  writeStats(market_stats);
}

