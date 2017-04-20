var PIECHART_CONTAINER_HEIGHT = 500;
var PIECHART_CONTAINER_WIDTH = 500;

var PieChartOptions = {
    "Building":{"Net Classification" : "net_classification",
        "Type" : "type"},
    "Account": {"Industry": "industry",
        "Vertical": "vertical" }
};

function getPieChartData(data, type) {
    var pre_pie_data = [];

    for (var i=0; i < data.length; i++) {
        var curr_data = data[i];
        var ba_d = curr_data[PieChartOptions[type][current_building_piechart_selection]];
        pre_pie_data.push(ba_d);
    }

    var pie_data = {};
    for (var i=0; i < pre_pie_data.length; i++) {
        var current = pre_pie_data[i];
        if (current in pie_data) {
            pie_data[current] += 1;
        }
        else {
            pie_data[current] = 1;
        }
    }

    var result = [];
    for(var key in pie_data) {
        result.push({"label":key, "value":pie_data[key]})
    }
    return result;
}

function redrawPieChart(d, type) {
    d3.selectAll(".piechart").remove();
    reInitialize(d, type);
}

function plotPieChart(d, type) {

    var data = getPieChartData(d, type);
    var pie = new d3pie("piechart_group", {
        "data": {
            "content": data
        }
    });
}

function initializePullDownMenu(d, type) {
    // Set default histogram selection
    current_building_piechart_selection = Object.keys(PieChartOptions[type])[0];

    d3.select("#vis_3_button_div").append("select")
        .attr("id", "piechart_dropdown")
        .on("change", function() {
            current_building_piechart_selection = d3.select(this).property("value");
            console.log(current_building_piechart_selection);
            redrawPieChart(d, type);
        })
        .selectAll("option")
        .data(Object.keys(PieChartOptions[type])).enter()
        .append("option")
        .text(function (d) { return d; });
}

function reInitialize(d, type) {
    // Declare the histogram group
    d3.select("#vis_3_svg_container")
        .append("g")
        .attr("class", "piechart")
        .attr("height", PIECHART_CONTAINER_HEIGHT)
        .attr("width", PIECHART_CONTAINER_WIDTH)
        .attr("id", "piechart_group");


    // Populate histogram with data
    plotPieChart(d, type);

    // Transition - fade it all in
    d3.selectAll(".piechart")
        .transition()
        .duration(500)
        .style("opacity", 1);
}

function initializePieChart(d, type) {
    // Clear previous
    d3.selectAll(".piechart").remove();
    d3.select("#piechart_dropdown").remove();
    // Initialize the pulldown menu
    initializePullDownMenu(d, type);
    // Initialize the piechart
    reInitialize(d, type);
}