function addScatterGraph(){
  var chart = dc.scatterPlot("#scatterGraph");

  var dimension = ndx.dimension(function(d) {
    return [+d.properties.data[selectedYear][selectedVariable[0]], +d.properties.data[selectedYear][selectedVariable[1]], d.properties.data[selectedYear]["Ganador"]];
  });

  var x_dimension = ndx.dimension(function(d) { return +d.properties.data[selectedYear][selectedVariable[0]]; });
  var y_dimension = ndx.dimension(function(d) { return +d.properties.data[selectedYear][selectedVariable[1]]; });

  var min_x = +x_dimension.bottom(1)[0].properties.data[selectedYear][selectedVariable[0]];
  var max_x = +x_dimension.top(1)[0].properties.data[selectedYear][selectedVariable[0]] + (+x_dimension.top(1)[0].properties.data[selectedYear][selectedVariable[0]] * 10 / 1000); // 10% more
  var x_domain = d3.scale.linear().domain([min_x, max_x]);

  var min_y = +y_dimension.bottom(1)[0].properties.data[selectedYear][selectedVariable[1]];
  var max_y = +y_dimension.top(1)[0].properties.data[selectedYear][selectedVariable[1]] + (+x_dimension.top(1)[0].properties.data[selectedYear][selectedVariable[1]] * 10 / 1000); // 10% more
  var y_domain = d3.scale.linear().domain([min_y, max_y]);

  chart
    .x(x_domain)
    .y(y_domain)
    .colorAccessor(function (d) {
      return d.key[2];
    })
    .colors(getPartidoColor)
    .symbolSize(8)
    .clipPadding(10)
    .dimension(dimension)
    .group(dimension.group())
    .margins({top: 10, right: 50, bottom: 30, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .xAxisLabel(selectedVariable[0])
    .yAxisLabel(selectedVariable[1])


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
