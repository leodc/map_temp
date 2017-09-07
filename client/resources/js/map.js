var map, geojsonLayer, data = {}, stateSelected, yearSelected, currentPopup, choroplethControl, variableControl, selectedVariable, opacityControl, chartVariable;
var choroplethControlFlag = false, variableControlFlag = false, showVariable = false, opacityControlFlag = false, ctx, showChartFlag = false, bubbleChart;
var variableValues, variableColors, opacityValue = .40;


function updateVariableChart(){
    if(bubbleChart){
        bubbleChart.destroy();
    }

    if(showChartFlag){
        var x, y, chartValues = [], chartColors = [], chartLabels = [];
        for(var key in data[stateSelected]){
            x = data[stateSelected][key].properties.data[yearSelected][chartVariable];
            y = data[stateSelected][key].properties.data[yearSelected][selectedVariable];

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
                    }
                }
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


function showSelectedState(){
    console.log("show state", stateSelected, yearSelected);

    feature = data[stateSelected];

    geojsonLayer.clearLayers();

    var geojsonFeature;
    for(var mun in feature){
        geojsonLayer.addData(feature[mun]);
    }

    map.fitBounds(geojsonLayer.getBounds());

    if(!choroplethControlFlag){
        choroplethControl.addTo(map);
        choroplethControlFlag = true;
    }

    if(!opacityControlFlag){
        opacityControl.addTo(map);

        $("#sliderOpacity").slider({
            value: opacityValue * 100
        });

        $("#sliderOpacity").on("slideStop", function(e) {
            console.log("updating opacity");

            opacityValue = (e.value/100);
            geojsonLayer.setStyle(buildStyle);
        });

        opacityControlFlag = true;
    }

    buildVariableValues();

    if(!variableControlFlag){
        variableControl.addTo(map);
        variableControlFlag = true;

        var html = "<b>Características de la población: </b><br>";
        html += "<select id='selectVariable1' class='selectpicker' data-width='auto' data-title='Selecciona una variable para visualizarla en el mapa' data-dropdown-align-right='true' data-size=10>";
        var selectAux = "<select id='selectVariable2' class='selectpicker' data-width='100%' data-title='Selecciona una segunda variable para graficar' data-dropdown-align-right='true' data-size=10 disabled>"

        var singleFeature = feature[Object.keys(feature)[0]];

        for(var key in singleFeature.properties.data[yearSelected]){
            if(key.startsWith("Población")){
                html += "<option value='" + key + "'>" + key + "</option>";
                selectAux += "<option value='" + key + "'>" + key + "</option>";
            }
        }

        html += "<option value='na'>No mostrar variable</option>";
        selectAux += "<option value='na'>No graficar</option>"

        html += "</select><br>";
        html += selectAux + "</select>";

        html += "<div id='canvas-holder' style='margin-top:10px'>";

        html += "<canvas id='chartVariable' />";

        html += "</div>";

        $("#variableControlContent").html(html);
        $("#selectVariable1, #selectVariable2").selectpicker({});

        $("#selectVariable1").on("change", function(e){
            console.log("updating style");
            selectedVariable = e.target.value;

            showVariable = (selectedVariable!="na");

            buildVariableValues();
            geojsonLayer.setStyle(buildStyle);

            updateVariableChart();

            if($("#selectVariable2").attr("disabled")){
                $('#selectVariable2').attr("disabled", false);
                $('#selectVariable2').selectpicker('refresh');
            }
        });

        $("#selectVariable2").on("change", function(e){
            console.log("updating chart", e.target.value);
            chartVariable = e.target.value;

            showChartFlag = (chartVariable!="na");

            updateVariableChart();
        });
    }

    updateVariableChart();
    geojsonLayer.setStyle(buildStyle);
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

    // update choropleth
    var html = "";
    if(!showVariable){
        for(var key in choropleth){
            html += "<i style='background: " + choropleth[key] + "'></i> " + key.replace(/,/g,", ").toUpperCase() + "<br>";
        }
    }else{
        for(var i = 0; i < variableValues.length; i++){
            key = variableValues[i][0];
            html += "<i style='background: " + getVariableColor(key) + "'></i> " + data[stateSelected][key].properties.NOM_MUN + " (" + variableValues[i][1] + ")<br>";
        }
    }

    $("#choroplethContent").html(html);
    console.log("updating chropleth");
}


function buildVariableControl(){
    variableControl = L.control({position: "bottomright"});

    variableControl.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");

        var html = "<div id='variableControlContent' style='max-width:\"1%\"'>";
        html += "</div>";

        div.innerHTML = html;

        addControlListernes(div);
        return div;
    }
}

function buildOpacityControl(){
    opacityControl = L.control({position: "bottomleft"});

    opacityControl.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");

        var html = "Transparencia de la capa de datos: ";
        html +="<input id='sliderOpacity' type='text' data-slider-id='sliderOpacity' data-slider-min='0' data-slider-max='100' data-slider-step='1'>";
        // html += "<span id='sliderOpacityLabel'>40</span>";

        div.innerHTML = html;
        addControlListernes(div);
        return div;
    };
}

function buildChoropleth(){
    choroplethControl = L.control({position: "topleft"});

    choroplethControl.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML = "<div id='choroplethContent' class=''></div>";
        addControlListernes(div);
        return div;
    }
}


function setDataBoundingbox(bb){
    map.fitBounds([[bb[3], bb[0]], [bb[1], bb[2]]]);
}


function addControlListernes(div){
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
}

function buildSliderControl(ticks){
    var control = L.control({position: "topright"});

    control.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");

        var html = "<div class='row'><div class='col-md-8 col-md-offset-2'>";
        html += '<input type="text" id="sliderYear"><br>';
        html += "<span>Año seleccionado: <span id='sliderYearLabel' style=''>2010</span></span></div></div>";

        // select
        html += "<br>";
        html += "<div class='row'><div class='col-sm-12 col-md-12'><div class='form-group'>"
        html += "<select id='selectState' class='selectpicker' data-width='auto' data-title='Selecciona un estado para iniciar la visualización' data-live-search='true' data-dropdown-align-right='true' data-live-search-placeholder='Buscar' data-size=5></select>";
        html += "</div></div></div>";

        div.innerHTML = html;
        addControlListernes(div);
        return div;
    };

    control.addTo(map);

    $("#sliderYear").slider({
        ticks: ticks,
        ticks_snap_bounds: 10
    });

    $("#sliderYear").on("change", function(e) {
        console.log("updating data");

        yearSelected = e.value.newValue;
    	$("#sliderYearLabel").text(yearSelected);

        geojsonLayer.eachLayer(function(layer){
            layer.bindPopup( buildPopup(layer.feature.properties) );
        });

        buildVariableValues();
        geojsonLayer.setStyle(buildStyle);

        if(currentPopup){
            setTimeout(function(){
                if(currentPopup){
                    currentPopup.openOn(map);
                }
            }, 500);
        }

        updateVariableChart();
    });

    yearSelected = ticks[0];

    $("#selectState").on("change", stateChanged);

    return control;
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
                popup += "<br><b>" + key + "</b>: " + properties.data[yearSelected][key];
            }
        }
    }

    return popup;
}


function buildStyle(feature){
    var key = feature.properties.data[yearSelected]["Ganador"].toLowerCase();

    var style = {
        weight: 1,
        opacity: 7,
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

    if(!choropleth[key]){
        console.log("Color no encontrado", key);
    }

    return style;
}


function getVariableColor(key){
    for(var i = 0; i < variableColors.length; i++){
        if( variableColors[i][0] == key ){
            return "#" + variableColors[i][1];
        }
    }
}


function updateStatesCatalogOptions(catalog){
    var html = "";
    for(var key in catalog){
        html += "<option value='" + key + "'>" + catalog[key] + "</option>";
    }

    $("#selectState").html(html);
    $("#selectState").selectpicker("refresh");
}


function initMap(id){
    map = L.map(id, {
        center: [20,0],
        zoom: 6,
        minZoom: 5,
        maxZoom: 18
    });

    // baselayers
    var cartoDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(map);

    // overlayers
    geojsonLayer = L.geoJSON(null, {
        style: buildStyle
    }).bindPopup(function (layer) {
        return buildPopup(layer.feature.properties);
    }).addTo(map);

    // layer control
    // layerControl = L.control.layers(null, {"Datos" : geojsonLayer}, {collapsed: false, hideSingleBase: true});
    // map.addControl(layerControl);

    // slider
    buildSliderControl(["2010","2015"]);

    // states catalog
    // addStatesCatalog();

    // choropleth
    buildChoropleth();

    // variableControl
    buildVariableControl();

    // opacityControl
    buildOpacityControl();

    // responsive
    $(window).resize(function() {
        map.invalidateSize();
    });
}


function stateChanged(e){
    stateSelected = $(this).val();

    if(data[stateSelected]){
        showSelectedState();
    }else{
        window.getFeatureData(stateSelected, function(feature){
            data[stateSelected] = feature;
            showSelectedState();
        });
    }
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
