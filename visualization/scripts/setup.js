var VIS_DIV_HEIGHT = 300;
var VIS_DIV_WIDTH = 400;

var VIS_SVG_CONTAINER_HEIGHT = 600;
var VIS_SVG_CONTAINER_WIDTH = "100%";

var VIS_SVG_BACKGROUND_HEIGHT = 600;
var VIS_SVG_BACKGROUND_WIDTH = "100%";

var visualizations;
var visualization_selections = {};
var VIS_CONTAINER_NUM = 1;
var current_selection;




function createNewVis(vis_num) {
  
  // Clear the create new visualization button
  d3.select("#create_vis_button_"+vis_num).remove();
  
  // Obtain visualization types available
  var visualization_types = Object.keys(visualizations);
  
  // Initialize current selection
  current_selection = visualization_types[0];
  
  // Select vis button div
  var container = d3.select("#vis_"+vis_num+"_button_div");
  
  // Create Pulldown menu to select current visualization
  container.append("select")
              .attr("id", "dropdown_"+vis_num)
              .attr("class", "create_vis_"+vis_num+"_buttons")
              .on("change", function() {
                  current_selection = d3.select(this).property("value");
              })
              .selectAll("option")
              .data(visualization_types).enter()
            .append("option")
              .text(function (d) { return d; })
  
  // Add create button
  container.append("input").data([vis_num])
            .attr("type", "button")
            .attr("value", "Create!")
            .attr("class", function(d) {
              return "create_vis_"+d+"_buttons";
            })
            .on("click", function(d) {
              // Runs respective visualization initializer
              visualizations[current_selection](d);
    
              // Clears create buttons
              d3.selectAll(".create_vis_"+d+"_buttons").remove();
            });
  
  
  // Create Reset button
  container.append("input").data([vis_num])
            .attr("type", "button")
            .attr("value", "Reset")
            .attr("id", function (d) {
              return "reset_button_"+d;
            })
            .on("click", function(d) { 
    
              // Clears the visualization svg
              clearVisualization(d); 
    
              // Clears the googlemap, if open
              closeGoogleMap();
    
              // Adds New Vis button
              var container = d3.select("#vis_"+d+"_button_div");
              container.append("input").data([vis_num])
                  .attr("id", function(d) {
                    return "create_vis_button_"+d;
                  })
                  .attr("type", "button")
                  .attr("value", "Create New Visualization")
                  .on("click", function(d) {
                    createNewVis(d);
                  });
            });
}


function clearVisualization(vis_num) {
  // Removes svg container
  d3.select("#vis_"+vis_num+"_svg_container").remove();
  
  // Creates new BLANK svg container 
  createSVGContainer(vis_num);
  
  // Remove clear button
  d3.select("#reset_button_"+vis_num).remove();

  // Remove back button
  d3.select("#back_button_"+vis_num).remove();

  // Clears create buttons
  d3.selectAll(".create_vis_"+vis_num+"_buttons").remove();
}



function createSVGContainer(vis_num) {
  
  // Select div container
  var div_container = d3.select("#vis_"+vis_num+"_svg_div");
  
  // Create svg container
  var svg_container = div_container.append("svg")
                                    .attr("id", "vis_"+vis_num+"_svg_container")
                                    .attr("height", VIS_SVG_CONTAINER_HEIGHT)
                                    .attr("width", VIS_SVG_CONTAINER_WIDTH);

  
  // Add background to svg
  svg_container.append("rect")
                  .attr("height", VIS_SVG_BACKGROUND_HEIGHT)
                  .attr("width", VIS_SVG_BACKGROUND_WIDTH)
                  .style("fill", "white")
                  .style("stroke", "black");
  
}




function setupVisContainer(vis_num) {
  
  /* 
  // ------------------------------------- Setup DIVS -------------------------------------
  */
  // new VIS DIV
  var vis_div = d3.select(".vis_wrapper").append("div")
                            .attr("id", "vis_"+vis_num+"_div");
  
  // BUTTON DIV
  var vis_button_div = vis_div.append("div").attr("id", "vis_"+vis_num+"_button_div");
  
  // SVG DIV
  var vis_svg_div = vis_div.append("div").attr("id", "vis_"+vis_num+"_svg_div");
  // --------------------------------------------------------------------------------------
  
  
  // Create Vis Button
  vis_button_div.append("input").data([vis_num])
                  .attr("id", function(d) {
                    return "create_vis_button_"+d;
                  })
                  .attr("type", "button")
                  .attr("value", "Create New Visualization")
                  .on("click", function(d) {
                    createNewVis(d);
                  });

  // Create vis svg container
  createSVGContainer(vis_num);
  
}


function initialize() {
  
  // Setup main div
  var main_div = d3.select("#main_div");
  
  // Setup vis wrapper
  var vis_wrapper = main_div.append("div").attr("class", "vis_wrapper");
 
  // Create x number of visualization containers
  for (var vis_num=1; vis_num <= VIS_CONTAINER_NUM; vis_num++) {
    var vis_container_id = "vis_"+vis_num+"_div";
    visualization_selections[vis_container_id] = undefined;
    setupVisContainer(vis_num);
  }
  
  // Initialize visualizations
  visualizations = {"Geo" : initializeVis_2, "Vis 2" : undefined, "Vis 3" : undefined};
}

