$(function(){
    // window.initMap("map");

    showLoadingModal();
});

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
