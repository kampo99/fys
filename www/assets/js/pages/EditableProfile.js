window.onload = function(){
    var session = FYSCloud.Session.get();       //De session voor gebruikersid om vervolgens de naam en andere info op te halen
    FYSCloud.API.queryDatabase(
        "SELECT DISTINCT * FROM profiel INNER JOIN `match` ON profiel.gebruikersid = match.sender_Profiel_gebruikersid OR profiel.gebruikersid = match.reciever_id WHERE profiel.gebruikersid = ?;",
        [session.gebruikersId]
    ).done(function(data) {
        console.log(data);
        var gebruikersInfo = data[0];

        //Verander de naam, naar de juiste gebruikersnaam
        document.getElementById('NaamText').innerText = gebruikersInfo.voornaam + " " + gebruikersInfo.achternaam;

        //vul de bio textarea in met de al ingevulde bio
        document.getElementById('BioInput').value = gebruikersInfo.bio;

        //Savebioknop onclick
        document.getElementById("SaveBio").onclick = function(){
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
        data.forEach((matchData) =>{
            VoegMatchToe(matchData);
        });
    }).fail(function(reason) {
        console.log(reason);
    });
    //De functie om een match toe tevoegen aan activiteiten of matches
    function VoegMatchToe(matchdata) {
        var matchPersonData;
        if(matchdata.reciever_id != session.gebruikersId){
            matchid = matchdata.reciever_id;
        }else{
            matchid = matchdata.sender_Profiel_gebruikersid;
        }
        FYSCloud.API.queryDatabase(
            "SELECT * FROM profiel WHERE gebruikersid = ?",
            [matchid]
        ).done(function(data) {
            appendMatchTemplate(matchdata,data[0]);
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    function appendMatchTemplate(matchdata,matchPersonData){
        var template = $("#MatchTabbladTemplate").html();
        var matchTemplate = $(template);

        matchTemplate.find("#matchProfielNaamText").text(matchPersonData.voornaam + " " + matchPersonData.achternaam);
        matchTemplate.find("#matchStatus").text(matchdata.status);
        matchTemplate.find(".MatchProfielKnop");

        matchTemplate.find(".MatchProfielKnop").on("click", function(){
            var reisBestemming = matchdata.sender_Bestemming_plaats;
            FYSCloud.Session.set("bestemming", reisBestemming);
            FYSCloud.URL.redirect("profiel.html", {
                id: matchPersonData.gebruikersid
            });
        });

        //Creeer de template in de HTML
        if (matchdata.status == "geaccepteerd"){
            matchTemplate.find("#matchStatus").text(matchPersonData.email);
            $("#matchesBox").append(matchTemplate);
        }else{
            $("#activiteitenBox").append(matchTemplate);
        }
    }
}