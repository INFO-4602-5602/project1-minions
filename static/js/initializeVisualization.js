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

// time chained transitions: https://bl.ocks.org/mbostock/3903818

// loading spinners
//   http://stackoverflow.com/questions/15485127/d3-js-adding-a-loading-notification-during-ajax-request


var cities_off = false;
var city_color_selected = '#6666ff';
var city_color_hover = "#00FFFF";
var city_color_unselected = "rgb(217,91,67)";
var selected_city = {};
var width = 1000;
var height = 600;


var US_STATES_JSON;
var QUERIED_DATA = {};






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


    // Remove back button
    d3.select("#back_button_"+vis_container_id).remove();

    // Restores opacity to background
    d3.select("#svg_g").transition().duration(500).style("opacity", 1.0);


}



function removeFilterInfo(i=1) {
    // Hide filter
    d3.select(".geoToolTip").transition().duration(750).style("opacity", 0).style("visibility", "hidden");

}

function addFilterInfo(i=1) {
    // Reopen filter
    d3.select(".geoToolTip").transition().duration(750).style("opacity", 1).style("visibility", "visible");
}





function initializeBuildingVisualizations(currentMarketObject, clickedObject) {
    // Setup the building GOOGLE MAP
    preInitializeGoogleMaps(currentMarketObject, clickedObject);

    // Setup the building HISTOGRAM
    initializeBuildingHistogram(currentMarketObject, clickedObject);
}




function cityClickPrimer(currentMarketObject, clickedObject) {

    // Check if market info previously queried and already stored:
    var city_data_previously_queried = checkCityData(currentMarketObject);


    // Set color of city
    // Set city to selected color
    var city_stroke = (google_map_on) ? "none" : "black";
    var city_fill = (google_map_on) ? city_color_unselected : city_color_selected;
    clickedObject.style.stroke = city_stroke;
    clickedObject.style.fill = city_fill;


    if (!city_data_previously_queried) {
        QUERIED_DATA[currentMarketObject.city] = undefined;


        // Flag system as busy
        system_busy = true;


        // Set spinner target
        var target = document.getElementById("loading_data_div");
        spinner.spin(target);
        $.get("/building_profits/"+currentMarketObject.city, function (data) {

            // Set data
            QUERIED_DATA[currentMarketObject.city] = data.result;

            // Flag system as no longer busy
            system_busy = false;

            // Initialize the building visualizations - Google map and Histogram
            initializeBuildingVisualizations(currentMarketObject, clickedObject);

            // Initialize Market summary
            initializeMarketSummary(currentMarketObject, clickedObject);

            // Stop spinner
            spinner.stop();
        });

    }
    else {
        // Initialize the building visualizations - Google map and Histogram
        initializeBuildingVisualizations(currentMarketObject, clickedObject);

        // Initialize Market summary
        initializeMarketSummary(currentMarketObject, clickedObject);
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

    // Highlight text in key
    d3.select("#market_"+d.city+"_legend_text").transition().duration(750).style("font-size", "30px");
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

    // Turn down text on legend
    d3.select("#market_"+d.city+"_legend_text").transition().duration(750).style("font-size", "20px");
}

var hoverInterval;


function checkCityData(d) {
    var city = d.city;
    var return_val = (city in QUERIED_DATA) ? true : false;

    return return_val;
}

function mapCityToState(g, projection) {

    // Remove items
    removeCityItemTransition();



    // Add cities (circles)
    d3.csv("/static/data/cities.csv", function(cities_data) {
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
                cityClickPrimer(d, this);
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










function initializeMainVisualization(profits_data, vis_container_id=1, scale=1000) {


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




//  // Define linear scale for output
//  var color = d3.scaleLinear()
//                .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

    var profits = Object.keys( profits_data ).map(function ( key ) { return profits_data[key]; });

    var profit_min = Math.min.apply( null, profits );
    var profit_max = Math.max.apply( null, profits );


    var color = d3.scaleLinear()
        .domain([profit_min, profit_max])
        .range(["#00cc00", "#66ff66"]);



    // Create SVG element and append map to the SVG
    var svg = d3.select("#vis_"+vis_container_id+"_svg_container")
        .attr("height", height)
        .style("fill", "white")
        .on("click", stopped, true);




    svg.call(zoom);


    var g = svg.append("g")
        .attr("id", "svg_g_"+vis_container_id)
        .attr("class", "initial_map")
        .style("opacity", 0);


    function clicked(d) {

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

    // Load in markets data
    d3.csv("/static/data/markets.csv", function(error, data) {
        if (error) throw error;


        // Load GeoJSON data and merge with states data
        d3.json("/static/data/us-states.json", function(states_error, json) {
            if (states_error) throw states_error;

            // Loop through each state data value in the .csv file
            US_STATES_JSON = [];
            for (var i = 0; i < data.length; i++) {

                // Grab Market and State Name
                var dataMarket = data[i].market;
                var dataState = MARKET_TO_STATE[dataMarket];


                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++)  {
                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {
                        US_STATES_JSON.push(json.features[j]);
                        // Copy the data value into the JSON
                        json.features[j].properties.selected = true;

                        json.features[j].properties.market = dataMarket;

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
                //.on("click", clicked)
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
                    var value = d.properties.selected;

                    if (value) {
                        //If value exists…
                        var market = d.properties.market;
                        var states_profit = profits_data[market];
                        var stateColor = color(states_profit);
                        return stateColor;
                    }
                    else {
                        //If value is undefined…
                        return "rgb(213,222,217)";
                    }
                });


            // Map the cities
            mapCityToState(g, projection);

            // Add legend
            var legend = svg.append("g").attr("id", "legend").attr("transform", "translate(950,30)");

            // Legend background
            legend.append("rect")
                .attr("height", 230)
                .attr("width", 150)
                .style("fill", "white")
                .style("stroke", "black");

            // Add Legend Title
            legend.append("text")
                .attr("x", 20)
                .attr("y", 30)
                .text("Legend")
                .style("font-size", "28px")
                .style("fill", "black");


            // Add color key group to legend
            var legend_color_resolution = 40;
            var legend_color_array = [];
            for (var z=0; z < legend_color_resolution; z++) {
                legend_color_array.push(z);
            }

            var legendColorHeight = 120;
            var colorSquare_side = legendColorHeight / legend_color_resolution;
            var keycolor = d3.scaleLinear()
                .domain([0, legend_color_resolution])
                .range([profit_min, profit_max]);


            // Create group for legend color
            var legendColorText = legend.append("g").attr("transform", "translate(0,50)");

            var y_start = 20;


            // Actual color gradient
            legendColorText.selectAll("rect.colorSquare")
                .data(legend_color_array).enter()
                .append("rect")
                .attr("x", 10)
                .attr("y", function(d, i) {
                    return y_start + i*colorSquare_side;
                })
                .attr("class", "colorSquare")
                .attr("height", colorSquare_side)
                .attr("width", 50)
                .style("fill", function(d, i) {
                    var temp_color = keycolor(i);
                    return color(temp_color);
                });




            var profit_to_position = d3.scaleLinear()
                .domain([profit_min, profit_max])
                .range([0, legend_color_resolution]);



            // Create group for legend text


            legendColorText.selectAll("text")
                .data(US_STATES_JSON).enter()
                .append("text")
                .attr("x", 80)
                .attr("y", function(d, i) {
                    var market = d.properties.market;
                    var state_profit = profits_data[market];
                    return y_start + profit_to_position(state_profit)*colorSquare_side;
                })
                .attr("id", function(d, i) {
                    var market = d.properties.market;
                    return "market_"+market+"_legend_text";
                })
                .attr("class", "colorSquare")
                .style("fill", "black")
                .style("font-size", "16px")
                .text(function(d, i) {
                    return d.properties.market;
                });

            // Low profit marker
            legendColorText.append("text")
                .attr("x", 10)
                .attr("y", 10)
                .text("Low Profit")
                .style("fill", "black");

            // High profit marker
            legendColorText.append("text")
                .attr("x", 10)
                .attr("y", 170)
                .text("High Profit")
                .style("fill", "black");

        });
    });

    // Transition in the map
    g.transition().duration(1500).style("opacity", 1.0);

}


