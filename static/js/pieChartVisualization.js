var PIECHART_CONTAINER_HEIGHT = 400;
var PIECHART_CONTAINER_WIDTH = 500;

var buildingPieChartOptions = {"Net Classification" : "net_classification",
                               "Type" : "type"};

var buildingPieChartKeys = Object.keys(buildingPieChartOptions);

function getHistogramData(buildings) {
    var pre_histo_data = []
    for (var i=0; i < buildings.length; i++) {
        var current_building = buildings[i];

        var selection_id = buildingHistogramOptions[current_building_histogram_selection];

        var current_data = current_building[selection_id];
        pre_histo_data.push(current_data);
    }


    histogram_data = {};
    for (var i=0; i < pre_histo_data.length; i++) {
        var current = pre_histo_data[i];
        if (current in histogram_data) {
            histogram_data[current] += 1;
        }
        else {
            histogram_data[current] = 1;
        }
    }
}

function getPieChartData(){
    return  [
        {
            "label": "One",
            "value" : 29.765957771107
        } ,
        {
            "label": "Two",
            "value" : 0
        } ,
        {
            "label": "Three",
            "value" : 32.807804682612
        } ,
        {
            "label": "Four",
            "value" : 196.45946739256
        } ,
        {
            "label": "Five",
            "value" : 0.19434030906893
        } ,
        {
            "label": "Six",
            "value" : 98.079782601442
        } ,
        {
            "label": "Seven",
            "value" : 13.925743130903
        } ,
        {
            "label": "Eight",
            "value" : 5.1387322875705
        }
    ];
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
        .attr("id", "piechart_group")
        .attr("transform", "translate(50, 100)");

    // Select correct city data from the queried data
    var buildings = QUERIED_DATA[d.city];

    // Populate histogram with data
    plotPieChart();

    // Transition - fade it all in
    d3.selectAll(".piechart")
        .transition()
        .duration(500)
        .style("opacity", 1);
}

function plotPieChart() {

    var pie = new d3pie("piechart_group", {
        "data": {
            "content": [
                {"label":"Master Course","value":2807},
                {"label":"Affiliates", "value":1072},
                {"label":"Ebook", "value": 972}
            ]
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