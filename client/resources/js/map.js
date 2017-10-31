var data = {};
var map, geojsonLayer, geojsonFeatures = [];

function buildMap(id, options){
  console.log("creating map", options);

  var dataBounds = L.latLngBounds([[options.bb[3], options.bb[0]], [options.bb[1], options.bb[2]]]);

  map = L.map(id, {
    center: dataBounds.getCenter(),
    zoom: 5,
    minZoom: 5,
    maxZoom: 18
  });

  // baselayers
  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
  }).addTo(map);

  // data layer
  geojsonLayer = L.geoJSON(null, {
    style: buildStyle
  }).bindPopup(function (layer) {
    return "popup";
  }).addTo(map);

  // responsive
  $(window).resize(function() {
    map.invalidateSize();
  });

  map.updateView = function(){
    console.log("Updateing map");
    var feature = data[selectedState];

    geojsonLayer.clearLayers();
    for(var mun in feature){
      geojsonLayer.addData(feature[mun]);
    }

    geojsonFeatures = geojsonLayer.getLayers();

    map.fitBounds(geojsonLayer.getBounds());
  }
}


function buildStyle(feature){
  var key = feature.properties.data[selectedYear]["Ganador"];

  var style = {
    weight: 1,
    opacity: .7,
    color: 'white',
    dashArray: '3',
    fillOpacity: .6,
    fillColor: getPartidoColor(key)
  };

  return style;
}
