var PIECHART_CONTAINER_HEIGHT = 500;
var PIECHART_CONTAINER_WIDTH = 500;

var buildingPieChartOptions = {"Net Classification" : "net_classification",
                               "Type" : "type"};

var buildingPieChartKeys = Object.keys(buildingPieChartOptions);

function getPieChartData(buildings) {
    var pre_pie_data = []

    for (var i=0; i < buildings.length; i++) {
        var current_building = buildings[i];
        var current_data = current_building[buildingPieChartOptions[current_building_piechart_selection]];
        pre_pie_data.push(current_data);
    }

    pie_data = {};
    for (var i=0; i < pre_pie_data.length; i++) {
        var current = pre_pie_data[i];
        if (current in pie_data) {
            pie_data[current] += 1;
        }
        else {
            pie_data[current] = 1;
        }
    }

    result = [];
    for(var key in pie_data) {
        result.push({"label":key, "value":pie_data[key]})
    }
    return result;
}

function redrawPieChart(d) {
    d3.selectAll(".piechart").remove();
    initializePieChart(d);
}

function initializePieChart(d) {
    // Text header
    d3.select("#vis_3_svg_container").append("text")
        .attr("class", "piechart")
        .attr("x", 50)
        .attr("y", 50)
        .style("font-size", "40px")
        .style("opacity", 0)
        .text(function() {
            return "Market: " + d.city;
        });

    // Declare the histogram group
    d3.select("#vis_3_svg_container")
        .append("g")
        .attr("class", "piechart")
        .attr("height", PIECHART_CONTAINER_HEIGHT)
        .attr("width", PIECHART_CONTAINER_WIDTH)
        .attr("id", "piechart_group");

    // Select correct city data from the queried data
    var buildings = QUERIED_DATA[d.city];

    // Populate histogram with data
    plotPieChart(buildings);

    // Transition - fade it all in
    d3.selectAll(".piechart")
        .transition()
        .duration(500)
        .style("opacity", 1);
}

function plotPieChart(buildings) {

    var data = getPieChartData(buildings);
    var pie = new d3pie("piechart_group", {
        "data": {
            "content": data
        }
    });
}

function initializePullDownMenu(d) {
    // Set default histogram selection
    current_building_piechart_selection = buildingPieChartKeys[0];

    d3.select("#vis_3_button_div").append("select")
        .attr("id", "piechart_dropdown")
        .on("change", function() {
            current_building_piechart_selection = d3.select(this).property("value");
            redrawPieChart(d);
        })
        .selectAll("option")
        .data(buildingPieChartKeys).enter()
        .append("option")
        .text(function (d) { return d; });
}

function initializeBuildingPieChart(d) {
    // Clear previous
    d3.selectAll(".piechart").remove();
    d3.select("#piechart_dropdown").remove();
    // Initialize the pulldown menu
    initializePullDownMenu(d);
    // Initialize the piechart
    initializePieChart(d);

}