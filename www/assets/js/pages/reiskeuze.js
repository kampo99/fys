window.onload = function(){
    var gebruikersId = FYSCloud.Session.get().gebruikersId;     //Ophalen van het gebruikersid via de session
    //Query om de reis/reizen op te halen
    FYSCloud.API.queryDatabase(
        "SELECT * FROM reis WHERE Profiel_gebruikersId = ?",
        [gebruikersId]
    ).done(function(data) {
        //Wanneer er geen reizen zijn gevonden
        if(data.length == 0){
            //Verander de titel van de pagina
            document.getElementById("headerText").innerHTML = "Boek een reis";
            document.getElementsByClassName("CorendonLogo")[0].style.display = "block";     //Zet het logo aan
            document.getElementsByClassName("BoekNuImage")[0].style.display = "block";      //Zet de advertentie foto aan
        }
        //Haal het template van een reisbutton op
        var template = $("#reisButtonTemplate").html();
        //Loop door alle gevonden reizen heen
        data.forEach(reis =>{
            //Maak een nieuw jquery object van het template
            var reisButtonTemplate = $(template);
            //Zet en vind de text van de reisbutton
            reisButtonTemplate.find(".reisButton").text(reis.Bestemming_plaats);
            //Zet en vind de onclick functie van de reisbutton
            reisButtonTemplate.find(".reisButton").on("click", function(){
                FYSCloud.Session.set("bestemming", reis.Bestemming_plaats);
                FYSCloud.URL.redirect("matching.html");
            });
            //Voeg de reisbutton toe aan de reisbuttoncontainer
            $(".reisButtonContainer").append(reisButtonTemplate);

        });
    }).fail(function(reason) {
        console.log(reason);
    });
};