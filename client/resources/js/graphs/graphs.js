var ndx = crossfilter([]);
var graphs = [];

function addData(feature){
  data[selectedState] = feature;

  ndx.remove();
  ndx.add(Object.values(feature));
}

function cleanFilters(){
  _.each(graphs, function(graph){
    graph.filterAll();
  });

  dc.redrawAll();
}
