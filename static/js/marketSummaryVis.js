


function writeStats(stats) {
  
  // Clear previous writing
  d3.select(".summary").remove();
  
  // Set svg cotainer
  var svg_container = d3.select("#vis_1_svg_container");
  
  // Declare states group
  var stats_group = svg_container.append("g")
        .attr("class", "summary")
        .attr("transform", "translate(830,340)");

  stats_group.append("rect")
        .attr("height", 250)
        .attr("width", 290)
        .style("fill", "white")
        .style("stroke", "black")
        .style("opacity", "0.5");

  // Write out the summary text

  stats_group.append("text")
        .attr("x", 70)
        .attr("y", 30)
        .text("Summary")
        .style("font-size", "28px")
        .style("fill", "black");

  stats_group.append("text")
            .selectAll("tspan")
            .data(stats).enter()
            .append("tspan")
            .attr("x", 30)
            .attr("y", function(d, i)
            {
              return 60 + i*30;
            })
            .attr("transform", "translate(20, 0)")
            .style("fill", "black")
            .style("font-size", "10px")
            .text(function(d) { return d; });
}


function calculateSummaryStats(d) {
  
  // Select correct city data from the queried data
  var buildings = QUERIED_DATA[d.city];
  
  // Initialize average values to 0
  var average_network_prox = 0.0;
  var average_build_cost = 0.0;
  var average_profit = 0.0;
  var total_profit = 0.0;
  var accounts = new Set();
  var n_sites = 0;
  
  // Initialize num of buildings
  var num_buildings = buildings.length;
  
  for (var i=0; i < num_buildings; i++) {
    var current_building = buildings[i];
    // Average network prox  
    average_network_prox += current_building["network_proximity"] / num_buildings;
    
    // Average build cost
    average_build_cost += current_building["estimated_build_cost"] / num_buildings;
    
    // Total profit
    total_profit += current_building["profit"];
    for(var j=0;j<current_building["accounts"].length;j++){
        accounts.add(current_building["accounts"][j]);
    }
    n_sites += current_building["sites"].length;
  }
  
  // Average profit
  average_profit = total_profit / num_buildings;
  
  var stats = ["Number of Buildings: " + num_buildings,
               "Number of Accounts: " + accounts.size,
               "Number of Sites: " + n_sites,
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

