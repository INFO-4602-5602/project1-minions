var VIS_DIV_HEIGHT = 300;
var VIS_DIV_WIDTH = 400;

var VIS_SVG_CONTAINER_HEIGHT = 600;
var VIS_SVG_CONTAINER_WIDTH = "100%";

var VIS_SVG_BACKGROUND_HEIGHT = 600;
var VIS_SVG_BACKGROUND_WIDTH = "100%";

var VIS_CONTAINER_NUM = 6;

var system_busy = false;


var spinner;
var data_load_sim_time = 1000;



function addRemoveSetupButtons(vis_num=1) {
  
  // Clear the create new visualization button
  d3.select("#create_vis_button").transition().duration(550).style("opacity", 0);
  
  d3.select("#reset_button").remove();
  setTimeout(function() { 
    d3.select("#create_vis_button").remove();
  }, 600);
  

  // Create Reset button
  var container = d3.select("#vis_"+vis_num+"_button_div");
  container.append("input").data([vis_num])
            .attr("type", "button")
            .attr("value", "Reset")
            .style("opacity", 0)
            .attr("id", "reset_button")
            .on("click", function(d) { 
    
              // Clears the visualization svg
              clearVisualization(d); 
    
              // Clears the googlemap, if open
              closeGoogleMap();
    
              // Adds New Vis button
              var container = d3.select("#vis_"+d+"_button_div");
              container.append("input").data([vis_num])
                  .attr("id", function(d) {
                    return "create_vis_button";
                  })
                  .attr("type", "button")
                  .attr("value", "Create New Visualization")
                  .on("click", function(d) {
                    if (system_busy) { console.log("BUSY!"); return; }
                    initializeMainVisData();
                  });
            })
            .transition().duration(550).style("opacity", 1);
  
  
  
}



function clearVisualization(vis_num) {
  // Removes svg container
  d3.select("#vis_"+vis_num+"_svg_container").remove();
  
  // Creates new BLANK svg container 
  createSVGContainer(vis_num);
  
  // Remove clear button
  d3.select("#reset_button").remove();

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




function setupVisContainer(vis_num,row_div) {
  
  /* 
  // ------------------------------------- Setup DIVS -------------------------------------
  */
  // new VIS DIV

  var vis_div = row_div.append("div")
                            .attr("id", "vis_"+vis_num+"_div")
                            .attr("class", "vis_div six columns well");
  
  
  
  
  // BUTTON DIV
  var vis_button_div = vis_div.append("div").attr("id", "vis_"+vis_num+"_button_div");
  
  if (vis_num === 1) {
    // Create Vis Button
    vis_button_div.append("input").data([vis_num])
                    .attr("id", function(d) {
                      return "create_vis_button";
                    })
                    .attr("type", "button")
                    .attr("value", "Create New Visualization")
                    .on("click", function(d) {
                      if (system_busy) { console.log("BUSY!"); return; }

                      initializeMainVisData();
                    });
  }
  
  // SVG DIV
    var vis_svg_div = vis_div.append("div").attr("id", "vis_"+vis_num+"_svg_div");

  // Create vis svg container
  createSVGContainer(vis_num);
  
}



function initializeMainVisData() {
  
  // Flag system as busy
  system_busy = true;
  
  // Update create_vis_button button
  d3.select("#create_vis_button").attr("value", "Collecting Data...");
  
  var target = document.getElementById("loading_data_div");
  
  // Set spinner target
  spinner.spin(target);
  
  // AJAX WILL GO HERE

  $.get("/market_profits",function (data) {
    spinner.stop();
    system_busy=false;
    addRemoveSetupButtons();
    initializeMainVisualization(data);
  });
}


function spinnerSetup() {
  // Define spinner options
  var spinner_options = {
                lines: 13 // The number of lines to draw
              , length: 28 // The length of each line
              , width: 14 // The line thickness
              , radius: 0 // The radius of the inner circle
              , scale: 1.5 // Scales overall size of the spinner
              , corners: 1 // Corner roundness (0..1)
              , color: '#ff9933' // #rgb or #rrggbb or array of colors
              , opacity: 0.25 // Opacity of the lines
              , rotate: 0 // The rotation offset
              , direction: 1 // 1: clockwise, -1: counterclockwise
              , speed: 1 // Rounds per second
              , trail: 60 // Afterglow percentage
              , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
              , zIndex: 2e9 // The z-index (defaults to 2000000000)
              , className: 'spinner' // The CSS class to assign to the spinner
              , top: '50%' // Top position relative to parent
              , left: '50%' // Left position relative to parent
              , shadow: false // Whether to render a shadow
              , hwaccel: false // Whether to use hardware acceleration
              , position: 'absolute' // Element positioning
            };
  
  // Define spinner
  spinner = new Spinner(spinner_options);
}

function initialize() {
  
  // Setup data load spinner
  spinnerSetup();


  // Setup div for loading spinner 
  d3.select("body").append("div").attr("id", "loading_data_div");
  
  
  
  // Create 6 containers
  for (var vis_num=1; vis_num <= VIS_CONTAINER_NUM; vis_num++) {
    var row_div = d3.select("#vis_row" + (1+(Math.floor((vis_num-1)/2))));
    setupVisContainer(vis_num,row_div);
  }
  
}

