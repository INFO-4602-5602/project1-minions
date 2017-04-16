// http://stackoverflow.com/questions/17992543/how-do-i-drag-an-image-smoothly-around-the-screen-using-pure-javascript
// http://jsfiddle.net/vZv5k/

// http://stackoverflow.com/questions/7044587/adding-multiple-markers-with-infowindows-google-maps-api

var googleMouseOverInterval;
var currentGoogleMapCity;
var google_map_zoomed = false;
var google_map_on = false;
var google_map_minimized = false;

var map;
var draggingGoogleMap = false;

var FILTER_BACKGROUND = "#FEFEFA";

var transition_timeout;
var current_filter, current_filter_id;

var map_filters = {"On Zayo" : undefined,
                   "Network Proximity" : undefined,
                   "Estimated Build Cost" : undefined};


var buildingCircleColor = "#00ff00";
var buildingCircleStroke = "#0000ff";


var infowindow;

function closeGoogleMap() {
  d3.selectAll(".google_map_container").transition().duration(1000).style("opacity", 0).remove();  
  d3.selectAll(".google_map_buttons").transition().duration(1000).style("opacity", 0).remove();  
  google_map_on = false;
}



function createGoogleMap(google_map_div, d, vis_container_id) {
  
  // Set current market, state lat, and state lon
  var state_lat = d.lat;
  var state_lon = d.lon;
  
  // Set default - map not zoomed
  google_map_zoomed = false;
  
  // Create the Google Map…
  map = new google.maps.Map(google_map_div.node(), {
      zoom: 9,
      center: new google.maps.LatLng(state_lat, -1*state_lon),
      mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  
  // Generate buildings
  generateBuildingsOnMap(google_map_div, d, vis_container_id);
  
}



function filterTopXBuildings(N=10) {
  return true;
}
          
function generateBuildingsOnMap(google_map_div, d, vis_container_id) {
  
  // Set current market 
  var current_market = d.city;
  
  // USE THE QUERY DATA HERE
  var CURRENT_BUILDINGS = QUERIED_DATA[current_market];
  
  
  for (var building in CURRENT_BUILDINGS) {
    
    var plot_building = filterTopXBuildings();
    if (!plot_building) {
      continue;
    }
    
    var building_data = CURRENT_BUILDINGS[building];
    
  // FILTER TOP 10  
//    var plot_building = checkBuilding(data, building);
//    if (!plot_building) {
//      continue;
//    }
//  
  
  
    // Define city parameters
//    var buildingCircleColor = (data[building].on_zayo == "Yes") ? "#00FF00" : "#FF0000";
    
    // Get building lat, lon and store it into myLatlng
    var building_lat = building_data.lat;
    var building_lon = building_data.lon;
    
    var myLatlng = {"lng" : building_lon, "lat" : building_lat};
    
    
    // Add the circle for this city to the map.
    var buildingCircle = new google.maps.Circle({
      strokeColor: buildingCircleStroke,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: buildingCircleColor,
      fillOpacity: 0.35,
      map: map,
      title: undefined,
      center: myLatlng,
      radius: 2500,
      
      // Custom attributes
      building_id: building_data["building-id"],
      build_cost: building_data["build cost"],
      net_proximity: building_data["net prox"],
      profit: building_data["profit"],
      
    });
    
    

    
    
    // CITY CLICK
    buildingCircle.addListener('click', function() {
        
        // Remove interval behavior, if any;
        clearInterval(googleMouseOverInterval);
      
        if (google_map_zoomed) {
          google_map_zoomed = false;
          createGoogleMap(google_map_div, d, vis_container_id);
          MoveBackToMap(vis_container_id);
          currentGoogleMapCity = undefined;
        }
        else {
          // ACTIVATE CLICK
          // set flags
          google_map_zoomed = true;

          // update the current google map city
          currentGoogleMapCity = this;

          // Setup the back button
          setupBackButton(2);


          map.setZoom(15);
          var zoom_level = 15;
          map.setCenter(this.getCenter());

          this.setRadius(40);
          this.setOptions({fillOpacity : 0.5});
        }
    });



    // CITY MOUSEOVER
    buildingCircle.addListener('mouseover', function() {
      
      
      // Get circle info for infowindow;
      var building_id = buildingCircle.building_id;
      var build_cost = buildingCircle.build_cost;
      var net_proximity = buildingCircle.net_proximity;
      var profit = buildingCircle.profit;
      
      // Info window
      infowindow_content = '<h1> Building Information </h1>' +
                            '<p> Building ID: ' + building_id + '</p>' + 
                            '<p> Build Cost: ' + build_cost + '</p>' + 
                            '<p> Net Proximity: ' + net_proximity + '</p>' + 
                            '<p> Profit: ' + profit + '</p>';
      
      infowindow = new google.maps.InfoWindow( {
                            content: infowindow_content,
                            pixelOffset: {width: 200, height: 200, j: "px", f: "px"}
                          });

      infowindow.open(map, buildingCircle);
      
      
      // Set hover parameters
      var direction, rMin, rMax, time_interval, expansion_factor;
      
      direction = 1;
      
      // Check if zoomed or not
      if (!google_map_zoomed) {
        currentGoogleMapCity = this;
        rMin = 2000;
        rMax = 3000;
        time_interval = 50;
        expansion_factor = 50;
      }
      else {
        rMin = 10;
        rMax = 100;
        time_interval = 50;
        expansion_factor = 5;
      }


      googleMouseOverInterval = setInterval(function() {
        try {
          var radius = currentGoogleMapCity.getRadius();
          if ((radius > rMax) || (radius < rMin)) {
              direction *= -1;
          }
          currentGoogleMapCity.setRadius(radius + direction * expansion_factor);
        }
        catch(err) {
          return;
        }  
      }, time_interval);
    });


    // CITY MOUSEOUT
    buildingCircle.addListener('mouseout', function() {
      infowindow.close();
      infowindow = undefined;
      if (currentGoogleMapCity == undefined) {
        return;
      }
      
      clearInterval(googleMouseOverInterval);
      
      // Reset radius
      var default_radius = (google_map_zoomed) ? 40 : 2500;
      currentGoogleMapCity.setRadius(default_radius);
      
      currentGoogleMapCity = (google_map_zoomed) ? currentGoogleMapCity : undefined;
    });
  }
}





function setupFilters(google_map_filter_div) {
  
  var filter_names = Object.keys(map_filters);

  // Create Pulldown menu to filter google map
  var pulldown_1 = d3.select("#dropdown_1_div");

  pulldown_1.append("select")
                  .attr("id", "filter_pulldown_1")
                  .on("change", function() {
    
                      // Remove previous
                      d3.select("#"+current_filter_id+"_filter_area_div")
                          .transition().duration(200)
                        .style("display", "none")
                        .style("opacity", 0.0)
                        .style("zIndex", "-1");
                      
                      // Fade in new selected - update current filter
                      current_filter = d3.select(this).property("value");
                      current_filter_id = current_filter.split(" ").join("_");
                      d3.select("#"+current_filter_id+"_filter_area_div")
                          .transition().duration(200)
                        .style("display", "inline")
                        .style("opacity", 1.0)
                        .style("zIndex", "99");
                  })
                  .selectAll("option")
                  .data(filter_names).enter()
                .append("option")
                  .text(function (d, i) { return d; });
  
  var index = 0;
  for (var filter in map_filters) {
    // Set filter id
    var filter_id = filter.split(" ").join("_");
    
    // Set default display
    var opacity_value = (index == 0) ? 1 : 0;
    var display_value = (index == 0) ? "inline" : "none";
    var zIndex_value = (index == 0) ? "99" : "-1";
    // Set default current_filter and id
    if (index == 0) {
      current_filter = filter;
      current_filter_id = filter_id;
    }
    
    
    // Create divs
    var filter_area_div = google_map_filter_div.append("div")
              .attr("id", filter_id+"_filter_area_div")
              .style("display", display_value)
              .style("opacity", opacity_value)
              .style("zIndex", zIndex_value);
    
    var form_data = ["Yes", "No "];
        
    // Add forms to divs
    filter_area_div.selectAll("input")
      .data(form_data).enter()
      .append("label")
        .attr("for", function(d, i) { return "a" + i; })
        .text(function(d) { return d; })
        .style("display", "inline")
        .style("position", "relative")
        .style("padding-right", "20px")
        .style("top", "-100px")
        .style("left", "50px")
    
      .append("input")
        .attr("type", "checkbox")
        .attr("checked", true)
        .attr("name", "name")
        .attr("value", "value")
    
    index++;
  }
}





function initializeGoogleMap(i, d) {
  
  
  
  // Remove previous buttons
  d3.selectAll(".google_map_buttons").remove();
  
  // Flag map as turned on
  google_map_on = true;
  google_map_minimized = false;
  
  // Setup google div
  var google_map_container = d3.select("#vis_"+i+"_svg_div")
                                .append("div")
                                .attr("id", "google_map_container_"+i)
                                .attr("class", "google_map_container")
                                .style("opacity", 0);

  
  
  // Setup div for buttons
  var map_button_div = d3.select("#vis_"+i+"_button_div");
  
  
  // Setup div for google map
  var google_map_div = google_map_container.append("div")
                                            .attr("id", "google_map_"+i)
                                            .attr("class", "google_map");
  
  
  // Setup div for filter
  var google_map_filter_div = google_map_container.append("div")
                                            .attr("id", "google_map_filter_"+i)
                                            .attr("class", "geoToolTip");
  
  
  
  // Setup filter area
  var filter_area_div = google_map_filter_div.append("div").attr("id", "filter_area_div");
  
  
  // Setup filter area background    
  var filter_area_svg = filter_area_div.append("svg")
                                        .attr("class", "filter_area_svg");
  
  
  // Add group for backgrounds
  filter_area_svg.append("g")
                  .append("rect")
                    .attr("id", "filter_background_svg")
                    .style("fill", FILTER_BACKGROUND)
                    .style("stroke", "black")
                    .style("opacity", 0.75);
  
  
  
  
  // Setup div for dropdown
  filter_area_div.append("div")
                    .attr("id", "dropdown_1_div");
  
  
  
  // Setup Apply filter button in filter area
  filter_area_div.append("div")
                    .attr("id", "filter_apply_button_div")
                  .append("input")
                    .attr("id", "filter_button_2")
                    .attr("type", "button")
                    .attr("value", "Apply Filter");
  
  // Setup Filters
  setupFilters(google_map_filter_div);
  

  // Load the station data
  createGoogleMap(google_map_div, d, i);
  
  
  
  // Add map minimize button
  map_button_div.append("input").data([i])
    .attr("id", "min_max_map_button")
    .attr("class", "google_map_buttons")
    .attr("type", "button")
    .attr("value", "Hide Map")
    .style("opacity", 0)
    .on("click", function(d) {
      
      // Ensure that map doesn't get messed up if in middle of transition
      if (transition_timeout) return;
    
      // OPEN MAP 
      if (google_map_minimized) {
        
        // Reopen map
        d3.selectAll(".geoToolTip, #google_map_container_"+d)
            .transition().duration(750)
              .style("display", "block")
              .style("opacity", 1.0);
        
        
        
        // Reopen buttons
        d3.selectAll("#city_view_button, #min_max_filter_button")
            .transition().duration(750)
              .style("display", "inline")
              .style("opacity", 1.0);
        
        
        // change value to Hide map
        d3.select(this).property("value", "Hide Map");
      }
    
      // CLOSE MAP
      else {
        
        // Minimize map
        d3.selectAll(".geoToolTip, #google_map_container_"+d)
          .transition().duration(750)
            .style("opacity", 0);
        
        
        d3.selectAll("#city_view_button, #min_max_filter_button")
          .transition().duration(750)
            .style("opacity", 0);
        
        transition_timeout = true;
        
        // change value to Show map
        var this_map = d3.select(this);
        this_map.property("value", "Hiding Map...");
        setTimeout(function() {
          
          // Transition containers
          d3.selectAll(".geoToolTip, #google_map_container_"+d).style("display", "none");
          d3.selectAll("#city_view_button, #min_max_filter_button").style("display", "none");
          
          // Set timeout to false
          transition_timeout = false;
          
          // change value to Show map
          this_map.property("value", "Show Map");
        }
        , 1000);
      }
    
      // Update flag
      google_map_minimized = !google_map_minimized;
    
    });
  
  
  
  
  
  // Add filter minimize button
  map_button_div.append("input").data([i])
    .attr("id", "min_max_filter_button")
    .attr("class", "google_map_buttons")
    .attr("type", "button")
    .attr("value", "Hide Filter")
    .style("opacity", 0)
    .on("click", function(d) {
      if (map_filter_minimized) {
        
        // Set flag
        map_filter_minimized = false;
        
        // Reopen map
        d3.select("#google_map_filter_"+d).style("visibility", "visible");
        
        // change value to -
        d3.select(this).property("value", "Hide Filter");
      }
      else {
        
        // Set flag
        map_filter_minimized = true;
        
        // Minimize map
        d3.select("#google_map_filter_"+d).style("visibility", "hidden");
        
        // change value to +
        d3.select(this).property("value", "Show Filter");
      }
    });
  
  
  
  // Add button goes back to city view
  map_button_div.append("input").data([i])
    .attr("id", "city_view_button")
    .attr("class", "google_map_buttons")
    .attr("type", "button")
    .attr("value", "City View")
    .style("opacity", 0)
    .on("click", function(d) {
    
    
      createGoogleMap(google_map_div, d, i);
    });
  
 
  
  // Set transition on map container
  d3.selectAll(".google_map_buttons").transition().duration(750).style("opacity", 1);
  google_map_container.transition().delay(200).duration(1000).style("opacity", 1);
}



function checkBuilding(data, building) {

  var current_building = data[building];
  var on_zayo = current_building.on_zayo;
  
  var return_val = (on_zayo == "Yes") ? true : false;
  
  return return_val;
}








function initializeGoogleMaps(d, object_this) {
  
  // CHECK IF MAP ALREADY ON - IF YES, CLOSE
  if (google_map_on) {
    
    // Close map
    closeGoogleMap();

    var current_city = Object.keys(selected_city)[0];
    selected_city[current_city].style.fill = city_color_unselected;
    selected_city[current_city].style.stroke = null;

    selected_city = {};
    
    
    // CHECK IF OTHER MAP OPEN - CLOSE IT, OPEN NEW ONE
    if (current_city != d.city) {
      setTimeout(function() {
        cityClickPrimer(d, object_this);  
      }, 1000)
    }
    
    // Turn off city text
    d3.select("#city_text_"+current_city).transition().duration(750).style("opacity", 0).style("display", "hidden");
    
    // Remove filter information
    removeFilterInfo();
  }
  
  // OPEN MAP
  else {
    // Open map
    initializeGoogleMap(2, d);

    // Set city to selected color
    object_this.style.stroke = "black";
    object_this.style.fill = city_color_selected;

    // Set current city
    selected_city[d.city] = object_this;

    // Turn on text
    d3.select("#city_text_"+d.city).transition().duration(750).style("opacity", 1).style("display", "inline");
    
    // Add filter information
    addFilterInfo();
  }
}
