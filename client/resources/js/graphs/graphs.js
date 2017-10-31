var ndx = crossfilter([]);
var partidoDimension;

function addData(feature){
  data[selectedState] = feature;

  ndx.remove();
  ndx.add(Object.values(feature));
}
