var partidosData;

function buildPartidosGraph(){
  var partidoDimension = ndx.dimension(function(d){return d.properties["ganador"]});

  var chart = dc.pieChart("#selectorGraph");

  chart
    .height(130)
    .dimension(partidoDimension)
    .group(partidoDimension.group())
    .colors(getPartidoColor)
    // .radius(50)
    .legend(dc.legend());

  chart.on("filtered", function(chart, filter){
    map.filterByKey("ganador", chart.filters())
  });

  chart.render();
  graphs.push(chart);
}
