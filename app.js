//dependencies
var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var io = require("socket.io")(http);
var fs = require("fs");

var shapefile = require("shapefile");
var parse = require("csv-parse");


//setup
app.set("port", process.env.PORT || 22322);
app.use(express.static(path.join(__dirname, "client")));

var data = {}
var statesCatalog = {};
var dataBoundingbox;


//sockets
io.on("connection", function(socket){

    socket.emit("statesCatalog", statesCatalog);
    socket.emit("dataBoundingbox", dataBoundingbox);

    socket.on("getStateData", function(key, callback){
        callback(data[key]);
    });

});

var dataFile = "data/CensoEiter.csv";
var parser = parse({delimiter: ','}, function(err, csvData){
    if(err) {
        console.log("Error al leer el archivo " + dataFile);
        process.exit();
    }

    // parsing data
    var headers = csvData[0];
    var censoDbf = {};

    var idIndex = headers.indexOf("CVEGEO");
    var yearSuffixLength = 5;
    for(var i = 1; i < csvData.length; i++){

        censoDbf[csvData[i][idIndex]] = {
            data: { "2010": {}, "2015" : {} }
        };

        for(var j = 0; j < headers.length; j++){
            if(headers[j].endsWith(" 2010")){
                censoDbf[csvData[i][idIndex]].data["2010"][headers[j].substring(0, headers[j].length - yearSuffixLength)] = csvData[i][j];
            }else if(headers[j].endsWith(" 2015")){
                censoDbf[csvData[i][idIndex]].data["2015"][headers[j].substring(0, headers[j].length - yearSuffixLength)] = csvData[i][j];
            }else{
                censoDbf[csvData[i][idIndex]][headers[j]] = csvData[i][j];
            }
        }
    }

    // shapefile
    var feature, censoFeature, properties, dataID, stateID;
    shapefile.read("data/Municipios_2010_5A_4326.shp").then(function(dataShapefile){
        dataBoundingbox = dataShapefile.bbox;

        for(var i = 0; i < dataShapefile.features.length; i++){
            feature = dataShapefile.features[i];
            stateID = feature.properties.CVE_ENT;
            dataID = feature.properties.CVE_ENT + feature.properties.CVE_MUN;

            feature.properties = censoDbf[dataID];

            if(!statesCatalog[stateID]){
                statesCatalog[stateID] = feature.properties.NOM_ENT;
            }

            if(!data[stateID]){
                data[stateID] = {};
            }

            data[stateID][dataID] = feature;
        }

        //TODO order catalogs
        
        console.log("data parsed correctly, ready to listen.");
        startServer();
    }).catch(function(err){
        console.log("Ocurrio un error procesando data/Municipios_2010_5A.shp: " + err);
    });
});


//start
function startServer(){
    http.listen(app.get('port'), function(){
        console.log('server on port ' + app.get('port'));
    });
}

fs.createReadStream(dataFile).pipe(parser);
