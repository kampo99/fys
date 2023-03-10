window.onload = function(){
    var antwoorden = new Array();               //Array van checkbox input
    var voorgaandeAntwoorden = new Array();     //Array van voorgaadne vraagid's
    var session = FYSCloud.Session.get();       //De session voor gebruikersid en bestemming
    document.getElementById('VragenlijstTitel').innerText = "Vragenlijst voor " + session.bestemming; //Vragenlijst titel
    FYSCloud.API.queryDatabase(
        "SELECT * FROM vraag WHERE Bestemming_plaats = ?",
        [session.bestemming]
    ).done(function(data) {
        var vragen = data;      //Opgeslagen data, om mee te nemen
        antwoorden.length = vragen.length;
        FYSCloud.API.queryDatabase(
            "SELECT * FROM antwoord WHERE gebruikersid = ? and bestemming = ?",
            [session.gebruikersId,session.bestemming]
        ).done(function(data) {
            voorgaandeAntwoorden = data;        //Voorgaande antwoorden arrray word data
            var template = $("#vragenLijstVraagTemplate").html();   //Html template uit het html document

            //Ik loop door alle vragen heen, om vervolgens per vraag een template van een checkbox en label aan te maken
            for(var i = 0; i < vragen.length; i++) {
                var vraagInputTemplate = $(template);   //Sla het template op als jquery object
                var vraagInfo = vragen[i];     //variabele voor simpelere referentie

                //Vraag tekst gerelateerd
                var vraagTekst = vraagInputTemplate.find(".label"); //vind de label van de checkbox en sla hem op als jquery object
                vraagTekst.text(vraagInfo.tekst);    //zet de tekst van de vraag
                vraagTekst.attr(`for`,vraagInfo.vraagid);    //zet de htmlfor van de vraag op de checkbox zodat hij clickable is

                //Checkbox gerelateerd
                var checkbox = vraagInputTemplate.find("#checkbox")     //vind en maak een jquery object van de checkbox
                checkbox.attr(`id`,vraagInfo.vraagid);    //Checkbox zijn id word gezet
                antwoorden[i] = checkbox[0];              //Voeg de checkbox aan de antwoorden array toe, de [0] is zodat ik het DOM element heb
                //Zet de checkbox aan of uit
                for(var j = 0; j < voorgaandeAntwoorden.length; j++){
                    if(voorgaandeAntwoorden[j].vraagid == vraagInfo.vraagid){
                        checkbox.attr(`checked`,true);    //Checkbox word aangevinkt
                    }
                }
                $(".vragenlijstBox").append(vraagInputTemplate);    //Template word toegevoegd aan html
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }).fail(function(reason) {
        console.log(reason);
    });

    //Matchknop onclick
    document.getElementById("perfecteMatch").onclick = function(){
        matchGebruiker("perfecte");
    }
    //Meerderematches Onclick
    document.getElementById("meerdereMatches").onclick = function(){
        matchGebruiker("meerdere");
    }
    //De algemene match functie
    function matchGebruiker(typeMatch){
        var ingevuldeAntwoorden = new Array();      //Alle ingevuldeantwoorden
        for(var i = 0; i < antwoorden.length; i++){
            if(antwoorden[i].checked){  //Check of checkbox aan staat
                ingevuldeAntwoorden.push(antwoorden[i]);    //checkbox id word toegevoegd aan ingevuldeantwoorden
            }
        }
        if(ingevuldeAntwoorden.length > 0){     //Zijn er 1 of meer antwoorden
            //If statement om de match manier toe te passen
            if(typeMatch == "meerdere"){
                UpdateAntwoorden(ingevuldeAntwoorden,VindMeerdereMatches);      //Antwoorden updaten en matchfunctie meegeven
            }else if(typeMatch == "perfecte"){
                UpdateAntwoorden(ingevuldeAntwoorden,ZoekPerfecteMatch);      //Antwoorden updaten en matchfunctie meegeven
            }
        }else{
            //Geef de gebruiker feedback
            feedbackObject = document.getElementById('VragenLijstDebug');
            geefFeedback(feedbackObject,"Vul minimaal 1 vraag in!",3000);
        }
    }

    //Functie om meerdere matches te vinden
    function VindMeerdereMatches(matchAntwoorden) {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM antwoord WHERE bestemming = ? and not gebruikersid = ?",
            [session.bestemming,session.gebruikersId]
        ).done(function(data) {
            var overeenkomendeAntwoordenGebruikers = new Array();
            //for loop door alle gebruikers, die vragen hebben ingevuld voor deze reis en die niet jij zelf zijn.
            for(var i = 0; i < data.length; i++){
                //For loop door de ingevulde antwoorden van de gebruiker, deze variabele is meegegeven als parameter
                for(var j = 0; j < matchAntwoorden.length; j++){
                    //Als de vraagid van de current iteratie overeenkomt met die van 1 van de ingevulde vragen van de gebruiker. sla ik hem op
                    if(data[i].vraagid == matchAntwoorden[j].id){
                        overeenkomendeAntwoordenGebruikers.push(data[i].gebruikersid);
                    }
                }
            }
            if(overeenkomendeAntwoordenGebruikers.length < 0){
                //Geef de gebruiker feedback
                feedbackObject = document.getElementById('VragenLijstDebug');
                geefFeedback(feedbackObject,"Vink meer vragen aan om matches te ontvangen!",3000);
                //Ik ververs de voorgaande antwoorden om dat de gebruiker op de pagina blijft. en zijn nieuwe antwoorden dus voorgaande antwoorden zijn geworden
                VerversVoorgaandeAntwoorden();
            }else{
                FYSCloud.Session.set("matchaccounts", overeenkomendeAntwoordenGebruikers);
                FYSCloud.URL.redirect("matchesresultaten.html");
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    //Functie om de perfectematch te vinden
    function ZoekPerfecteMatch(matchAntwoorden) {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM antwoord WHERE bestemming = ? and not gebruikersid = ?",
            [session.bestemming,session.gebruikersId]
        ).done(function(data) {
            var overeenkomendeAntwoordenGebruikers = new Array();
            //for loop door alle gebruikers, die vragen hebben ingevuld voor deze reis en die niet jij zelf zijn.
            for(var i = 0; i < data.length; i++){
                //For loop door de ingevulde antwoorden van de gebruiker, deze variabele is meegegeven als parameter
                for(var j = 0; j < matchAntwoorden.length; j++){
                    //Als de vraagid van de current iteratie overeenkomt met die van 1 van de ingevulde vragen van de gebruiker. sla ik hem op
                    if(data[i].vraagid == matchAntwoorden[j].id){
                        overeenkomendeAntwoordenGebruikers.push(data[i].gebruikersid);
                    }
                }
            }
            //Meerdere variabele aanmaken om te gebruiken bij de perfect match logica
            var huidigeGebruiker = "leeg";
            var meestVoorkomend = 0;
            var perfecteMatchId = 0;
            var aantalKeren = 0;
            //For loop door de overeenkomende antwoorden gebruikers, die ik net gevuld heb
            for(var i = 0; i < overeenkomendeAntwoordenGebruikers.length; i++){
                aantalKeren++;
                //Als de huidige gebruiker niet overeenkomt met de gebruiker van deze iteratie
                if(overeenkomendeAntwoordenGebruikers[i] != huidigeGebruiker){
                    //Vervang de huidigegebruiker
                    huidigeGebruiker = overeenkomendeAntwoordenGebruikers[i];
                    //Aantalkeren gaat op 0 omdat we opnieuw beginnen
                    aantalKeren = 0;
                }
                //Als aantalkeren bij deze iteratie meer is al die van de meestvoorkomende
                if(aantalKeren > meestVoorkomend){
                    meestVoorkomend = aantalKeren;
                    //Zet de perfecte match id op de gebruikersid van de huidige iteratie
                    perfecteMatchId = overeenkomendeAntwoordenGebruikers[i];
                }
            }
            if(perfecteMatchId == 0){
                //Geef de gebruiker feedback
                feedbackObject = document.getElementById('VragenLijstDebug');
                geefFeedback(feedbackObject,"Vink meer vragen aan om een perfecte match te ontvangen!",3000);
                //Ik ververs de voorgaande antwoorden om dat de gebruiker op de pagina blijft. en zijn nieuwe antwoorden dus voorgaande antwoorden zijn geworden
                VerversVoorgaandeAntwoorden();
            }else{
                FYSCloud.URL.redirect("profiel.html", {
                    id: perfecteMatchId
                });
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    //Functie om de voorgaande vragen array te verversen met net ingevulde vragen, voor als de gebruiker op de pagina is gebleven
    function VerversVoorgaandeAntwoorden(){
        FYSCloud.API.queryDatabase(
            "SELECT * FROM antwoord WHERE gebruikersid = ? and bestemming = ?",
            [session.gebruikersId,session.bestemming]
        ).done(function(data) {
            voorgaandeAntwoorden = data;
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    //Query functie om alle voorgaande antwoorden te verwijderen van deze reis
    function UpdateAntwoorden(ids,callback) {
        FYSCloud.API.queryDatabase(
            "DELETE FROM antwoord WHERE gebruikersid = ? and bestemming = ?",
            [session.gebruikersId,session.bestemming]
        ).done(function(data) {
            //Opzet van de insert query
            var queryTemplate = "INSERT INTO antwoord (gebruikersid, vraagid,bestemming) VALUES ";
            //String template, van de variabelen
            var queryVariabelenTemplate = "(?,?,?),"
            //De query variabelen, deze word gevuld wanneer de query gemaakt word
            var queryVariabelen = [];

            //Foreach van de ids array, zodat voor elk ID een toevoeging aan de query komt
            ids.forEach(id =>{
                //Voeg een reeks aan vraagtekens toe aan de query, zodat er variabelen inkunnen
                queryTemplate += queryVariabelenTemplate;

                //Voeg een reeks aan variabelen toe aan de queryVariabelen array
                queryVariabelen.push(session.gebruikersId);
                queryVariabelen.push(id.id);
                queryVariabelen.push(session.bestemming);
            });

            //Verander de , (laatste leesteken in de query string) in een ; zodat de query klopt
            queryTemplate = queryTemplate.slice(0, -1);
            queryTemplate += ";";

            FYSCloud.API.queryDatabase(
                queryTemplate,queryVariabelen
            ).done(function(data) {
                //De matchfunctie die meegegeven is als parameter callback functie
                callback(ids);
            }).fail(function(reason) {
                console.log(reason);
            });
        }).fail(function(reason) {
            console.log(reason);
        });
    }
};