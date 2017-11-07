function addSelectorGraph(){
  var partidoDimension = ndx.dimension(function(d){return d.properties.data[selectedYear]["Ganador"]});

  var chart = dc.pieChart("#selectorGraph");

  chart
    .dimension(partidoDimension)
    .group(partidoDimension.group())
    .colors(getPartidoColor)
    .legend(dc.legend());

  chart.on("filtered", function(chart, filter){
    var filters  = chart.filters();
    for(var layer of geojsonFeatures){
      if(filters.length > 0){
        if( filters.indexOf(layer.feature.properties.data[selectedYear]["Ganador"]) > -1 ){
          geojsonLayer.addLayer(layer);
        }else{
          geojsonLayer.removeLayer(layer);
        }
      }else{
        geojsonLayer.addLayer(layer);
      }
    }

  });

  chart.render();
  graphs.push(chart);
}
