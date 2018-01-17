var selectedState, selectedYear, selectedVariable = ["POB1", "VIV35"];
var dictionary;

function initDashboard(options){
  showLoadingModal();

  selectedYear = options.sliderYears[0];

  dictionary = {};

  for(var option in options.variableCatalog){
    dictionary[option.toLowerCase()] = options.variableCatalog[option];
  }

  for(var option in options.institutionsCatalog){
    dictionary[option.toLowerCase()] = options.institutionsCatalog[option];
  }

  buildVariableMenu();
  buildMap("map", options);
  buildSelectState();
  buildSliderYear(options);

  updateView(); // start view
}

function buildVariableMenu(){
  var viviendaHtml = "";
  var html = "";
  for(var key in dictionary){
    if( key.startsWith("viv") ){
      viviendaHtml += '<a class="" id="' + key + '" href="#" onClick="selectVariable(this.id)">' + dictionary[key] + '</a><br>';
    }else{
      html += '<a class="" id="' + key + '" href="#" onClick="selectVariable(this.id)">' + dictionary[key] + '</a><br>';
    }
  }

  $("#variableViviendaDropdown .panel-body").html(viviendaHtml);
  $("#variablePoblacionDropdown .panel-body").html(html);
}


function buildSelectState(){
  $("#selectState").on("change", function(e){
    selectedState = e.target.value;
    $("#title").html( $("#selectState option[value='" + e.target.value + "']").text() );

    updateView();

    $(":focus").blur();
  });
}


function buildSliderYear(options){
  var min = 0;
  var max = options.sliderYears.length-1;

  $("#sliderYear").slider({
    value: min,
    min: min,
    max: max,
    step: 1,
    slide: function( event, ui ) {
      selectedYear = options.sliderYears[ui.value];

      updateView();
    }
  }).each(function() {
    var vals = max - min;

    for (var i = 0; i < options.sliderYears.length; i++) {
      var el = $('<label>' + options.sliderYears[i] + '</label>').css('left', (i/vals*100) + '%');
      $("#sliderYear").append(el);
    }
  });
}

function showLoadingModal(show=true){
  if(show){
    $("#chargingDialog").modal({
      backdrop: "static",
      keyboard: false
    });
  }else{
    $("#chargingDialog").modal("hide");
  }
}


function updateView(){
  showLoadingModal();

  var properties = "pob1,ganador,viv35,nom_mun";

  map.getPropertyData(properties, {test: "test"}, function(data){
    setData(data.features);

    map.cleanFilters();
    map.updateView();

    if(data.totalFeatures > 0){
      buildPartidosGraph();
      buildTopGraph();

      if(selectedState){
        buildScatterGraph();
      }
    }

    showLoadingModal(false);
  });
}
