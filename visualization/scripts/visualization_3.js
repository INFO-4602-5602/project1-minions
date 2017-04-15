
function initializeVis_3(vis_container_id) {
  console.log("HERE IN VIS 3 INIT");
  d3.json("data/flare.json", function(error, flare) {
    if (error) throw error;

    run_vis(flare, vis_container_id);
  });
  
}