// Reference: https://github.com/d3/d3-geo
// Example 1: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
// https://anthonyskelton.com/2016/d3-js-version-4/
// Scroll and grab - zoom into state: https://bl.ocks.org/mbostock/2374239
// Smooth zoom transitions THIS: https://bl.ocks.org/mbostock/9656675 (v3)
      // https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2 (v4)

// GOOGLE MAP OVERLAY! http://bl.ocks.org/donmccurdy/bd239cc355de227b1104503fc9d435d2
// Google map api circles click: https://developers.google.com/maps/documentation/javascript/examples/circle-simple


var cities_off = false;
var tree_mode = false;
var google_map_on = false;

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



var building_map_test = {
      "Bldg-124564": {
        center: {lat: 39.803579, lng: -104.969196},
        on_zayo: 1
      },
      "Bldg-124569": {
        center: {lat: 39.684491, lng: -104.983563},
        on_zayo: 1
      },
      "Bldg-124566": {
        center: {lat: 39.738915, lng: -104.914836},
        on_zayo: 0
      }
    };


var cities_lat_lon = { "Colorado" : {"lat" : 39.5501, "lon" : -105.7821},
                       "Texas" : {"lat" : 31.9686, "lon" : -99.9018},
                       "Georgia" : {"lat" : 32.1656, "lon" : -82.9001},
                     }

var width = 1000;
var height = 500;


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

              


function mapCity(d, g, projection, vis_container_id) {
  // Remove city
  removeCityTransition(".city_marks");
  
  
  for (var state in test_data) {
    
    var y = d.id.split("_");
    var current_state = y[y.length-1];
    
    if (state == current_state) {
      for (var city in test_data[state]) {
        mapItemToCity(state, city, test_data[state][city], g, projection, vis_container_id);
      }
    }
  }
}


function mapItemToCity(state, city, items, g, projection, vis_container_id) {
  
  var state_city_id = state + "_" + city;
  console.log("id: " + state_city_id)
  
  
  var longitude, latitude, item_mark;

  g.append("g").attr("class", "city_item_marks")
    .selectAll("circle."+state_city_id+"_item_marks")
      .data(items)
      .enter()
      .append("circle")
      .attr("id", function(d) {
        return state_city_id + "_item_"+d.id;  
      })
      .attr("class", state_city_id+"_item_marks")
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
//          return Math.sqrt(d.population) / 100;
        return 2;
      })
      .style("fill", function(d) {
        var building_on = (d.on_zayo == "yes") ? true : false;
        var item_color = (building_on) ? "green" : "red";
        return item_color;
      })	
      .style("opacity", 0)		

      .on("click", function(d) {
        d3.select("#svg_g").transition().duration(500).style("opacity", 0.1);
        setupBackButton(vis_container_id);
        tree_mode = true;
        initializeVis_1(1);
      })


      .on("mouseover", function(d) {      
          item_mark = d3.select("#" + state_city_id + "_item_"+d.id);
          item_mark.transition()        
             .duration(200)       
             .attr("r", item_mark.attr("r")*1.5)       
             .style("opacity", .9);      
      })   

      // fade out tooltip on mouse out               
      .on("mouseout", function(d) {       
          item_mark = d3.select("#" + state_city_id + "_item_"+d.id);
          item_mark.transition()         
             .duration(500)      
             .attr("r", function (d) {
//                var original_r = Math.sqrt(d.population) / 100;
                var original_r = 2;
                return original_r;
              })
             .style("opacity", 0.85);   
      });

      d3.selectAll("." + state_city_id + "_item_marks").transition().duration(500).style("opacity", 0.85);
}
      



function mapCityToState(g, projection) {
  
  // Remove items
  removeCityItemTransition();
  
  d3.csv("data/cities.csv", function(cities_data) {
      var longitude, latitude, city_mark;

      g.selectAll("circle")
          .data(cities_data)
          .enter()
          .append("circle")
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
          .style("fill", "rgb(217,91,67)")	
          .style("opacity", 0)		

          .on("click", function(d) {
        
            if (google_map_on) {
              // Close map
              closeGoogleMap();
            }
            else {
              initializeGoogleMap(1, d.lat, d.lon);
            }
          })


          .on("mouseover", function(d) {  
              if (!cities_off) {
                city_mark = d3.select("#city_"+d.city);
                city_mark.transition()        
                   .duration(200)       
                   .attr("r", city_mark.attr("r")*1.5)       
                   .style("opacity", .9);  
              }
          })   

          // fade out tooltip on mouse out               
          .on("mouseout", function(d) {   
              if (!cities_off) {
                city_mark = d3.select("#city_"+d.city);
                city_mark.transition()         
                   .duration(500)      
                   .attr("r", function (d) {
                      var original_r = Math.sqrt(d.population) / 100;
                      return original_r;
                    })
                   .style("opacity", 0.85);  
              }
          });
    
    d3.selectAll(".city_marks").transition().duration(500).style("opacity", 0.85);
  }); 
}



function initializeVis_2(vis_container_id, scale=1000) {
  
  
  var active = d3.select(null);
  
  var zoom = d3.zoom()
                .scaleExtent([1, 20])
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

  var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];
  
  
  //Create SVG element and append map to the SVG
  var svg = d3.select("#vis_"+vis_container_id+"_svg_container")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "white")
                .on("click", stopped, true);
  
  svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .on("click", reset);
  
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
    else {
      // ZOOM IN
//      mapCity(this, g, projection, vis_container_id);
//      cities_off = true;
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
//    if (tree_mode) {
//      return;
//    }
    
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
                 .style("opacity", .9);      
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
  d3.select(".google_map").transition().duration(1000).style("opacity", 0).remove();  
  google_map_on = false;
}

function initializeGoogleMap(i, state_lat, state_lon) {
  
  closeGoogleMap();
  
  google_map_on = true;
  
  var map_container = d3.select("#vis_"+i+"_svg_div").append("div").attr("id", "google_map_"+i).attr("class", "google_map");
  
  // Set to be hidden for later transition
  map_container.style("opacity", 0);
  
  // Create the Google Map…
  var map = new google.maps.Map(d3.select("#google_map_"+i).node(), {
    zoom: 9,
    center: new google.maps.LatLng(state_lat, -1*state_lon),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  // Load the station data. When the data comes back, create an overlay.
  d3.json("data/building.json", function(error, data) {
    if (error) throw error;
    
    for (var building in data) {
      var myLatlng = data[building].center;
      console.log("Building: " + building);
      // Add the circle for this city to the map.
      var cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        title: "Click to Zoom",
        center: myLatlng,
        radius: 1000
      });
      
      cityCircle.addListener('click', function() {
        console.log("HERE");
          d3.select("#svg_g").transition().duration(500).style("opacity", 0.1);
          setupBackButton(1);
          tree_mode = true;
          initializeVis_1(1);
          map.setZoom(13);
          map.setCenter(cityCircle.getCenter());
        });
    }
  });
  map_container.transition().delay(200).duration(1000).style("opacity", 1);
}