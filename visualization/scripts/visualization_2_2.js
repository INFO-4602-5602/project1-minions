// Reference: https://github.com/d3/d3-geo
// Example 1: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
// https://anthonyskelton.com/2016/d3-js-version-4/
// Scroll and grab - zoom into state: https://bl.ocks.org/mbostock/2374239
// Smooth zoom transitions THIS: https://bl.ocks.org/mbostock/9656675 (v3)
      // https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2 (v4)





function initializeVis_2(vis_container_id, scale=1000) {
  
  
  // Create the Google Map…
  var map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 8,
    center: new google.maps.LatLng(37.76487, -122.41948),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  // Load the station data. When the data comes back, create an overlay.
  d3.json("stations.json", function(error, data) {
    if (error) throw error;

    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "stations");

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      overlay.draw = function() {
        var projection = this.getProjection(),
            padding = 10;

        var marker = layer.selectAll("svg")
            .data(d3.entries(data))
            .each(transform) // update existing markers
          .enter().append("svg")
            .each(transform)
            .attr("class", "marker");

        // Add a circle.
        marker.append("circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding);

        // Add a label.
        marker.append("text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".31em")
            .text(function(d) { return d.key; });

        function transform(d) {
          d = new google.maps.LatLng(d.value[1], d.value[0]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
        }
      };
    };

    // Bind our overlay to the map…
    overlay.setMap(map);
  });
  
}



