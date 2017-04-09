var full_data;
var current_visualization;
var current_sheets;
var current_features;
var visualizations;
var keys;
var vis_model_options;
var new_vis_model_type;



function main(data) {
  initializeContainers(data);
}


function initializeMain(data) {
  
  // Define main container
  var main_container = d3.select("body").append("div").attr("id", "main_container");
  

  // Controls container
  var controls_container = main_container.append("div").attr("id", "controls_container");
  
  // Set header
  controls_container.append("h2").html("Controls");
  
  controls_container.append("div").attr("id", "vis_selection_container");
  
  
  controls_container.append("div")
                      .attr("id", "vis_selection_container");
  
  
  // Update the visualization selection menu
  updateVisualizationList(data);
  
  
  // Create visualization container
  var visualization_container = main_container.append("div").attr("id", "visualization_container");
  visualization_container.append("h3").html(function() { return "Visualization"; });
  
  
  // Create vis model type header container
  visualization_container.append("div").attr("id", "vis_model_header_container");
  
  // Create vis svg container div
  visualization_container.append("div")
                          .attr("id", "vis_svg_div")
                          .style("margin-left", "100px");
  
  // Create vis options container
  visualization_container.append("div").attr("id", "vis_options_container");
  
}



function updateVisualizationList(data) {
  
  // Remove previous list
  d3.select("#visualization_select_menu").remove();
  d3.select("#delete_vis_button").remove();
  d3.select("#make_vis_button").remove();
  d3.select("#new_vis_create_button").remove();
  d3.select("#vis_list_label").remove();
  
  // Visualization Controls
 
  d3.select("#vis_selection_container").append("span")
                      .html("Visualizations: ")
                      .attr("id", "vis_list_label");
  
  // Select vis select container
  var container = d3.select("#vis_selection_container");
  
  // Get current visualizations
  var vis_options = Object.keys(visualizations);
  
  if (vis_options.length == 0) {
    vis_options = ["None"];
  }
  
  // Create Pulldown menu to select current visualization
  container.append("select")
              .attr("id", "visualization_select_menu")
              .selectAll("option")
              .data(vis_options).enter()
            .append("option")
              .text(function (d, i) { return d; });
  
  
  // Add on change functionality to menu - set selected model upon change
  d3.select("#visualization_select_menu")
      .on("change", function(d, i) {
        current_visualization = d3.select(this).property("value");
      });
  
  
  var empty_visualizations = false;
  // Don't display delete and visualize buttons if no visualizations
  if (Object.keys(visualizations).length == 0) {
    empty_visualizations = true;
  }
  
  
  container = d3.select("#controls_container");
  
  if (!empty_visualizations) {
    
    // Create delete button
    container.append("input")
              .attr("type", "button")
              .attr("value", "Delete")
              .attr("id", "delete_vis_button")
              .on("click", function() {
                var confirm_delete = confirm("Are you sure you want to delete visualization?");
                if (confirm_delete) {
                  removeVisualization(data);
                }
              });


    // Create visualize button
    container.append("input")
              .attr("type", "button")
              .attr("value", "Visualize")
              .attr("id", "make_vis_button")
              .on("click", function() {
                current_visualization = d3.select("#visualization_select_menu").property("value");
                updateVisualization(data);
              });
  }
  
  
  // Create visualization button
  container.append("input")
              .attr("type", "button")
              .attr("value", "Add New")
              .attr("id", "new_vis_create_button")
              .on("click", function() {
                createNewVisualization(data);  
                current_visualization = d3.select("#visualization_select_menu").property("value");
              });
}






function updateVisualization(data, remove=false) {
  
  d3.select("#vis_svg_container").remove();
  d3.select("#model_header_text").remove();
  d3.select("#vis_options_container").selectAll("*").remove();
  
  if (!remove) {
    
    d3.select("#vis_model_header_container").append("h5")
              .attr("id", "model_header_text")
              .html(function () { return "Model: " + current_visualization; });
    
    d3.select("#vis_options_container").append("h4").html("Visualization Options");
    
    // Create Feature Selection
    createFeatureSelection(data, feature_num=1);
    
    // Create Feature Selection
    createFeatureSelection(data, feature_num=2);
    
    // Create visualization svg container
    var svg_container = d3.select("#vis_svg_div").append("svg");
    
    svg_container.attr("id", "vis_svg_container")
                  .attr("height", 400)
                  .attr("width", 400)
                  .style("position", "static")
                  .style("margin-right", "100px");

    svg_container.append("rect").attr("height", 400).attr("width", 400).style("fill", "white").style("stroke", "black");
  }
}






function removeVisualization(data) {
  
  if (Object.keys(visualizations).length == 0) {
    return;
  }
  
  current_visualization = d3.select("#visualization_select_menu").property("value");
  delete visualizations[current_visualization];
  console.log(visualizations);
  updateVisualizationList(data);
  updateVisualization(data, remove=true);
  
}





function placeNewVisButton(data) {
  // Create visualization button
  d3.select("#vis_creation_container").append("input")
                      .attr("type", "button")
                      .attr("value", "Create New Visualization")
                      .attr("id", "new_vis_create_button")
                      .on("click", function() {
                        createNewVisualization(data);  
                      });
}




function createNewVisualization(data) {
  
  d3.select("#select_vis_container").remove();
  d3.select("#new_vis_create_button").remove();
  
  var container = d3.select("#vis_selection_container")
                    .append("div")
                    .attr("id", "new_vis_creation_container")
                    .style("margin-top", "20px");
  
  container.append("span").html("New model: ");
  
  // Create dropdown
  container.append("select")
              .attr("id", "new_model_creation_menu")
              .selectAll("option")
              .data(vis_model_options).enter()
            .append("option")
              .text(function (d, i) { return d; })
  
  // Initialize selected vis model type
  new_vis_model_type = vis_model_options[0];
    
  // Add on change functionality to menu - set selected model upon change
  d3.select("#new_model_creation_menu")
      .on("change", function(d, i) {
        new_vis_model_type = d3.select(this).property("value");
      });
  

  // Add confirm selection vis model type
  container.append("input")
            .attr("type", "button")
            .attr("value", "Create")
            .on("click", function() {

              // Update visualizations object
              for (var vis_key in visualizations) {
                if (vis_key.includes(new_vis_model_type)) {
                  if (vis_key[vis_key.length-1] == new_vis_model_type[new_vis_model_type.length-1]) {
                    var mod_vis_type = new_vis_model_type + " 2";
                  }
                  else {
                    var num = parseInt(vis_key[vis_key.length-1]) + 1;
                    var mod_vis_type = new_vis_model_type + " " + num;
                  }
                  visualizations[mod_vis_type] = undefined;
                }
                else {
                  visualizations[new_vis_model_type] = undefined;
                }
              }
    
              if (Object.keys(visualizations).length == 0) {
                visualizations[new_vis_model_type] = undefined;
              }

              updateVisualizationList(data);

              // Remove previous container
              d3.select("#new_vis_creation_container").remove();

              placeNewVisButton(data);

            });
}





function createFeatureSelection(data, feature_num=1) {
  
  d3.selectAll("#feature_"+feature_num+"_select_text").remove();
  
  // Select container
  var container = d3.select("#vis_options_container").append("div")
                                    .attr("id", "feature_"+feature_num+"_container")
                                    .style("float", "left")
                                    .style("margin-bottom", "100px")
                                    .style("margin-right", "100px")
                                    .style("position", "relative");
  
  // Add subheader
  container.append("h4").html(function() { return "Feature " + feature_num });
  
  // Redefine container adding new div to put in text + buttons
  container = container.append("div").attr("id", "sheet_"+feature_num+"_buttons");
  container.append("span").html("Sheet: ");
  
  // Create Pulldown menu to select MODEL type: NEAT or ANN for now
  container.append("select")
              .attr("id", "model_select_menu_"+feature_num)
              .selectAll("option")
              .data(Object.keys(data)).enter()
            .append("option")
              .text(function (d, i) { return d; })
  
  
  // Set default sheet select
      var default_sheet_key = "sheet_"+feature_num;
      var default_sheet = d3.select("#model_select_menu_"+feature_num).property("value");
      current_sheets[default_sheet_key] = default_sheet;
  
  
  // Add on change functionality to menu - set selected model upon change
  d3.select("#model_select_menu_"+feature_num)
      .on("change", function(d, i) {
        var selected_datasheet = d3.select(this).property("value");
        var current_sheet_key = "sheet_"+feature_num;
        current_sheets[current_sheet_key] = selected_datasheet;
        extendDataSelection(data, selected_datasheet, feature_num);
      });
}


function extendDataSelection(data, selected_datasheet, feature_num) {
  
  d3.selectAll("#feature_"+feature_num+"_select_text").remove();
  
  var container = d3.select("#feature_"+feature_num+"_container");
  
  d3.select("#feature_"+feature_num+"_menu_2").remove();
  
  
  container.append("span")
    .html("Feature: ")
    .attr("id", "feature_"+feature_num+"_select_text");
  
  
  for (var key in data) {
    if (key == selected_datasheet) {
      var datasheet_features = Object.keys(data[key]);
      
      // Create Pulldown menu to select MODEL type: NEAT or ANN for now
      container.append("select")
                  .attr("id", "feature_"+feature_num+"_menu_2")
                  .selectAll("option")
                  .data(datasheet_features).enter()
                  .append("option")
                    .text(function (d, i) { return d; });
      
      
      // Set default feature select
      var default_feature_key = "feature_"+feature_num;
      var default_feature = d3.select("#feature_"+feature_num+"_menu_2").property("value");
      current_features[default_feature_key] = default_feature;
      
      
      // Add on change functionality to menu - set selected model upon change
      d3.select("#feature_"+feature_num+"_menu_2")
          .on("change", function(d, i) {
            var selected_feature = d3.select(this).property("value");
            var current_feature_key = "feature_"+feature_num;
            current_features[current_feature_key] = selected_feature;
            var selected_feature_dataset = data[key][selected_feature];
        
          });
    }
  }
}



function initializeData() {
  d3.queue()
    .defer(d3.csv, "data/ZayoHackathonData_Accounts.csv")
    .defer(d3.csv, "data/ZayoHackathonData_CPQs.csv")
    .defer(d3.csv, "data/ZayoHackathonData_Opportunities.csv")
    .defer(d3.csv, "data/ZayoHackathonData_Services.csv")
    .defer(d3.csv, "data/ZayoHackathonData_Sites.csv")
    .await(function(error, accounts, cpqs, opportunities, services, sites) {

      var data = {"accounts" : accounts, 
                  "cpqs" : cpqs, 
                  "opportunities" : opportunities, 
                  "services" : services, 
                  "sites" : sites};
    
      full_data = {"accounts" : {}, 
                   "cpqs" : {}, 
                   "opportunities" : {}, 
                   "services" : {}, 
                   "sites" : {} };
      
      // Populate features of full_data
      for (var key in data) {
        var features = Object.keys(data[key][0]);
        
        for (var feature_index=0; feature_index < features.length; feature_index++) {
         features[feature_index] = features[feature_index].trim();
        }
        
        for (var feature_index=0; feature_index < features.length; feature_index++) {
          
          var feature = features[feature_index].trim();
          full_data[key][feature] = [];
          
          for (var j=0; j < data[key].length; j++) {
            var feature_item = data[key][j][feature];
            full_data[key][feature].push(feature_item);
          }
        }
      }
    
      // Initialization
      initializeMain(full_data);
    
  });
}









function initializeVariables() {
//  visualizations = {"None" : undefined};
  visualizations = {};
  current_visualization = "None";
  keys = {};
  vis_model_options = ["Scatter Plot", "Bar Chart", "Histogram", "Geo"];
  new_vis_model_type = undefined;
  
  current_sheets = {};
  current_features = {};
}


function initialize() {
  initializeVariables();
  initializeData();
}