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

var icon_urls = ['/static/ico/blue.png'
    , '/static/ico/green.png'
    , '/static/ico/lightblue.png'
    , '/static/ico/orange.png'
    , '/static/ico/pink.png'
    , '/static/ico/purple.png'
    , '/static/ico/red.png'
    , '/static/ico/yellow.png'];


function closeGoogleMap() {
    d3.selectAll(".google_map_container").transition().duration(1000).style("opacity", 0).remove();
    d3.selectAll(".google_map_buttons").transition().duration(1000).style("opacity", 0).remove();
    google_map_on = false;
}



function createGoogleMap(google_map_div, cityObject, number_filter, data) {

    // Set current market, state lat, and state lon
    var state_lat = cityObject.lat;
    var state_lon = cityObject.lon;

    // Set default - map not zoomed
    google_map_zoomed = false;

    // Create the Google Map…
    if(data[0]["building_id"]) {
        map = new google.maps.Map(google_map_div.node(), {
            zoom: 9,
            center: new google.maps.LatLng(state_lat, -1 * state_lon),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });
    }else{
        map = new google.maps.Map(google_map_div.node(), {
            zoom: 3,
            center: new google.maps.LatLng(37.09024, -95.712891),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });
    }

    // Generate buildings
    generateBAsOnMap(number_filter, data);

}


function refreshGoogleMap(cityObject,number_filter,ba_filter) {
    var google_map_div = d3.select("#google_map_2");
    var vis_container_id = 4;
    google_map_zoomed = false;

    if(ba_filter === "Accounts") {
        if(!QUERIED_DATA_ACCOUNTS[cityObject.city]) {
            var target = document.getElementById("loading_data_div");
            spinner.spin(target);
            $.get("/account_profits/" + cityObject.city, function (data) {
                spinner.stop();
                system_busy = false;
                QUERIED_DATA_ACCOUNTS[cityObject.city] = data["result"];
                createGoogleMap(google_map_div, cityObject, number_filter, data["result"], vis_container_id);
                MoveBackToMap(vis_container_id);
                currentGoogleMapCity = undefined;
            });
        }else{
            createGoogleMap(google_map_div, cityObject, number_filter, QUERIED_DATA_ACCOUNTS[cityObject.city], vis_container_id);
            MoveBackToMap(vis_container_id);
        }
    }else {
        createGoogleMap(google_map_div, cityObject, number_filter, QUERIED_DATA[cityObject.city], vis_container_id);
        MoveBackToMap(vis_container_id);
        currentGoogleMapCity = undefined;
    }
}





function sortByFilter(ba_data, num_filter) {
    var sortable = [];
    var N = parseInt(num_filter.split(" ")[1]);
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

function drawBuildings(filteredIds, ba_data){
    for (var b in ba_data) {
        (function (building) {
            var building_data = ba_data[building];
            var building_id = building_data["building_id"];

            // Filter!
            var found_building = false;
            for (var k = 0; k < filteredIds.length; k++) {
                var x = filteredIds[k];
                if (x == building_id) {
                    found_building = true;
                }
            }

            if (!found_building) {
                return;
            }


            // Define city parameters


            // Get building lat, lon and store it into myLatlng
            var building_lat = building_data.latitude;
            var building_lon = building_data.longitude;

            var myLatlng = {"lng": building_lat, "lat": building_lon};


            // Add the circle for this city to the map.
            var buildingCircle = new google.maps.Marker({
                map: map,
                position: myLatlng,
                // Custom attributes
                building_id: building_data["building_id"],
                build_cost: building_data["estimated_build_cost"],
                net_proximity: building_data["network_proximity"],
                profit: building_data["profit"],
            });
            // buildingCircles.push(buildingCircle);

            // Create info window

            // Get circle info for infowindow;
            building_id = buildingCircle.building_id;
            var build_cost = buildingCircle.build_cost;
            var net_proximity = buildingCircle.net_proximity;
            var profit = buildingCircle.profit;

            // Info window

            var infowindow_content = '<div id="iw-container">' +
                '<div class="iw-title">Building Information</div>' +
                '<div class="iw-content">' +
                '<div class="iw-subTitle">building_id</div>' +
                '<p> Build Cost: ' + build_cost + '<br\>' +
                'Net Proximity:  ' + net_proximity + '<br\>' +
                'Profit: ' + profit + '</p>' +
                '</div>' +
                '<div class="iw-bottom-gradient"></div>' +
                '</div>';

            // Update building ID to the new info window
            var infowindow = new google.maps.InfoWindow({
                content: infowindow_content
                // position: new google.maps.LatLng(building_lat, building_lon),
                // pixelOffset: {width: 200, height: 200, j: "px", f: "px"}
            });


            google.maps.event.addListener(buildingCircle, 'click', function() {
                infowindow.open(map,buildingCircle);
            });

            google.maps.event.addListener(map, 'click', function() {
                infowindow.close();
            });

            google.maps.event.addListener(infowindow, 'domready', function() {

                // Reference to the DIV that wraps the bottom of infowindow
                var iwOuter = $('.gm-style-iw');

                /* Since this div is in a position prior to .gm-div style-iw.
                 * We use jQuery and create a iwBackground variable,
                 * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
                 */
                var iwBackground = iwOuter.prev();

                // Removes background shadow DIV
                iwBackground.children(':nth-child(2)').css({'display' : 'none'});

                // Removes white background DIV
                iwBackground.children(':nth-child(4)').css({'display' : 'none'});

                // Moves the infowindow 115px to the right.
                iwOuter.parent().parent().css({left: '50px'});

                // Moves the shadow of the arrow 76px to the left margin.
                iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

                // Moves the arrow 76px to the left margin.
                iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

                // Changes the desired tail shadow color.
                iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

                // Reference to the div that groups the close button elements.
                var iwCloseBtn = iwOuter.next();

                // Apply the desired effect to the close button
                iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

                // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
                if($('.iw-content').height() < 140){
                    $('.iw-bottom-gradient').css({display: 'none'});
                }

                // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
                iwCloseBtn.mouseout(function(){
                    $(this).css({opacity: '1'});
                });
            });

        })(b);
    }
}

function drawAccounts(filteredIds, ba_data){
    for (var a in ba_data) {
        for (var b in ba_data[a]["building_list"]) {
            (function (account, building) {
                var account_data = ba_data[account];
                var account_id = account_data["account_id"];

                // Filter!
                var found_account = false;
                var found_index = 0
                for (var k = 0; k < filteredIds.length; k++) {
                    if (filteredIds[k] === account_id) {
                        found_account = true;
                        found_index = k;
                    }
                }

                if (!found_account) {
                    return;
                }


                // Define city parameters


                // Get building lat, lon and store it into myLatlng
                var latlong = ba_data[account]["building_list"][building].split(",");
                var building_lat = parseFloat(latlong[0]);
                var building_lon = parseFloat(latlong[1]);

                var myLatlng = {"lng": building_lat, "lat": building_lon};

                var iUrl = icon_urls[found_index%8]


                // Add the circle for this city to the map.
                var accountcircle = new google.maps.Marker({
                    map: map,
                    position: myLatlng,
                    // Custom attributes
                    account_id: account_data["account_id"],
                    revenue: account_data["annual_revenue"],
                    profit: account_data["profit"],
                    icon: iUrl
                });
                // buildingCircles.push(buildingCircle);

                // Create info window

                // Get circle info for infowindow;
                account_id = accountcircle.account_id;
                var revenue = accountcircle.revenue;
                var profit = accountcircle.profit;

                // Info window

                var infowindow_content = '<div id="iw-container">' +
                    '<div class="iw-title">Account Information</div>' +
                    '<div class="iw-content">' +
                    '<div class="iw-subTitle">account_id ' + account_id + '</div>' +
                    'Revenue:  ' + revenue + '<br\>' +
                    'Profit: ' + profit + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>';

                // Update building ID to the new info window
                var infowindow = new google.maps.InfoWindow({
                    content: infowindow_content
                    // position: new google.maps.LatLng(building_lat, building_lon),
                    // pixelOffset: {width: 200, height: 200, j: "px", f: "px"}
                });


                google.maps.event.addListener(accountcircle, 'click', function () {
                    infowindow.open(map, accountcircle);
                });

                google.maps.event.addListener(map, 'click', function () {
                    infowindow.close();
                });

                google.maps.event.addListener(infowindow, 'domready', function () {

                    // Reference to the DIV that wraps the bottom of infowindow
                    var iwOuter = $('.gm-style-iw');

                    /* Since this div is in a position prior to .gm-div style-iw.
                     * We use jQuery and create a iwBackground variable,
                     * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
                     */
                    var iwBackground = iwOuter.prev();

                    // Removes background shadow DIV
                    iwBackground.children(':nth-child(2)').css({'display': 'none'});

                    // Removes white background DIV
                    iwBackground.children(':nth-child(4)').css({'display': 'none'});

                    // Moves the infowindow 115px to the right.
                    iwOuter.parent().parent().css({left: '50px'});

                    // Moves the shadow of the arrow 76px to the left margin.
                    iwBackground.children(':nth-child(1)').attr('style', function (i, s) {
                        return s + 'left: 76px !important;'
                    });

                    // Moves the arrow 76px to the left margin.
                    iwBackground.children(':nth-child(3)').attr('style', function (i, s) {
                        return s + 'left: 76px !important;'
                    });

                    // Changes the desired tail shadow color.
                    iwBackground.children(':nth-child(3)').find('div').children().css({
                        'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px',
                        'z-index': '1'
                    });

                    // Reference to the div that groups the close button elements.
                    var iwCloseBtn = iwOuter.next();

                    // Apply the desired effect to the close button
                    iwCloseBtn.css({
                        opacity: '1',
                        right: '38px',
                        top: '3px',
                        border: '7px solid #48b5e9',
                        'border-radius': '13px',
                        'box-shadow': '0 0 5px #3990B9'
                    });

                    // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
                    if ($('.iw-content').height() < 140) {
                        $('.iw-bottom-gradient').css({display: 'none'});
                    }

                    // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
                    iwCloseBtn.mouseout(function () {
                        $(this).css({opacity: '1'});
                    });
                });

            })(a,b);
        }
    }
}



function generateBAsOnMap(num_filter, data) {

    // Sort the current buildings by filter
    var filteredIds = sortByFilter(data, num_filter);
    if(data[0]["building_id"]) {
        drawBuildings(filteredIds, data)
    }else{
        drawAccounts(filteredIds, data)
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
    createGoogleMap(google_map_div, currentMarketObject, "Top 10", QUERIED_DATA[currentMarketObject.city], i);

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
    var selected_num = "Top 10";
    var default_filter_key = "Top 10";


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
