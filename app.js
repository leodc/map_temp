//dependencies
var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var io = require("socket.io")(http);
var fs = require("fs");


//setup
app.set("port", process.env.PORT || 8888);
app.use(express.static(path.join(__dirname, "client")));


var mapOptions = {
  statesCatalog: {},
  sliderYears: ["2010","2015"],
  variableCatalog: {},
  institutionsCatalog: {"ganador": "Partido ganador"},
  mapboxKey: "pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg"
};


//sockets
io.on("connection", function(socket){
  socket.emit("buildDashboard", mapOptions);
});


// dictionary
var dictionaryFile = "data/dict.json";
for(var pair of JSON.parse(fs.readFileSync(dictionaryFile, 'utf8'))){
  mapOptions.variableCatalog[pair.clave] = pair.nombre;
}

//start
http.listen(app.get('port'), function(){
  console.log("map on port " + app.get('port'));
});
