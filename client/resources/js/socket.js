var socket = io();

socket.on("buildDashboard", function(options){
  initDashboard(options);
})

function getFeatureData(key, callback){
  socket.emit("getStateData", key, callback);
}
