var map, wmsLayer;

var geoserver_url = "http://geo.datos.gob.mx/geoserver/goblab";

var layerNamePrefix = "view_mapa_";

function buildMap(id, options){
  console.log("creating map", options);

  // Layers
  wmsLayer = new ol.source.TileWMS({
    url: geoserver_url + "/wms",
    params: {"LAYERS": layerNamePrefix + selectedYear, "TILED": false, transparent: true, format: "image/png", "STYLES": "mapa_goblab_partido", "EPSG": "4326"},
    serverType: "geoserver"
  });

  mapboxLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/dark-v8/tiles/256/{z}/{x}/{y}?access_token=" + options.mapboxKey
    })
  });

  var layers = [
    mapboxLayer,
    new ol.layer.Tile({
      opacity: 0.8,
      source: wmsLayer
    })
  ];

  // Initial view
  var mapView = new ol.View({
    projection: "EPSG:4326",
    center: [-101.9563, 23.6257],
    zoom: 5
  });


  map = new ol.Map({
    layers: layers,
    target: "map",
    view: mapView
  });

  // Popup
  var infoPopup = new ol.Overlay.Popup();
  map.addOverlay(infoPopup);

  map.on("singleclick", function(evt) {
    var viewResolution = /** @type {number} */ (mapView.getResolution());
    var coordinates = evt.coordinate;

    var url = wmsLayer.getGetFeatureInfoUrl(coordinates, viewResolution, "EPSG:4326", {"info_format": "application/json", "propertyName": "nom_ent,nom_mun,pob1,viv9,ganador"});

    $.get(url, function(data){
      var featureInfo = data.features[0].properties;
      var html = "<div>";
      html += "<h3>" + featureInfo.nom_mun + ", <small>" + featureInfo.nom_ent + "</small></h3>";

      delete featureInfo.nom_mun;
      delete featureInfo.nom_ent;

      var output;
      for(var key in featureInfo){
        output = numeral(featureInfo[key]).value() ? numeral(featureInfo[key]).format("0,0"):featureInfo[key];
        html += "<small><b>" + dictionary[key.toLowerCase()] + "</b>: " + output + "</small><br>";
      }
      html += "</div>";

      infoPopup.show(coordinates, html);
    });
  });


  // Map functions
  map.updateView = function(){
    var newFilters = {
      "LAYERS": layerNamePrefix + selectedYear
    }

    if(selectedState){
      newFilters["cql_filter"] = "cvegeo LIKE '" + selectedState + "%'";
    }

    wmsLayer.updateParams(newFilters);
  }


  map.filterByKey = function(key, values){
    console.log("filtering by " + key, values);

    var filter = selectedState ? "cvegeo LIKE '" + selectedState + "%'":"";

    if(values.length > 0){
      var keys = "(";
      for(var accepted of values){
        keys += "'" + accepted + "',";
      }
      keys = keys.substring(0, keys.length - 1) + ")";

      filter = selectedState ? filter + " AND ":filter;
      filter += key + " IN " + keys;
    }

    filter = filter == "" ? null:filter;
    wmsLayer.updateParams({cql_filter: filter});
  }

  map.getPropertyData = function(property, filters, callback){
    var url = geoserver_url + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=goblab:" + layerNamePrefix + selectedYear + "&outputFormat=application/json&propertyName=" + property

    if(selectedState){
      url += "&cql_filter=cvegeo LIKE '" + selectedState + "%25'"
    }

    for(var key in filters){
      url += "&" + key + "=" + filters[key];
    }

    $.get(url, callback);
  }

  map.cleanFilters = function(){
    wmsLayer.updateParams({"cql_filter": null});
  }
}



// called from onClick html property
function selectVariable(variable){
  showLoadingModal();
  $("#variableAccordion .panel-collapse").collapse("hide");
  selectedVariable[0] = variable;

  var choroplethStepCount = 7;

  var filters = {
    maxFeatures: 1,
    sortBy: variable + "+D"
  }

  // build style for property
  map.getPropertyData(variable, filters, function(maxValueResponse){
    filters["sortBy"] = variable + "+A";
    map.getPropertyData(variable, filters, function(minValueResponse){
      var maxValue = maxValueResponse.features[0].properties[variable]
      var minValue = minValueResponse.features[0].properties[variable]

      var colors = palette(["sequential"], choroplethStepCount, 4);
      var step = parseInt((maxValue - minValue)/choroplethStepCount);

      console.log(colors, step)
    });
  });

  showLoadingModal(false);
}
