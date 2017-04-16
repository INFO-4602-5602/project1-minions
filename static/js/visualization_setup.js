var VIS_SVG_CONTAINER_HEIGHT = 600;
var VIS_SVG_CONTAINER_WIDTH = "100%";

var VIS_SVG_BACKGROUND_HEIGHT = 600;
var VIS_SVG_BACKGROUND_WIDTH = "100%";

var visualizations;

var visualization_selections = {};
var VIS_NUM = 1;
var current_visualization;
var current_selection;





function createDropDownSelection(i, container, new_id, selections) {
  
  // Create Pulldown menu to select current visualization
  container.append("select")
              .attr("id", new_id)
              .attr("class", "create_vis_"+i+"_buttons")
              .on("change", function(d, i) {
                  current_selection = d3.select(this).property("value");
              })
              .selectAll("option")
              .data(selections).enter()
            .append("option")
              .text(function (d, i) { return d; })
              
}


function createNewVis(i) {
  d3.select("#create_vis_button_"+i).remove();
  
  // Obtain visualization types available
  var visualization_types = Object.keys(visualizations);
  
  // Initialize current selection
  current_selection = visualization_types[0];
  
  // Select container
  var container = d3.select("#vis_"+i+"_button_div");
  
  // Create dropdown selection menu
  createDropDownSelection(i, container, "dropdown_"+i, visualization_types);
  
  // Add create button
  container.append("input").data([i])
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
  container.append("input").data([i])
            .attr("type", "button")
            .attr("value", "Reset")
            .attr("id", function (d) {
              return "reset_button_"+d;
            })
            .on("click", function(d) { 
              // Clears the visualization svg
              clearVisualization(d); 
    
              // Remove clear button
              d3.select("#reset_button_"+d).remove();
    
              // Remove back button
              d3.select("#back_button_"+d).remove();
              
              // Clears create buttons
              d3.selectAll(".create_vis_"+d+"_buttons").remove();
    
              // Adds New Vis button
              var container = d3.select("#vis_"+d+"_button_div");
              container.append("input").data([i])
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


function clearVisualization(i) {
  d3.select("#vis_"+i+"_svg_container").remove();
  createSVGContainer(i);
}



function createSVGContainer(i) {
  
  // Select div container
  var div_container = d3.select("#vis_"+i+"_svg_div");
  
  // Create svg container
  var svg_container = div_container.append("svg")
                                    .attr("id", "vis_"+i+"_svg_container")
                                    .attr("height", VIS_SVG_CONTAINER_HEIGHT)
                                    .attr("width", VIS_SVG_CONTAINER_WIDTH);

  
  // Add background
  svg_container.append("rect")
                  .attr("height", VIS_SVG_BACKGROUND_HEIGHT)
                  .attr("width", VIS_SVG_BACKGROUND_WIDTH)
                  .style("fill", "white")
                  .style("stroke", "black");
  
}




function setupVisContainer(vis_wrapper, i) {
  
  var vis_div = vis_wrapper.append("div")
                            .attr("id", "vis_"+i+"_div")
                            .attr("height", 300)
                            .attr("width", 400);
  
  // Create div in vis_x_div for buttons and for svg container
  var vis_button_div = vis_div.append("div").attr("id", "vis_"+i+"_button_div");
  var vis_svg_div = vis_div.append("div").attr("id", "vis_"+i+"_svg_div");
  
  
  // Create button
  vis_button_div.append("input").data([i])
                  .attr("id", function(d) {
                    return "create_vis_button_"+d;
                  })
                  .attr("type", "button")
                  .attr("value", "Create New Visualization")
                  .on("click", function(d) {
                    createNewVis(d);
                  });

  
  // Create vis svg container
  createSVGContainer(i);
}


function initializeContainers() {
  // Setup main div
  var main_div = d3.select("#viz").append("div").attr("id", "main_div");
  
  // Setup controls div
  var controls_div = main_div.append("div").attr("id", "controls_div");
  
  // Setup vis containers
  var vis_wrapper = main_div.append("div").attr("class", "vis_wrapper");
 
  vis_wrapper.classed("vis_wrapper", true);
  for (var i=1; i <= VIS_NUM; i++) {
    var key_id = "vis_"+i+"_div";
    visualization_selections[key_id] = undefined;
    setupVisContainer(vis_wrapper, i);
  }
  
  // Initialize visualizations
  visualizations = {"Geo" : initializeVis_2, "Vis 2" : undefined, "Vis 3" : undefined};
}


function initialize() {
  console.log("HERE");
  initializeContainers();
}