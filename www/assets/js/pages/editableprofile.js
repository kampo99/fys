window.onload = function(){
    var session = FYSCloud.Session.get();       //De session voor gebruikersid om vervolgens de naam en andere info op te halen
    //Query om de gebruiker zijn info op te halen
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE gebruikersid = ?",
        [session.gebruikersId]
    ).done(function(data) {
        //Handige variabele zodat je hierna kan refereren ipv data[0]
        var gebruikersInfo = data[0];
        //Verander de naam, naar de juiste gebruikersnaam
        document.getElementById('NaamText').innerText = gebruikersInfo.voornaam + " " + gebruikersInfo.achternaam;

        //vul de bio textarea in met de al ingevulde bio
        document.getElementById('BioInput').value = gebruikersInfo.bio;

        //als er een profielfoto gevonden is word deze ingeladen
        if(gebruikersInfo.foto != null){
            document.getElementById(`ProfielFoto`).setAttribute(`src`, gebruikersInfo.foto);
        }

        //Savebioknop onclick
        document.getElementById("SaveBio").onclick = function(){
            //Haal de inhoud van het bioblok op
            var bioInput = document.getElementById('BioInput').value;
            if(bioInput.length > 0){
                FYSCloud.API.queryDatabase(
                    "UPDATE profiel SET bio = ? WHERE gebruikersid = ?",
                    [bioInput,session.gebruikersId]
                ).done(function(data) {
                    //Geef de gebruiker feedback
                    feedbackObject = document.getElementById('feedback');
                    geefFeedback(feedbackObject,"Bio opgeslagen!",3000);
                }).fail(function(reason) {
                    console.log(reason);
                });
            }else{
                //Geef de gebruiker feedback
                feedbackObject = document.getElementById('feedback');
                geefFeedback(feedbackObject,"U kunt geen lege bio opslaan!",3000);
            }
        }
        //Clearbioknop Onclick
        document.getElementById("ClearBio").onclick = function(){
            document.getElementById('BioInput').value = "";
            //Geef de gebruiker feedback
            feedbackObject = document.getElementById('feedback');
            geefFeedback(feedbackObject,"Tekstvak geleegd!",3000);
        }
    }).fail(function(reason) {
        console.log(reason);
    });

    //Query om alle matches te vinden
    FYSCloud.API.queryDatabase(
        "SELECT DISTINCT * FROM profiel INNER JOIN `match` ON profiel.gebruikersid = match.sender_Profiel_gebruikersid OR profiel.gebruikersid = match.reciever_id WHERE profiel.gebruikersid = ?;",
        [session.gebruikersId]
    ).done(function(data) {
        //Voeg een match toe voor elke match die gevonden is
        data.forEach((matchData) =>{
            VoegMatchToe(matchData);
        });
    }).fail(function(reason) {
        console.log(reason);
    });

    //De functie om een match toe tevoegen aan activiteiten of matches
    function VoegMatchToe(matchdata) {
        //Bepaal of de match ontvangen of verzonden is, en zet daarna de matchid met de juiste input
        if(matchdata.reciever_id != session.gebruikersId){
            matchid = matchdata.reciever_id;
        }else{
            matchid = matchdata.sender_Profiel_gebruikersid;
        }
        //Query om de info van de matchgebruiker op te halen. aangezien we zijn/haar email en naam nodig hebben
        FYSCloud.API.queryDatabase(
            "SELECT * FROM profiel WHERE gebruikersid = ?",
            [matchid]
        ).done(function(data) {
            //Voeg de match toe aan de website dmv deze functie
            appendMatchTemplate(matchdata,data[0]);
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    //De functie om een matchtemplate in te vullen en toe te voegen aan de site
    function appendMatchTemplate(matchdata,matchPersonData){
        //Het ophalen van de HTML template van een match
        var template = $("#MatchTabbladTemplate").html();
        //Maak een nieuw jquery object van het template
        var matchTemplate = $(template);

        //vind en zet de naam van de match gebruiker
        matchTemplate.find("#matchProfielNaamText").text(matchPersonData.voornaam + " " + matchPersonData.achternaam);
        //Vind en zet de status van de match
        matchTemplate.find("#matchStatus").text(matchdata.status);
        //Vind de profielknop en zet de onclick functie ervan
        matchTemplate.find(".MatchProfielKnop").on("click", function(){
            //Zet de bestemming omdat we nu rechtstreeks naar een profiel toe gaan, en wij anders niet weten bij welke bestemming die hoort
            FYSCloud.Session.set("bestemming", matchdata.sender_Bestemming_plaats);
            //Ga naar de profielpagina van de juiste gebruiker
            FYSCloud.URL.redirect("profiel.html", {
                id: matchPersonData.gebruikersid
            });
        });

        //Voeg het template toe aan de HTML
        if (matchdata.status == "geaccepteerd"){
            //Zet de statustext naar de email van de gebruiker.
            matchTemplate.find("#matchStatus").text(matchPersonData.email);
            $("#matchesBox").append(matchTemplate);
        }else{
            $("#activiteitenBox").append(matchTemplate);
        }
    }
}