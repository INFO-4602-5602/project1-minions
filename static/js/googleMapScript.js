// http://stackoverflow.com/questions/17992543/how-do-i-drag-an-image-smoothly-around-the-screen-using-pure-javascript
// http://jsfiddle.net/vZv5k/

// http://stackoverflow.com/questions/7044587/adding-multiple-markers-with-infowindows-google-maps-api

var googleMouseOverInterval;
var currentGoogleMapCity;
var google_map_zoomed = false;
var google_map_on = false;
var google_map_minimized = false;

var map;

var buildingCircleColor = "#00ff00";
var buildingCircleStroke = "#0000ff";

var infowindow;
var filter_key = "profit";

var BUILDING_ID_TO_WINDOW = {};
var buildingCircles;

var filter_building_accounts = ["Buildings", "Accounts"];
// Add top X filter
var top_x_filter_options = {"Top 3" : 3,
    "Top 5" : 5,
    "Top 10" : 10,
    "Top 25" : 25,
    "Top 50" : 50,
    "Top 100" : 100};




function closeGoogleMap() {
    d3.selectAll(".google_map_container").transition().duration(1000).style("opacity", 0).remove();
    d3.selectAll(".google_map_buttons").transition().duration(1000).style("opacity", 0).remove();
    google_map_on = false;
}



function createGoogleMap(google_map_div, cityObject, number_filter, data, vis_container_id) {

    // Set current market, state lat, and state lon
    var state_lat = cityObject.lat;
    var state_lon = cityObject.lon;

    // Set default - map not zoomed
    google_map_zoomed = false;

    // Create the Google Map…
    map = new google.maps.Map(google_map_div.node(), {
        zoom: 9,
        center: new google.maps.LatLng(state_lat, -1*state_lon),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    // Generate buildings
    generateBAsOnMap(google_map_div, cityObject, vis_container_id, number_filter, data);

}


function refreshGoogleMap(cityObject,number_filter,ba_filter) {
    var google_map_div = d3.select("#google_map_2");
    var vis_container_id = 4;
    google_map_zoomed = false;

    if(ba_filter === "Accounts") {

        var target = document.getElementById("loading_data_div");
        spinner.spin(target);
        $.get("/account_profits/" + cityObject.city, function (data) {
            spinner.stop();
            system_busy = false;
            createGoogleMap(google_map_div, cityObject, number_filter, data["result"], vis_container_id);
            MoveBackToMap(vis_container_id);
            currentGoogleMapCity = undefined;
        });

    }else {
        createGoogleMap(google_map_div, cityObject, number_filter, QUERIED_DATA[cityObject.city], vis_container_id);
        MoveBackToMap(vis_container_id);
        currentGoogleMapCity = undefined;
    }
}





function sortByFilter(ba_data, N=5) {
    var sortable = [];
    for (var ba_index=0; ba_index < ba_data.length; ba_index++) {
        var current_ba = ba_data[ba_index];
        var ba_id = undefined;
        if(current_ba["building_id"]) {
            ba_id = current_ba["building_id"];
        }else{
            ba_id = current_ba["account_id"];
        }
        var filter_attr = current_ba[filter_key];
        sortable.push([ba_id, filter_attr]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });


    var sorted_ba_ids = [];
    for (var j=0; j < N; j++) {
        sorted_ba_ids.push(sortable[j][0]);
    }
    return sorted_ba_ids;
}

function generateBAsOnMap(google_map_div, d, vis_container_id, num_filter, data) {

    // USE THE QUERY DATA HERE
    var ba_data = data;

    // Sort the current buildings by filter
    var filteredBuildingIds = sortByFilter(ba_data, num_filter);


    buildingCircles = [];
    for (var ba in ba_data) {

        var building_data = ba_data[ba];
        var building_id = building_data["building_id"];

        // Filter!
        var found_building = false;
        for (var k=0; k < filteredBuildingIds.length; k++) {
            var x = filteredBuildingIds[k];
            if (x == building_id) {
                found_building = true;
            }
        }

        if (!found_building) {
            continue;
        }


        // Define city parameters


        // Get building lat, lon and store it into myLatlng
        var building_lat = building_data.latitude;
        var building_lon = building_data.longitude;

        var myLatlng = {"lng" : building_lat, "lat" : building_lon};


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
            building_id: building_data["building_id"],
            build_cost: building_data["estimated_build_cost"],
            net_proximity: building_data["network_proximity"],
            profit: building_data["profit"],

        });
        buildingCircles.push(buildingCircle);

        // Create info window

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

        var new_infowindow = new google.maps.InfoWindow( {
            content: infowindow_content,
            pixelOffset: {width: 200, height: 200, j: "px", f: "px"}
        });


        // Update building ID to the new info window
        BUILDING_ID_TO_WINDOW[building_id] = new_infowindow;




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


                map.setZoom(15);
                var zoom_level = 15;
                map.setCenter(this.getCenter());

                for (var k=0; k < buildingCircles.length; k++) {
                    console.log(buildingCircles[k]);
                    buildingCircles[k].setRadius(0);
                }
                this.setRadius(40);
                this.setOptions({fillOpacity : 0.5});
            }
        });



        // CITY MOUSEOVER
        buildingCircle.addListener('mouseover', function() {

            infowindow = BUILDING_ID_TO_WINDOW[this.building_id];

            // Open the infowindow
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







function initializeGoogleMap(i, currentMarketObject, clickedObject) {


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
        .style("opacity", 0)
        .style("padding-top","40px");



    // Setup div for buttons
    var map_button_div = d3.select("#vis_"+i+"_button_div");


    // Setup div for google map
    var google_map_div = google_map_container.append("div")
        .attr("id", "google_map_"+i)
        .attr("class", "google_map");


    // Load the building data
    createGoogleMap(google_map_div, currentMarketObject, 10, QUERIED_DATA[currentMarketObject.city], i);

    // building account selector

    var selected_ba = undefined;

    map_button_div.append("select")
        .attr("id", "filter_pulldown_1")
        .attr("class", "google_map_buttons")
        .style("opacity", 0)
        .on("change", function() {
            selected_ba = d3.select(this).property("value");
        })
        .selectAll("option")
        .data(filter_building_accounts).enter()
        .append("option")
        .text(function (d, i) {
            if (d === "Buildings") {
                d3.select(this).property("selected", true);
            }
            return d;
        });


    var filter_names = Object.keys(top_x_filter_options);


    // Initialize at top n at default
    var selected_num = 10;
    var default_filter_key = "Top " + selected_num;


    // Create Pulldown menu to filter google map
    map_button_div.append("select")
        .attr("id", "filter_pulldown_1")
        .attr("class", "google_map_buttons")
        .style("opacity", 0)
        .on("change", function() {
            selected_num = d3.select(this).property("value");
        })
        .selectAll("option")
        .data(filter_names).enter()
        .append("option")
        .text(function (d, i) {
            if (d === default_filter_key) {
                d3.select(this).property("selected", true);
            }
            return d;
        });



    // Add button goes back to city view
    map_button_div.append("input").data([i])
        .attr("id", "apply_filter_dropdown")
        .attr("class", "google_map_buttons")
        .attr("type", "button")
        .attr("value", "Apply")
        .style("opacity", 0)
        .on("click", function() {
            refreshGoogleMap(currentMarketObject,selected_num,selected_ba);
        });



    // Set transition on map container
    d3.selectAll(".google_map_buttons").transition().duration(750).style("opacity", 1);
    google_map_container.transition().delay(200).duration(1000).style("opacity", 1);

}



function checkBuilding(data, building) {

    var current_building = data[building];
    var on_zayo = current_building.on_zayo;
    return on_zayo === "Yes";
}





function preInitializeGoogleMaps(currentMarketObject, clickedObject) {

    // CHECK IF MAP ALREADY ON - IF YES, CLOSE
    if (google_map_on) {

        // Close map
        closeGoogleMap();

        var current_city = Object.keys(selected_city)[0];
        selected_city[current_city].style.fill = city_color_unselected;
        selected_city[current_city].style.stroke = null;

        selected_city = {};

        // CHECK IF OTHER MAP OPEN - CLOSE IT, OPEN NEW ONE
        if (current_city != currentMarketObject.city) {
            setTimeout(function() {
                cityClickPrimer(currentMarketObject, clickedObject);
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
        initializeGoogleMap(2, currentMarketObject, clickedObject);

        // Set city to selected color
        clickedObject.style.stroke = "black";
        clickedObject.style.fill = city_color_selected;

        // Set current city
        selected_city[currentMarketObject.city] = clickedObject;

        // Turn on text
        d3.select("#city_text_"+currentMarketObject.city)
            .transition().duration(750)
            .style("opacity", 1)
            .style("display", "inline");

        // Add filter information
        addFilterInfo();
    }
}
