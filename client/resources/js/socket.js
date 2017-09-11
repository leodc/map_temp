/*global io*/
var socket = io();

socket.on("statesCatalog", function (statesCatalog) {
    window.updateStatesCatalogOptions(statesCatalog);
});

socket.on("dataBoundingbox", function(bb){
    window.setDataBoundingbox(bb);
});

function getFeatureData(key, callback){
    socket.emit("getStateData", key, callback);
}

socket.on("buildMap", function(options){
    window.buildMap("map",options);
});
