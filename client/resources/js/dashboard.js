var selectedState, selectedYear = "2010", selectedVariable = ["Población total", "Población de 0 a 14 años"];

function initDashboard(options){
  showLoadingModal();

  buildVariableMenu(options.variableCatalog);
  buildMap("map", options);
  buildSelectState();
  buildSliderYear(options);

  showLoadingModal(false);
}

function buildVariableMenu(variableCatalog){
  var html = "";
  for(var variable of variableCatalog){
    html += '<a class="" href="javascript:selectVariable(\'' + variable + '\')">' + variable + '</a><br>';
  }
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
  selectedYear = options.sliderYears[0];

  $("#sliderYear").slider({
    value: min,
    min: min,
    max: max,
    step: 1,
    slide: function( event, ui ) {
      selectedYear = options.sliderYears[ui.value];

      if(selectedState){
        updateView();
      }
    }
  }).each(function() {
    var vals = max - min;

    for (var i = 0; i < options.sliderYears.length; i++) {
      var el = $('<label>' + options.sliderYears[i] + '</label>').css('left', (i/vals*100) + '%');
      $("#sliderYear").append(el);
    }
  });
}

// called from onClick html property
function selectVariable(variable){
  $("#variableAccordion .panel-collapse").collapse("hide");
  console.log(variable);
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
  // map.updateView();

  showLoadingModal();

  if(selectedState && !data[selectedState]){
    console.log("getting data", selectedState);

    window.getFeatureData(selectedState, function(feature){
      window.addData(feature);
      updateView();
    });
  }else{
    // data exists and is ready
    console.log("Updating view", selectedState, selectedYear);

    map.updateView();

    addSelectorGraph();
    addScatterGraph();
    // addGeoPath();

    showLoadingModal(false);
  }
}
