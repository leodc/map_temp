function buildScatterGraph(){
  var chart = dc.scatterPlot("#scatterGraph");

  var dimension = ndx.dimension(function(d) {
    return [+d.properties["pob1"], +d.properties["viv35"], d.properties["ganador"]];
  });

  var x_dimension = ndx.dimension(function(d) { return +d.properties["pob1"]; });

  var min_x = +x_dimension.bottom(1)[0].properties["pob1"];
  var max_x = +x_dimension.top(1)[0].properties["viv35"];

  chart
    .x(d3.scale.linear().domain([min_x, max_x]))
    .dimension(dimension)
    .group(dimension.group())

    .elasticY(true)
    .elasticX(true)
    .yAxisPadding("10%")
    .xAxisPadding("10%")

    .xAxisLabel(dictionary["pob1"])
    .yAxisLabel(dictionary["viv35"].substring(0,25) + "...")

    .colorAccessor(function (d) {
      return d.key[2];
    })
    .colors(getPartidoColor)

    .symbolSize(8)

    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)

    .margins({top: 5, right: 0, bottom: 50, left: 70})



  chart.on("filtered", function(chart, filter){
    var filters  = chart.filters();

    if(filters.length > 0){
      console.log(filters)
      console.log(filters[0].isFiltered([50000, 20000]))
    }

    // for(var layer of geojsonFeatures){
    //   if(filters.length > 0){
    //     if( filters[0].isFiltered([+layer.feature.properties.data[selectedYear][selectedVariable[0]],+layer.feature.properties.data[selectedYear][selectedVariable[1]]]) ){
    //       geojsonLayer.addLayer(layer);
    //     }else{
    //       geojsonLayer.removeLayer(layer);
    //     }
    //   }else{
    //     geojsonLayer.addLayer(layer);
    //   }
    // }
  });

  chart.render();

  graphs.push(chart);
}
