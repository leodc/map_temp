function addScatterGraph(){
  var chart = dc.scatterPlot("#scatterGraph");

  var dimension = ndx.dimension(function(d) {
    return [+d.properties.data[selectedYear][selectedVariable[0]], +d.properties.data[selectedYear][selectedVariable[1]], d.properties.data[selectedYear]["Ganador"]];
  });

  var x_dimension = ndx.dimension(function(d) { return +d.properties.data[selectedYear][selectedVariable[0]]; });

  chart
    .x(d3.scale.linear().domain([+x_dimension.bottom(1)[0].properties.data[selectedYear][selectedVariable[0]], +x_dimension.top(1)[0].properties.data[selectedYear][selectedVariable[0]]]))
    .colorAccessor(function (d) {
      return d.key[2];
    })
    .colors(getPartidoColor)
    .symbolSize(8)
    .clipPadding(10)
    .dimension(dimension)
    .group(dimension.group());

  chart.on("filtered", function(chart, filter){
    var filters  = chart.filters();

    for(var layer of geojsonFeatures){
      if(filters.length > 0){
        if( filters[0].isFiltered([+layer.feature.properties.data[selectedYear][selectedVariable[0]],+layer.feature.properties.data[selectedYear][selectedVariable[1]]]) ){
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
