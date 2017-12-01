var data = {};
var map, geojsonLayer, geojsonFeatures = [], wmsLayer;

function buildMap(id, options){
  console.log("creating map", options);

  wmsLayer = new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/cedn/wms/',
    params: {'LAYERS': 'censo_mapa', 'TILED': false, transparent: true, format: "image/png"},
    serverType: 'geoserver'
  });

  var layers = [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      })
    }),
    new ol.layer.Tile({
      source: wmsLayer
    })
  ];

  map = new ol.Map({
    layers: layers,
    target: 'map',
    view: new ol.View({
      projection: 'EPSG:4326',
      center: [-101.9563, 23.6257],
      zoom: 5
    })
  });

  map.updateView = function(){
    wmsLayer.updateParams({cql_filter: "cve_ent='" + selectedState + "'"})
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
