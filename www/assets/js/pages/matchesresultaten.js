window.onload = function(){
    var session = FYSCloud.Session.get();
    var accounts = session.matchaccounts;

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
                var helenaam = gebruiker.voornaam + " " + gebruiker.achternaam + " |";
                var profielTemplate = $(template);
                var profielTemplate = profielTemplate[0];
                var geboortedatum = new Date(gebruiker.geboortedatum);
                var geboortejaar = geboortedatum.getFullYear();
                var heden = new Date();
                var hedenjaar = heden.getFullYear();
                var leeftijd = hedenjaar - geboortejaar;

                if(heden.getMonth() < 0 || (heden.getMonth() === 0 && heden.getDate() < geboortedatum.getDate())){
                    leeftijd--;
                }

                //Pak de eerste de beste element met de classname profielnaam, vandaar de [0] ik wil alleen het eerste element
                var profielNaamElement = profielTemplate.getElementsByClassName("ProfielNaam")[0];
                //Pak de eerste de beste element met de classname profielleeftijd
                var profielLeeftijdElement = profielTemplate.getElementsByClassName("ProfielLeeftijd")[0];

                //Zet de innerhtml van de profielnaam gelijk aan de helenaam van de gebruiker
                profielNaamElement.innerHTML = helenaam;
                //Zet de innerhtml van de profielleeftijd gelijk aan de leeftijd van de gebruiker
                profielLeeftijdElement.innerHTML = leeftijd;

                console.log(profielTemplate);
                // elke onclick function wordt geredirect naar de aangewezen url pagina.
                profielTemplate.getElementsByClassName("BekijkProfiel")[0].onclick = function() {
                    FYSCloud.URL.redirect("Profiel.html", {
                        id: gebruiker.gebruikersid
                    });
                }
                //Creeer de template in de HTML
                $(".resultatenBox").append(profielTemplate);

                //Button verwijst naar de pagina vragenlijst
                $("#VragenlijstButton").click(function() {
                    FYSCloud.URL.redirect("matching.html");
                });
            })

        }).fail(function(reason) {
            console.log(reason);
        });

};