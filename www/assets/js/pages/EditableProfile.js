window.onload = function(){
    var session = FYSCloud.Session.get();       //De session voor gebruikersid om vervolgens de naam en andere info op te halen
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE gebruikersid = ?",
        [session.gebruikersId]
    ).done(function(data) {
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
    }).fail(function(reason) {
        console.log(reason);
    });
}