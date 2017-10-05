var map, geojsonLayer, data = {}, stateSelected, yearSelected, opacityValue, selectedVariable, variableValues, variableColors, chartVariable;
var addControls = true, showVariable = false, showChart = false, showInstitutionsChart = false;
var chartHeight;
var currentSelectedPieceLabel = "", institutionsVariable;

var bubbleChart, ctx;
var pieChart, ctxPie;

function updateMapView(){
    console.log("updating map");

    buildVariableValues();

    feature = data[stateSelected];
    geojsonLayer.clearLayers();

    var geojsonFeature;
    for(var mun in feature){
        geojsonLayer.addData(feature[mun]);
    }

    // choropleth
    var html = "";
    if(!showVariable){
        for(var key in choropleth){
            html += "<i style='background: " + choropleth[key] + "'></i> " + key.replace(/,/g,", ").toUpperCase() + "<br>";
        }
    }else{
        for(var i = 0; i < variableValues.length; i++){
            key = variableValues[i][0];
            html += "<i style='background: " + getVariableColor(key) + "'></i> <b>" + data[stateSelected][key].properties.NOM_MUN + "</b>: " + numeral(variableValues[i][1]).format('0,0') + "<br>";
        }
    }
    $("#choroplethContent").html(html);

    // charts
    updateChart();
    updateInstitutionsChart();

    map.fitBounds(geojsonLayer.getBounds());
    showLoadingModal(false);
}


function updateInstitutionsChart(){
    if(pieChart){
        pieChart.destroy();
    }

    if(showInstitutionsChart){
        ctxPie = ctxPie ? ctxPie:document.getElementById("chartVariableJustice");

        var dataJustice = {};
        for(var key in data[stateSelected]){
            if(dataJustice[data[stateSelected][key].properties.data[yearSelected][institutionsVariable]]){
                dataJustice[data[stateSelected][key].properties.data[yearSelected][institutionsVariable]]++;
            }else{
                dataJustice[data[stateSelected][key].properties.data[yearSelected][institutionsVariable]] = 1;
            }
        }

        var dataAux = [];
        var labels = [];
        var colorsAux = [];
        for(var key in dataJustice){
            dataAux.push(dataJustice[key]);
            labels.push(key);
            colorsAux.push(choropleth[key.toLowerCase()]);
        }

        pieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataAux,
                    backgroundColor: colorsAux,
                    borderWidth: 3
                }]
            }
        });

        console.log("updating listeners");
        $("#chartVariableJustice").off("click");
        $('#chartVariableJustice').on('click', function (event) {
            var activePoints = pieChart.getElementsAtEvent(event);

            if (activePoints.length > 0) {
                var clickedElementindex = activePoints[0]["_index"];
                var clickedLabel = pieChart.data.labels[clickedElementindex].toLowerCase();

                pieChart.update();

                if(clickedLabel!=currentSelectedPieceLabel){
                    // make selection
                    activePoints[0]["_model"].outerRadius += 10;
                    currentSelectedPieceLabel = clickedLabel;
                }else{
                    currentSelectedPieceLabel = "";
                }

                geojsonLayer.setStyle(buildStyle);
            }
        });
    }
}



function updateChart(){
    if(bubbleChart){
        bubbleChart.destroy();
    }

    if(showChart){
        var x, y, chartValues = [], chartColors = [], chartLabels = [];

        console.log(data[stateSelected])
        for(var key in data[stateSelected]){
            y = data[stateSelected][key].properties.data[yearSelected][chartVariable];
            x = data[stateSelected][key].properties.data[yearSelected][selectedVariable];

            chartValues.push({x: x, y: y, r:5});
            chartColors.push(getVariableColor(data[stateSelected][key].properties.CVEGEO));
            chartLabels.push(data[stateSelected][key].properties.NOM_MUN);
        }

        var chartOptions = {
            responsive: true,
            legend: {
                display: false
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    title: function(tooltip, data){
                        return chartLabels[tooltip[0].index];
                    },
                    label: function(element, data){
                        return "(" + numeral(element.xLabel).format("0,0") + ", " + numeral(element.yLabel).format("0,0") + ")";
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        callback: function(value, index, values) {
                            return numeral(value).format('0.0a');
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: chartVariable
                    }
                }],
                xAxes: [{
                    ticks: {
                        callback: function(value, index, values) {
                            return numeral(value).format('0.0a');
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: selectedVariable
                    }
                }]
            }
        }

        ctx = ctx ? ctx:document.getElementById("chartVariable").getContext('2d');

        bubbleChart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    data: chartValues,
                    backgroundColor: chartColors
                }]
            },
            options: chartOptions
        });
    }
}


function buildVariableValues(){
    variableValues = [];
    for(var key in data[stateSelected]){
        variableValues.push([key, +data[stateSelected][key].properties.data[yearSelected][selectedVariable]]);
    }
    variableValues.sort(function(a, b){
        return b[1]-a[1];
    });

    var colorsAux = palette('tol-sq', variableValues.length).reverse();
    variableColors = [];
    for(var i = 0; i < variableValues.length; i++){
        variableColors.push([variableValues[i][0], colorsAux[i]]);
    }
}


function getVariableColor(key){
    for(var i = 0; i < variableColors.length; i++){
        if( variableColors[i][0] == key ){
            return "#" + variableColors[i][1];
        }
    }
}


function buildOpacityControl(){
    opacityValue = .40;

    var opacityControl = L.control({position: "bottomleft"});

    opacityControl.onAdd = function (map) {
        var html = "Transparencia de la capa de datos: ";
        html +="<input id='sliderOpacity' type='text' data-slider-id='sliderOpacity' data-slider-min='0' data-slider-max='100' data-slider-step='1'>";

        return getNewControlDom(html, "leaflet-slider-opacity");
    };

    opacityControl.addTo(map);

    $("#sliderOpacity").slider({
        value: opacityValue * 100
    });

    $("#sliderOpacity").on("slideStop", function(e) {
        console.log("updating opacity");

        opacityValue = (e.value/100);
        geojsonLayer.setStyle(buildStyle);
    });
}


function buildChoropleth(){
    var choroplethControl = L.control({position: "topleft"});

    choroplethControl.onAdd = function (map) {
        return getNewControlDom("<div id='choroplethContent'></div>");
    }

    choroplethControl.addTo(map);

    var maxHeight = $(".leaflet-slider-opacity").offset().top - $("#choroplethContent").offset().top - 20;
    $("#choroplethContent").css("max-height", maxHeight + "px");
}


function buildSecondaryControls(variableCatalog, institutionsCatalog){
    var variableControl = L.control({position: "bottomright"});

    variableControl.onAdd = function (map) {
        var html = "<b>Características de la población: </b><br>";

        html += "<select id='selectVariable1' class='selectpicker' data-width='100%' data-title='Selecciona una variable para visualizarla en el mapa' data-dropdown-align-right='true' data-size=10>";
        var selectAux = "<select id='selectVariable2' class='selectpicker' data-width='100%' data-title='Selecciona una segunda variable para graficar' data-dropdown-align-right='true' data-size=10 disabled>";

        var key;
        for(var i = 0; i < variableCatalog.length; i++){
            key = variableCatalog[i];
            html += "<option value='" + key + "'>" + key + "</option>";
            selectAux += "<option value='" + key + "'>" + key + "</option>";
        }

        html += "<option value='na'>No mostrar variable</option>";
        selectAux += "<option value='na'>No graficar</option>"

        html += "</select><br>";
        html += selectAux + "</select>";

        html += "<div id='canvas-holder' style='padding-top:10px; height:0;'>";
        html += "<canvas id='chartVariable' height=0/>";
        html += "</div>";


        // justices
        html += "<span style='font-weight:bold;'>Instituciones y Justicia: </span><br>";
        html += "<select id='selectInstitutions' class='selectpicker' data-width='100%' data-title='Selecciona una variable' data-dropdown-align-right='true' data-size=10>";
        for(var i = 0; i < institutionsCatalog.length; i++){
            key = institutionsCatalog[i];
            html += "<option value='" + key + "'>" + key + "</option>";
        }
        html += "<option value='na'>No mostrar variable</option>";
        html += "</select>";

        html += "<div id='canvas-holder-justice' style='height:0;'>";
        html += "<canvas id='chartVariableJustice' height=0/>";
        html += "</div>";

        return getNewControlDom(html, "secondary-controls");
    }

    variableControl.addTo(map);

    $("#selectVariable1, #selectVariable2, #selectInstitutions").selectpicker({});

    $("#selectVariable1").on("change", function(e){
        console.log("updating style");
        selectedVariable = e.target.value;

        showVariable = (selectedVariable!="na");

        if(!showVariable){
            $("#selectVariable2").selectpicker("val", "na");
            $("#selectVariable2").trigger("change");

            $('#selectVariable2').attr("disabled", true);
            $('#selectVariable2').selectpicker('refresh');
        }else if($("#selectVariable2").attr("disabled")){
            $('#selectVariable2').attr("disabled", false);
            $('#selectVariable2').selectpicker('refresh');
        }

        updateMapView();
    });

    $("#selectVariable2").on("change", function(e){
        console.log("updating chart", e.target.value);
        chartVariable = e.target.value;

        showChart = (chartVariable!="na");

        chartHeight = (chartHeight)? chartHeight:$(".secondary-controls").offset().top - $(".state-control").offset().top + $(".state-control").height() - 350;
        if(showChart){
            $("#chartVariable, #canvas-holder").css("height", chartHeight + "px");
        }else{
            $("#chartVariable, #canvas-holder").css("height", "0px");
        }

        updateChart();
    });

    $("#selectInstitutions").on("change", function(e){
        institutionsVariable = e.target.value;

        showInstitutionsChart = (e.target.value!="na");
        if(showInstitutionsChart){
            $("#chartVariableJustice, #canvas-holder-justice").css("height", "150px");
        }else{
            $("#chartVariableJustice, #canvas-holder-justice").css("height", "0px");
        }

        updateInstitutionsChart();
    });
    
    $("#selectState").css("z-index","9999999999999");
}


function buildPrimaryControl(catalog, ticks, variableCatalog, institutionsCatalog){
    var control = L.control({position: "topright"});

    control.onAdd = function (map) {
        var html = "<div class='row'><div class='col-sm-12 col-md-12'><div class='form-group'>"
        html += "<select id='selectState' data-container='body' class='selectpicker form-control' data-width='100%' data-title='Selecciona un estado para iniciar la visualización' data-live-search='true' data-dropdown-align-right='true' data-live-search-placeholder='Buscar' data-size='5'>";

        for(var key in catalog){
            html += "<option value='" + key + "'>" + catalog[key] + "</option>";
        }

        html += "</select>";
        html += "</div></div></div>";

        // slide year
        html += "<div class='row'><div class='col-md-8 col-md-offset-2 text-center'>";
        html += '<input type="text" id="sliderYear"><br>';
        html += "<span>Mostrando año <span id='sliderYearLabel' style='font-weight: bold;'>2010</span></span></div></div>";

        return getNewControlDom(html, "state-control");
    };

    control.addTo(map);

    $("#selectState").selectpicker({});
    $("#selectState").on("change", function(e){
        console.log("state changed", e);
        showLoadingModal();
        stateSelected = e.target.value;

        if(addControls){
            buildSecondaryControls(variableCatalog, institutionsCatalog);
            buildOpacityControl();
            buildChoropleth();

            addControls = false;
        }

        if(data[stateSelected]){
            updateMapView();
        }else{
            window.getFeatureData(stateSelected, function(feature){
                data[stateSelected] = feature;
                updateMapView();
            });
        }
    });

    $("#sliderYear").slider({
        ticks: ticks,
        min: ticks[0],
        max: ticks[ticks.length-1],
        step: +ticks[ticks.length-1] - +ticks[0]
    });
    $("#sliderYear").on("change", function(e) {
        console.log("updating data");

        yearSelected = e.value.newValue;
    	$("#sliderYearLabel").text(yearSelected);

        geojsonLayer.eachLayer(function(layer){
            layer.bindPopup( buildPopup(layer.feature.properties) );
        });

        updateMapView();
    });

    yearSelected = ticks[0];
}



function getNewControlDom(content, extraClass=""){
    var div = L.DomUtil.create("div", "info legend " + extraClass);

    div.addEventListener('mouseover', function () {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        if(geojsonLayer.isPopupOpen()){
            currentPopup = geojsonLayer.getPopup();
        }
    });

    div.addEventListener('mouseout', function () {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();

        currentPopup = null;
    });

    div.innerHTML = content;

    return div;
}


function buildMap(id, options){
    console.log("creating map", options);

    var dataBounds = L.latLngBounds([[options.bb[3], options.bb[0]], [options.bb[1], options.bb[2]]]);

    map = L.map(id, {
        center: dataBounds.getCenter(),
        zoom: 6,
        minZoom: 5,
        maxZoom: 18
    });

    // baselayers
    var cartoDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(map);

    // data layer
    geojsonLayer = L.geoJSON(null, {
        style: buildStyle
    }).bindPopup(function (layer) {
        return buildPopup(layer.feature.properties);
    }).addTo(map);

    // responsive
    $(window).resize(function() {
        map.invalidateSize();
    });

    buildPrimaryControl(options.statesCatalog, options.sliderTicks, options.variableCatalog, options.institutionsCatalog);
    showLoadingModal(false);
}


function buildStyle(feature){
    var key = feature.properties.data[yearSelected]["Ganador"].toLowerCase();

    var style = {
        weight: 1,
        opacity: .7,
        color: 'white',
        dashArray: '3',
        fillOpacity: opacityValue
    };

    if(showVariable){
        for(var i = 0; i < variableValues.length; i++){
            if(variableValues[i][0]==feature.properties.CVEGEO){
                style.fillColor = getVariableColor(feature.properties.CVEGEO);
                break;
            }
        }
    }else{
        style.fillColor = choropleth[key] ? choropleth[key]:choropleth["na"];
    }


    if(currentSelectedPieceLabel!="" && key!=currentSelectedPieceLabel){
        style.fillOpacity = 0;
        style.opacity = 0;
    }

    return style;
}


function buildPopup(properties){
    var popup = "<b>" + properties.NOM_MUN + "</b><br>";

    var orderedValues = ["Ganador"]
    if(properties.data[yearSelected]){
        popup += "<br>Datos del año: " + yearSelected + "<br>";
        for(var i = 0; i < orderedValues.length; i++){
            popup += "<br><b>" + orderedValues[i] + "</b>: " + properties.data[yearSelected][orderedValues[i]];
        }

        for(var key in properties.data[yearSelected]){
            if(orderedValues.indexOf(key) < 0){
                popup += "<br><b>" + key + "</b>: " + numeral(properties.data[yearSelected][key]).format("0,0");
            }
        }
    }

    return popup;
}


var choropleth = {
    "0" : "#FFFFFF",
    "pri" : "#EE0000",
    "prd" : "#FFD700",
    "mc" : "#EE9A00",
    "pt" : "#CDCD00",
    "pvem" : "#458B00",
    "pna" : "#00C5CD",
    "pan" : "#27408B",
    "apm" : "#F0E68C",
    "pan,prd,na,pebc" : " #BCD2EE",
    "pri,pt,pvem,pes" : "#EE5C42",
    "pri.pt.pvem.pna": "#EE5C42",
    "na" : "#FFFFFF",
    "nnu" : "#EE5C42",
    "pri,pvem" : "#EE5C42",
    "pri,pvem" : "#EE5C42",
    "prd,pt,pna" : "#F0E68C",
    "morena" : "#8B5742",
    "verde" : "#458B00",
    "pes" : "#FFBBFF",
    "prd,pt,mc" : "#F0E68C",
    "independiente" : "#C71585",
    "pan,udc" : "#BCD2EE"
}
