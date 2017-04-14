// Reference: https://github.com/d3/d3-geo
// Example 1: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
// https://anthonyskelton.com/2016/d3-js-version-4/
// Scroll and grab - zoom into state: https://bl.ocks.org/mbostock/2374239
// Smooth zoom transitions THIS: https://bl.ocks.org/mbostock/9656675 (v3)
      // https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2 (v4)

// GOOGLE MAP OVERLAY! http://bl.ocks.org/donmccurdy/bd239cc355de227b1104503fc9d435d2
// Google map api circles click: https://developers.google.com/maps/documentation/javascript/examples/circle-simple
// Animate Google Map API objects: http://stackoverflow.com/questions/23095685/how-to-animate-google-maps-api-circle

// Z-index: https://developer.mozilla.org/en/docs/Web/CSS/z-index

var tool_tip_minimized, map_filter_minimized;
var cities_off = false;
var tree_mode = false;
var google_map_on = false;
var google_map_minimized = false;

var city_color_selected = '#00ff00';
var city_color_hover = "#00FFFF";
var city_color_unselected = "rgb(217,91,67)";

var selected_state;
var selected_city = {};

var tooltip_width = 300;
var tooltip_height = 200;

var width = 1000;
var height = 600;

var googleMouseOverInterval;
var currentGoogleMapCity;
var google_map_zoomed = false;


var test_data = {"Colorado" : { "Denver" : [{"id" : "1", "lat" : 39.2392, "lon" : 104.4903, "on_zayo" : "no"},
                                            {"id" : "2", "lat" : 39.7692, "lon" : 104.5903, "on_zayo" : "yes"},
                                            {"id" : "3", "lat" : 39.5392, "lon" : 104.3703, "on_zayo" : "yes"},
                                            {"id" : "4", "lat" : 39.7392, "lon" : 104.2903, "on_zayo" : "yes"},
                                            {"id" : "2", "lat" : 39.7632, "lon" : 104.3903, "on_zayo" : "no"},
                                            {"id" : "3", "lat" : 39.5232, "lon" : 104.372203, "on_zayo" : "yes"},
                                            {"id" : "4", "lat" : 39.532, "lon" : 104.233, "on_zayo" : "yes"}
                                           ]
                              },
                 "Texas" : { "Dallas" : [{"id" : "1", "lat" : 32.4767, "lon" : 96.7970, "on_zayo" : "no"},
                                         {"id" : "2", "lat" : 32.3267, "lon" : 96.6970, "on_zayo" : "yes"},
                                         {"id" : "3", "lat" : 32.7367, "lon" : 96.7470, "on_zayo" : "no"},
                                         {"id" : "4", "lat" : 32.2767, "lon" : 96.2970, "on_zayo" : "yes"}
                                        ]
                           },
                 "Georgia" : { "Atlanta" : [{"id" : "1", "lat" : 33.5490, "lon" : 84.2880, "on_zayo" : "yes"},
                                            {"id" : "2", "lat" : 33.7690, "lon" : 84.3380, "on_zayo" : "no"},
                                            {"id" : "3", "lat" : 33.7490, "lon" : 84.9880, "on_zayo" : "yes"},
                                            {"id" : "4", "lat" : 33.4490, "lon" : 84.7880, "on_zayo" : "yes"}
                                           ]
                             }
                }





var cities_lat_lon = { "Colorado" : {"lat" : 39.5501, "lon" : -105.7821},
                       "Texas" : {"lat" : 31.9686, "lon" : -99.9018},
                       "Georgia" : {"lat" : 32.1656, "lon" : -82.9001},
                     }




function transitionCityMarks() {
  d3.selectAll(".city_marks").transition().duration(1000).style("opacity", 0);
}

function removeCityMarks() {
  d3.selectAll(".city_marks").remove();
}

function removeCityTransition(item_id) {
  d3.queue()
    .defer(transitionCityMarks)
    .await(removeCityMarks)
}




function transitionItemMarks() {
  d3.selectAll(".city_item_marks").transition().duration(500).style("opacity", 0);
}

function removeCityItemMarks() {
  d3.selectAll(".city_item_marks").remove();
}

function removeCityItemTransition(item_id) {
  d3.queue()
    .defer(transitionItemMarks)
    .await(removeCityItemMarks)
}



function MoveBackToMap(vis_container_id) {
  // Turn off tree mode
  tree_mode = false;
  
  // Remove visualization 1
  d3.select("#collapsible_tree_"+vis_container_id).remove();

  // Remove back button
  d3.select("#back_button_"+vis_container_id).remove();

  // Restores opacity to background
  d3.select("#svg_g").transition().duration(500).style("opacity", 1.0);
  
  
}

function setupBackButton(vis_container_id) {
  var container = d3.select("#vis_"+vis_container_id+"_button_div");
  
  // Create back button
  container.append("input").data([vis_container_id])
            .attr("type", "button")
            .attr("value", "Back")
            .attr("id", function (d) {
              return "back_button_"+d;
            })
            .on("click", function(d) { 
              MoveBackToMap(d);
            });
  
}

              
function removeFilterInfo(i=1) {
  // Hide filter
  d3.select(".geoToolTip").transition().duration(750).style("opacity", 0).style("visibility", "hidden");
  
}

function addFilterInfo(i=1) {
  // Reopen filter
  d3.select(".geoToolTip").transition().duration(750).style("opacity", 1).style("visibility", "visible");
}


function cityClick(d, object_this) {
  if (google_map_on) {
    // Close map
    closeGoogleMap();

    var current_city = Object.keys(selected_city)[0];
    selected_city[current_city].style.fill = city_color_unselected;
    selected_city[current_city].style.stroke = null;

    selected_city = {};
    
    var object_this_city = object_this.id.split("_")
    object_this_city = object_this_city[object_this_city.length-1];
    
    if (current_city != object_this_city) {
      cityClick(d, object_this);  
    }
    
    // Turn off text
    d3.select("#city_text_"+current_city).transition().duration(750).style("opacity", 0).style("display", "hidden");
    
    // Remove filter information
    removeFilterInfo();
    
  }
  else {
    // Open map
    initializeGoogleMap(1, d.lat, d.lon);

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


function cityMouseOver(d) {
  if (cities_off) {
    return;
  }

  city_mark = d3.select("#city_"+d.city);
  city_mark.transition()        
     .duration(750)       
     .attr("r", city_mark.attr("r")*2)       
     .style("stroke", "black")
     .style("fill", function() {
        var fill_color;
        if (selected_city == undefined) {
          fill_color = city_color_hover;
        }
        else if (Object.keys(selected_city)[0] == d.city) {
          fill_color = city_color_selected;
        }
        else {
          fill_color = city_color_hover;
        }
        return fill_color;
      })          
     .style("opacity", 0.6);  
  
  // Turn on text
  if (Object.keys(selected_city).length == 0) {
    d3.select("#city_text_"+d.city).transition().duration(750).style("opacity", 1).style("display", "inline");  
  }
}


function cityMouseOut(d) {
  if (cities_off) { 
    return;
  }
  
  city_mark = d3.select("#city_"+d.city);
  city_mark.transition()         
     .duration(500)      
     .attr("r", function () {
        var original_r = Math.sqrt(d.population) / 100;
        return original_r;
      })
     .style("fill", function() {
        var fill_color;
        if (selected_city == undefined) {
          fill_color = city_color_unselected;
        }
        else if (Object.keys(selected_city)[0] == d.city) {
          fill_color = city_color_selected;
        }
        else {
          fill_color = city_color_unselected;
        }
        return fill_color;
      })  
     .style("stroke", function() {
        var city_stroke;
        if (selected_city == undefined) {
          city_stroke = "none";
        }
        else if (Object.keys(selected_city)[0] == d.city) {
          city_stroke = "black";
        }
        else {
          city_stroke = "none";
        }
        return city_stroke;
      })        
     .style("opacity", 0.85);  
  
  // Turn off text
  if (Object.keys(selected_city).length == 0) {
    d3.select("#city_text_"+d.city).transition().duration(1000).style("opacity", 0.0).style("display", "none");
  }
}


function mapCityToState(g, projection) {
  
  // Remove items
  removeCityItemTransition();
  
  
  
  // Add cities (circles)
  d3.csv("data/cities.csv", function(cities_data) {
      var longitude, latitude, city_mark;
//      var city_group = g.append("g")   

      // Add groups
      var city_group = g.selectAll("g")
                  .data(cities_data).enter()
                  .append("g")
                    .attr("id", function(d) { return "city_group_"+d.city; });
      
      // Add cities
      city_group.append("circle")
                      .attr("id", function(d) {
                        return "city_"+d.city;  
                      })
                      .attr("class", "city_marks")
                      .attr("cx", function(d) {
                          longitude = (d.lon >= 0) ? -d.lon : d.lon;
                          latitude = d.lat;
                          return projection([longitude, latitude])[0];
                      })
                      .attr("cy", function(d) {
                          longitude = (d.lon >= 0) ? -d.lon : d.lon;
                          latitude = d.lat;
                          return projection([longitude, latitude])[1];
                      })
                      .attr("r", function(d) {
                          return Math.sqrt(d.population) / 100;
                      })
                      .style("fill", city_color_unselected)	
                      .style("opacity", 0)
                      .on("click", function(d) {
                        cityClick(d, this);
                      })
                      .on("mouseover", function(d) {
                          cityMouseOver(d);
                      })   
                      // fade out tooltip on mouse out               
                      .on("mouseout", function(d) {   
                          cityMouseOut(d);
                      });		
      
      // Add city text
      city_group.append("text")
                      .attr("id", function(d) {
                        return "city_text_"+d.city;  
                      })
                      .attr("class", "city_marks_text")
                      .attr("x", function(d) {
                          longitude = (d.lon >= 0) ? -d.lon : d.lon;
                          latitude = d.lat;
                          return projection([longitude, latitude])[0];
                      })
                      .attr("y", function(d) {
                          longitude = (d.lon >= 0) ? -d.lon : d.lon;
                          latitude = d.lat;
                          return projection([longitude, latitude])[1];
                      })
                      .text(function(d) {
                          return d.city;
                      })
                      .style("fill", "black")	
                      .style("opacity", 0)	
                      .style("display", "none")		
                      .style("font-size", "20px")
                      .attr("transform", "translate(0, -20)");

    d3.selectAll(".city_marks").transition().duration(500).style("opacity", 0.85);
  }); 
}



function initializeVis_2(vis_container_id, scale=1000) {
  
  
  var active = d3.select(null);
  
  var zoom = d3.zoom()
                .scaleExtent([0.5, 20])
                .on("zoom", zoomed);
  

  // D3 Projection
  var projection = d3.geoAlbersUsa()
                     .translate([width/2, height/2])    // translate to center of screen
                     .scale([scale]);          // scale things down so see entire US

  // Define path generator
  var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
               .projection(projection);  // tell path generator to use albersUsa projection
  
  

  // Define linear scale for output
  var color = d3.scaleLinear()
                .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

  

  
  // Create SVG element and append map to the SVG
  var svg = d3.select("#vis_"+vis_container_id+"_svg_container")
                .attr("height", height)
                .style("fill", "white")
                .on("click", stopped, true);

  svg.call(zoom);
                
                
  var g = svg.append("g").attr("id", "svg_g");
  
  
  function clicked(d) {
    
    if (tree_mode) {
      return;
    }
    if (active.node() === this) {
      // ZOOM OUT
      mapCityToState(g, projection);
      cities_off = false;
      return reset();
    }
    
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
    
    
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity ); 
  }

  function zoomed() {
    
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform); // updated for d3 v4
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }

  // Load in my states data!
  d3.csv("data/states.csv", function(error, data) {
    if (error) throw error;
    
    color.domain([0,1,2,3]); // setting the range of the input data

    // Load GeoJSON data and merge with states data
    d3.json("data/us-states.json", function(states_error, json) {
      if (states_error) throw states_error;
      
      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {

          // Grab State Name
          var dataState = data[i].state;

          // Grab data value 
          var dataValue = data[i].visited;

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++)  {
              var jsonState = json.features[j].properties.name;

              if (dataState == jsonState) {

                // Copy the data value into the JSON
                json.features[j].properties.visited = dataValue; 

                // Stop looking through the JSON
                break;
              }
          }
      }

      // Bind the data to the SVG and create one path per GeoJSON feature
      g.selectAll("path")
          .data(json.features)
        .enter().append("path")
          .attr("d", path)
          .attr("id", function(d) {
            return "state_path_" + d.properties.name;
          })
          .attr("class", "feature")
          .on("click", clicked)
          .on("mouseover", function(d) {      
              d3.select(this).transition()        
                 .duration(200)       
                 .style("opacity", .8);      
          })   

          // fade out tooltip on mouse out               
          .on("mouseout", function(d) {       
              d3.select(this).transition()         
                 .duration(500)      
                 .style("opacity", 1);   
          })
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", function(d) {
            // Get data value
            var value = d.properties.visited;

            if (value) {
              //If value exists…
              return color(value);
            } 
            else {
              //If value is undefined…
              return "rgb(213,222,217)";
            }
          });
      

      // Map the cities
      mapCityToState(g, projection);
       
    });
  });
  
}




function closeGoogleMap() {
  d3.selectAll(".google_map_container").transition().duration(1000).style("opacity", 0).remove();  
  d3.selectAll(".google_map_buttons").transition().duration(1000).style("opacity", 0).remove();  
  google_map_on = false;
}


function createGoogleMap(google_map_div, state_lat, state_lon, vis_container_id) {
  
  google_map_zoomed = false;
  
  // Create the Google Map…
  var map = new google.maps.Map(google_map_div.node(), {
    zoom: 9,
    center: new google.maps.LatLng(state_lat, -1*state_lon),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  
  d3.json("data/building.json", function(error, data) {
    if (error) throw error;
   
    for (var building in data) {
      
      var cityCircleColor = (data[building].on_zayo == "Yes") ? "#00FF00" : "#FF0000";
      var myLatlng = data[building].center;
      // Add the circle for this city to the map.
      var cityCircle = new google.maps.Circle({
        strokeColor: cityCircleColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: cityCircleColor,
        fillOpacity: 0.35,
        map: map,
        title: "Click to Zoom",
        center: myLatlng,
        radius: 1000
      });
      
        
    
      // Google Map Circle on click
      cityCircle.addListener('click', function() {
        console.log(google_map_zoomed);
          
          if (tree_mode) {
            createGoogleMap(google_map_div, state_lat, state_lon, vis_container_id);
            MoveBackToMap(vis_container_id);
            currentGoogleMapCity = undefined;
            return;
          }
          
          if (google_map_zoomed) {
            google_map_zoomed = false;
            createGoogleMap(google_map_div, state_lat, state_lon, vis_container_id);
            MoveBackToMap(vis_container_id);
            currentGoogleMapCity = undefined;
            return;
          }
          
          google_map_zoomed = true;
          currentGoogleMapCity = this;
        
          d3.select("#svg_g").transition().duration(500).style("opacity", 0.1);
          setupBackButton(1);
          tree_mode = true;
          initializeVis_1(1);
//          map.setZoom(15);
          var zoom_level = 15;
          map.setCenter(this.getCenter());
          smoothZoom(map, zoom_level, map.getZoom(), zoomIn=true);
        
          this.setRadius(40);
          this.setOptions({fillOpacity : 0.5});
      });
      
      // the smooth zoom function
      function smoothZoom (map, max, cnt, zoomIn=true) {
          if (cnt >= max) {
              return;
          }
          else {
              z = google.maps.event.addListener(map, 'zoom_changed', function(event){
                  google.maps.event.removeListener(z);
                  var update = (zoomIn) ? cnt + 1 : cnt - 1 ;
                  smoothZoom(map, max, update, zoomIn);
              });
              setTimeout(function(){map.setZoom(cnt)}, 50); // 80ms is what I found to work well on my system -- it might not work well on all systems
          }
      }  
      
      // Google Map Circle on mouseover
      cityCircle.addListener('mouseover', function() {
        console.log(google_map_zoomed)
        if (!google_map_zoomed) {
          return;
        }
        
        var direction = 1;
        var rMin = 10, rMax = 100;
        var time_interval = 50;
        
        
        googleMouseOverInterval = setInterval(function() {
          try {
            var radius = currentGoogleMapCity.getRadius();
            if ((radius > rMax) || (radius < rMin)) {
                direction *= -1;
            }
            currentGoogleMapCity.setRadius(radius + direction * 5);
          }
          catch(err) {
            return;
          }  
            
        }, time_interval);
       
        
          
      });
      
      
      // Google Map Circle on mouseout
      cityCircle.addListener('mouseout', function() {
        
        if (currentGoogleMapCity == undefined) {
          return;
        }
        
        clearInterval(googleMouseOverInterval);
        
        currentGoogleMapCity.setRadius(40);
      });
      
      
    }
  });
  
  return map;
}

function initializeGoogleMap(i, state_lat, state_lon) {
  
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
  var map_button_div = d3.select("#vis_1_button_div");
//  
//  var map_button_div = google_map_container.append("div")
//                                .attr("id", "google_map_button_div")
//                                .attr("class", "google_map_button");
//  
  
  
  
  // Setup div for google map
  var google_map_div = google_map_container.append("div")
                                            .attr("id", "google_map_"+i)
                                            .attr("class", "google_map");
  
  
  
  // Setup div for filter
  var google_map_filter_div = google_map_container.append("div")
                                            .attr("id", "google_map_filter_"+i)
                                            .attr("class", "geoToolTip");
  
  
  // Setup header div for filter
  var filter_header_div = google_map_filter_div.append("div").attr("id", "filter_header_div");
  
  // Add filter buttons
  filter_header_div.html("Filter");
  
  // Setup filter area
  var filter_area_div = google_map_filter_div.append("div").attr("id", "filter_area_div");
  
  filter_area_div.append("svg")
                    .attr("height", 300)
                    .attr("width", 500)
                  .append("g")
                  .append("rect")
                    .attr("id", "filter_background_svg")
                    .attr("height", 300)
                    .attr("width", 500)
                    .style("fill", "white")
                    .style("stroke", "black");
  
  
  // Setup buttons in filter area
  filter_area_div.append("div")
                    .attr("id", "filter_button_1_div")
                  .append("input")
                    .attr("id", "filter_button_1")
                    .attr("type", "button")
                    .attr("value", "test");
  
  
  

  // Load the station data. When the data comes back, create an overlay.
  createGoogleMap(google_map_div, state_lat, state_lon, i);
  
  
  
  // Add map minimize button
  map_button_div.append("input").data([i])
    .attr("id", "min_max_map_button")
    .attr("class", "google_map_buttons")
    .attr("type", "button")
    .attr("value", "Hide Map")
    .on("click", function(d) {
      if (google_map_minimized) {
        // OPEN MAP 
        
        // Set flag
        google_map_minimized = false;
        
        // Reopen map
        d3.selectAll(".geoToolTip, #min_max_filter_button, #google_map_container_"+d).style("display", "block");
        d3.selectAll("#city_view_button, #min_max_filter_button").style("display", "inline");
        
        
        // change value to Hide mape
        d3.select(this).property("value", "Hide Map");
      }
      else {
        // CLOSE MAP
        
        // Set flag
        google_map_minimized = true;
        
        // Minimize map
        d3.selectAll(".geoToolTip, #city_view_button, #min_max_filter_button, #google_map_container_"+d).style("display", "none");
        
        // change value to +
        d3.select(this).property("value", "Show Map");
      }
    });
  
  
  
  
  
  // Add filter minimize button
  map_button_div.append("input").data([i])
    .attr("id", "min_max_filter_button")
    .attr("class", "google_map_buttons")
    .attr("type", "button")
    .attr("value", "Hide Filter")
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
    .on("click", function(d) {
      if (tree_mode) {
        return;
      }
      createGoogleMap(google_map_div, state_lat, state_lon, i);
    });
  
  
  
  
  
  
  
  // Set transition on map container
  google_map_container.transition().delay(200).duration(1000).style("opacity", 1);
}