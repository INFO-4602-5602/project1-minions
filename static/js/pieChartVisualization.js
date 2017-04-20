var PIECHART_CONTAINER_HEIGHT = 500;
var PIECHART_CONTAINER_WIDTH = 500;

var PieChartOptions = {
    "Building":{"Net Classification" : "net_classification",
        "Type" : "type"},
    "Account": {"Industry": "industry",
        "Vertical": "vertical" },
    "Opportunity": {"Stage Name": "stage_name",
        "Product Group": "product_group"}
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
    var t = 3;
    if(type==="Opportunity") {
        t = 4;
    }

    d3.selectAll(".piechart"+t).remove();
    reInitialize(d, type);
}

function plotPieChart(d, type) {
    var t = 3;
    if(type==="Opportunity") {
        t = 4;
    }
    var data = getPieChartData(d, type);
    var pie = new d3pie("piechart_group"+t, {
        "data": {
            "content": data
        }
    });
}

function initializePullDownMenu(d, type) {
    // Set default histogram selection

    var t = 3;
    if(type==="Opportunity") {
        t = 4;
    }

    current_building_piechart_selection = Object.keys(PieChartOptions[type])[0];

    d3.select("#vis_" + t + "_button_div").append("select")
        .attr("id", "piechart_dropdown"+t)
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
    var t = 3;
    if(type==="Opportunity") {
        t = 4;
    }
    d3.select("#vis_" + t + "_svg_container")
        .append("g")
        .attr("class", "piechart"+t)
        .attr("height", PIECHART_CONTAINER_HEIGHT)
        .attr("width", PIECHART_CONTAINER_WIDTH)
        .attr("id", "piechart_group"+t);

    // Populate histogram with data
    plotPieChart(d, type);

    // Transition - fade it all in
    d3.selectAll(".piechart"+t)
        .transition()
        .duration(500)
        .style("opacity", 1);
}

function initializePieChart(d, type) {
    var t = 3;
    if(type==="Opportunity") {
        t = 4;
    }
    // Clear previous
    d3.selectAll(".piechart"+t).remove();
    d3.select("#piechart_dropdown"+t).remove();
    // Initialize the pulldown menu
    initializePullDownMenu(d, type);
    // Initialize the piechart
    reInitialize(d, type);
}