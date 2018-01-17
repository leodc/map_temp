var partidosChoropleth = {
    "0" : "#FFFFFF",
    "pri" : "#EE0000",
    "prd" : "#FFD700",
    "mc" : "#EE9A00",
    "pt" : "#CDCD00",
    "pvem" : "#458B00",
    "pna" : "#00C5CD",
    "pan" : "#27408B",
    "apm" : "#EE5C42",
    "pan,prd,na,pebc" : " #BCD2EE",
    "pri,pt,pvem,pes" : "#EE5C42",
    "pri.pt.pvem.pna": "#EE5C42",
    "na" : "#FFFFFF",
    "nnu" : "#EE5C42",
    "pri,pvem" : "#EE5C42",
    "prd,pt,pna" : "#F0E68C",
    "morena" : "#8B5742",
    "verde" : "#458B00",
    "pes" : "#FFBBFF",
    "prd,pt,mc" : "#F0E68C",
    "independiente" : "#C71585",
    "pan,udc" : "#BCD2EE",
    "pbt": "#F0E68C"
}


function getPartidoColor(partido){
  var defaultColor = "#eee";

  if(!partido){
    console.log("Error getting color: key is empty");
    return defaultColor;
  }

  partido = String(partido).toLowerCase();
  return partidosChoropleth[partido] ? partidosChoropleth[partido]:defaultColor;
}
