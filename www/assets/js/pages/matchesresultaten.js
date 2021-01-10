window.onload = function(){
    var session = FYSCloud.Session.get();
    var accounts = session.matchaccounts;

    document.getElementById("headerText").innerHTML += " " + session.bestemming;

    //Haal alle duplicate mensen uit de lijst
    $.unique(accounts);

    var queryTemplate = "SELECT * FROM profiel WHERE";
    accounts.forEach((id, i) =>{
        if(i === (accounts.length - 1)){
            //Voeg een reeks aan vraagtekens toe aan de query, zodat er variabelen inkunnen
            queryTemplate += (" gebruikersid = " + id);
        }else{
            //Voeg een reeks aan vraagtekens toe aan de query, zodat er variabelen inkunnen
            queryTemplate += (" gebruikersid = " + id + " OR");
        }
    });

    FYSCloud.API.queryDatabase(
            queryTemplate
        ).done(function(data) {
            var template = $("#profielMatchTemplate").html();
            data.forEach(gebruiker =>{
                var profielTemplate = $(template);
                var profielTemplate = profielTemplate[0];

                var leeftijd = leeftijdBerekenen(gebruiker.geboortedatum);
                var gebruikerInfo = gebruiker.voornaam + " " + gebruiker.achternaam + " | " + gebruiker.geslacht + " | " + leeftijd + " jaar ";

                //Pak de eerste de beste element met de classname profielnaam, vandaar de [0] ik wil alleen het eerste element
                var profielInfoElement = profielTemplate.getElementsByClassName("ProfielInfo")[0];

                //Zet de innerhtml van de profielnaam gelijk aan de helenaam van de gebruiker
                profielInfoElement.innerHTML = gebruikerInfo;

                // elke onclick function wordt geredirect naar de aangewezen url pagina.
                profielTemplate.getElementsByClassName("BekijkProfiel")[0].onclick = function() {
                    FYSCloud.URL.redirect("Profiel.html", {
                        id: gebruiker.gebruikersid
                    });
                }
                //Creeer de template in de HTML
                $(".resultatenBox").append(profielTemplate);

                //Button verwijst naar de pagina vragenlijst
                $("#VragenlijstKnop").click(function() {
                    FYSCloud.URL.redirect("matching.html");
                });
            })

        }).fail(function(reason) {
            console.log(reason);
        });

};