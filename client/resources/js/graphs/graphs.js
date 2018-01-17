var ndx = crossfilter([]);
var graphs = [];

function setData(features){
  ndx.remove();

  ndx = crossfilter([]);
  ndx.add(features);

  graphs = [];
}

function cleanFilters(){
  _.each(graphs, function(graph){
    graph.filterAll();
  });

  dc.redrawAll();
}
