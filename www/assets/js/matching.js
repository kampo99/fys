window.onload = function(){
    //Array waar ik alle checkbox inputs inzet
    var antwoorden = new Array();
    //Array waar ik de vraagid's van de voorgaande ingevulde vragen in opsla
    var voorgaandeAntwoorden = new Array();
    //De session die ik heb meegekregen (ik gebruik hiervan de gebruikersid en bestemming)
    var session = FYSCloud.Session.get();
    //Hier zet ik de titel van de vragenlijst
    document.getElementById('VragenlijstTitel').innerText = "Vragenlijst voor " + session.bestemming;
    FYSCloud.API.queryDatabase(
        "SELECT * FROM vraag WHERE Bestemming_plaats = ?",
        [session.bestemming]
    ).done(function(data) {
        //Ik maar een vragen variabele aan zodat ik de data mee kan nemen naar de volgende query
        var vragen = data;
        //Ik zet de antwoorden array op dezelfde grote als de vragen array
        antwoorden.length = vragen.length;
        FYSCloud.API.queryDatabase(
            "SELECT * FROM antwoord WHERE gebruikersid = ? and bestemming = ?",
            [session.gebruikersId,session.bestemming]
        ).done(function(data) {
            //ik zet de voorgaandeAntwoorden array gelijk met de data uit de antwoord tabel.
            voorgaandeAntwoorden = data;
            //Ik maak een template aan, die ik uit matching.html haal
            var template = $("#vragenLijstVraagTemplate").html();
            //Ik loop door alle vragen heen, om vervolgens per vraag een template van een checkbox en label aan te maken
            for(var i = 0; i < vragen.length; i++) {
                var vraagInputTemplate = $(template);
                //Ik maak een variabele aan voor deze specifieke vraag zodat ik er makkelijker naar kan refereren
                var vraagInfo = vragen[i];
                //Ik loop door de children van de template heen zodat ik ze apart kan aanspreken.
                for(var j = 0; j < vraagInputTemplate.children().length; j++){
                    //Als de child een id gelijk is aan vraagTekst. zet ik de tekst attributen naar de gewenste data
                    if (vraagInputTemplate.children().get(j).id == "vraagTekst"){
                        vraagInputTemplate.children().get(j).id = "vraag"+vraagInfo.vraagid;
                        vraagInputTemplate.children().get(j).innerText = vraagInfo.tekst;
                        vraagInputTemplate.children().get(j).htmlFor = "checkbox"+vraagInfo.vraagid;
                    }else if(vraagInputTemplate.children().get(j).id == "vraagCheckbox"){   //Met deze else statement kijk ik of het een checkbox is of niet
                        vraagInputTemplate.children().get(j).id = "checkbox"+vraagInfo.vraagid;
                        //Ik gebruik het name attribuut om de vraagid aan de checkbox te linken
                        vraagInputTemplate.children().get(j).name = vraagInfo.vraagid;
                        //Ik voeg deze checkbox toe aan de antwoorden tabel op index [i]. Dit is mogelijk omdat de antwoorden array dezelfde grote heeft als de vragen array
                        antwoorden[i] = vraagInputTemplate.children().get(j);
                        //Ik loop door de voorgaande antwoorden heen, die ik hierboven al eerder had opgehaald uit de database
                        for(var x = 0; x < voorgaandeAntwoorden.length; x++){
                            //Ik kijk of de huidige vraag gelijk is aan een voorgaande ingevulde vraag.
                            if(voorgaandeAntwoorden[x].vraagid == vraagInfo.vraagid){
                                //Ik zet de checkbox op true zodat hij aangevinkt is, en het dus lijkt alsof jouw vraag onthouden was.
                                vraagInputTemplate.children().get(j).checked = true;
                            }
                        }
                    }
                }
                //Ik voeg de uiteindelijk gecreeerde vraagtemplate met checkbox en teskt toe aan de vragenLijstBox in html
                $(".vragenlijstBox").append(vraagInputTemplate);
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }).fail(function(reason) {
        console.log(reason);
    });

    //De onclick functie van de home knop
    document.getElementById("HomeButton").onclick = function(){
        FYSCloud.URL.redirect("reiskeuze.html");
    }

    //De onclick functie van de perfecteMatch knop
    document.getElementById("perfecteMatch").onclick = function(){
        //De array die later de ingevuldeantwoorden opslaat
        var ingevuldeAntwoorden = new Array();
        //Ik loop door alle antwoorden checkbox heen
        for(var i = 0; i < antwoorden.length; i++){
            //Als een checkbox aan staat voeg ik hem toe aan de ingevuldeAntwoorden array
            if(antwoorden[i].checked){
                ingevuldeAntwoorden.push(antwoorden[i]);
            }
        }
        if(ingevuldeAntwoorden.length > 0){
            UpdateAntwoorden(ingevuldeAntwoorden);
            ZoekPerfecteMatch(ingevuldeAntwoorden);
        }else{
            document.getElementById('VragenLijstDebug').innerText = "Vul minimaal 1 vraag in!";
        }
    }


    //De onclick functie van de meerdereMatches knop
    document.getElementById("meerdereMatches").onclick = function(){
        //De array die later de ingevuldeantwoorden opslaat
        var ingevuldeAntwoorden = new Array();
        //Ik loop door alle antwoorden checkbox heen
        for(var i = 0; i < antwoorden.length; i++){
            //Als een checkbox aan staat voeg ik hem toe aan de ingevuldeAntwoorden array
            if(antwoorden[i].checked){
                ingevuldeAntwoorden.push(antwoorden[i]);
            }
        }
        if(ingevuldeAntwoorden.length > 0){
            UpdateAntwoorden(ingevuldeAntwoorden);
            VindMeerdereMatches(ingevuldeAntwoorden);
        }else{
            document.getElementById('VragenLijstDebug').innerText = "Vul minimaal 1 vraag in!"
        }
    }

    //Functie om de antwoorden up te daten (in de database)
    function UpdateAntwoorden(ingevuldeAntwoorden){
        //Ik loop door de voorgaande antwoorden heen, om te kijken welke er waren ingevuld
        for(var i = 0; i < voorgaandeAntwoorden.length; i++){
            //Ik maak een boolean aan om te kijken of ik een vraag ga verwijderen (normaal verwijder ik de vraag altijd)
            var verwijderVraag = true;
            //Ik loop door de ingevuldeAntwoorden heen
            for(var j = 0; j < ingevuldeAntwoorden.length; j++){
                //Als 1 van de ingevulde antwoorden overeenkomt met een oude ingevulde vraag. hoef ik hem niet te verwijderen
                if(ingevuldeAntwoorden[j].name == voorgaandeAntwoorden[i].vraagid){
                    //Ik zorg ervoor dat de vraag niet verwijderd word
                    verwijderVraag = false;
                }
            }
            //Zo nodig verwijder ik de vraag met de zelfgescreven functie, die een query doet
            if(verwijderVraag){
                //Zelfgeschreven functie om een query te doen,
                //omdat ik geen idee had hoe ik met de FYS.api meerdere queries in 1x deed, met een niet van te voren bedachte hoeveeleid iteraties
                VerwijderAntwoord(voorgaandeAntwoorden[i].vraagid);
            }
        }
        //Ik loop door de ingevuldeAntwoorden heen
        for(var i = 0; i < ingevuldeAntwoorden.length; i++){
            //Ik kijk of er hiervoor antwoorden waren ingevuld, of dat het een gloednieuwe reis is
            if (voorgaandeAntwoorden.length > 1){
                //Ik maak een variabele aan om te kijken of ik de vraag ga invoeren (default doe ik dit altijd)
                var insertVraag = true;
                //Ik loop door de voorgaande vragen heen.
                for(var j = 0; j < voorgaandeAntwoorden.length; j++){
                    //Als een voorgaande vraag overeenkomt met het zojuist ingevulde antwoord is het niet nodig om hem te inserten, dus zet ik inservraag op false
                    if(voorgaandeAntwoorden[j].vraagid == ingevuldeAntwoorden[i].name){
                        //Insertvraag gaat dus op false om te voorkomen dat de vraag gedupliceerd geinsert word
                        insertVraag = false;
                    }
                }
                //Als de ingevulde vraag geen al ingevulde oude vraag is, insert ik hem
                if(insertVraag){
                    //Zelfgeschreven functie om een query te doen,
                    //omdat ik geen idee had hoe ik met de FYS.api meerdere queries in 1x deed, met een niet van te voren bedachte hoeveeleid iteraties
                    InsertAntwoord(ingevuldeAntwoorden[i].name);
                }
            }
            //Als het een gloednieuwe reis is vul ik alle antwoorden in
            else{
                InsertAntwoord(ingevuldeAntwoorden[i].name);
            }
        }
    }

    //Functie om de perfectematch te vinden
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
                    if(data[i].vraagid == matchAntwoorden[j].name){
                        overeenkomendeAntwoordenGebruikers.push(data[i].gebruikersid);
                    }
                }
            }
            if(overeenkomendeAntwoordenGebruikers.length < 1){
                document.getElementById('VragenLijstDebug').innerText = "Vink meer vragen aan om matches te ontvangen!";
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
                    if(data[i].vraagid == matchAntwoorden[j].name){
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
                document.getElementById('VragenLijstDebug').innerText = "Vink meer vragen aan om een perfecte match te ontvangen!";
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
    //functie om een query te doen,
    //omdat ik geen idee had hoe ik met de FYS.api meerdere queries in 1x deed, met een niet van te voren bedachte hoeveeleid iteraties
    function VerwijderAntwoord(id) {
        FYSCloud.API.queryDatabase(
            "DELETE FROM antwoord WHERE gebruikersid = ? and vraagid = ?",
            [session.gebruikersId,id]
        ).done(function(data) {
            console.log(data);
        }).fail(function(reason) {
            console.log(reason);
        });
    }
    //functie om een query te doen,
    //omdat ik geen idee had hoe ik met de FYS.api meerdere queries in 1x deed, met een niet van te voren bedachte hoeveeleid iteraties
    function InsertAntwoord(id) {
        FYSCloud.API.queryDatabase(
            "INSERT INTO antwoord (gebruikersid, vraagid,bestemming) VALUES (?,?,?)",
            [session.gebruikersId,id,session.bestemming]
        ).done(function(data) {
            console.log(data);
        }).fail(function(reason) {
            console.log(reason);
        });
    }

};