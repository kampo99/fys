window.onload = function () {
    var session = FYSCloud.Session.get();
    var gebruikersId_Ander = FYSCloud.URL.queryString("id");
    var gebruikersId_Zelf = session.gebruikersId;
    var gebruikersinfo;

// kijkt als er al een match is
    FYSCloud.API.queryDatabase(
        "SELECT * FROM `match` WHERE `sender_Profiel_gebruikersid`= ? or `reciever_id` = ? and `sender_Bestemming_plaats` = ?",
        [gebruikersId_Zelf, gebruikersId_Zelf, session.bestemming]
    ).done(function (data) {

        //hier wordt er gekeken als de match verstuurd is of ontvangen
        data.forEach(match => {
            if (gebruikersId_Ander == match.reciever_id && gebruikersId_Zelf == match.sender_Profiel_gebruikersid) {
                BerekenStatusInformatie(match, "verstuurd");

            } else if (gebruikersId_Zelf == match.reciever_id && gebruikersId_Ander == match.sender_Profiel_gebruikersid) {
                BerekenStatusInformatie(match, "ontvangen");
            }
        })
    }).fail(function (reason) {
        console.log(reason)
    })

// vraagt de data aan van de profiel die je bezoekt
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE gebruikersid = ?",
        [gebruikersId_Ander]
    ).done(function (data) {

        //dit is een variable om de data op te slaan
        gebruikersinfo = data[0]

        //hier wordt er gekeken wat de naam is en ook gelijk veranderd op de website
        var helenaam = data[0].voornaam + " " + data[0].achternaam;
        document.getElementById('naam').textContent = helenaam;

        //hier wordt er gekeken als er een profielfoto is in de database is zoja dan wordt die gebruikt
        if (data[0].foto != null) {
            var foto = data[0].foto;
            $("#profielFoto").attr("src", foto);
        }

        //hier wordt de bio van de persoon ingevuld
        document.getElementById('bioInhoud').textContent = data[0].bio;

        //hier word aan de aanvraagbutton een functie geven die een aanvraag doet, een email verstuurd
        //en de status laat zien van de match
        document.getElementById('aanvraagknop').onclick = function () {
            document.getElementById("statusTekst").style.visibility = "visible";
            this.style.visibility = "hidden";
            aanvraag();
            email(data[0].voornaam, data[0].email);
        }


        //hier wordt aan de databases gevraagd hoeveel intressen de persoon heeft aangevinkt
        //en welke dat zijn om te laten zien
        FYSCloud.API.queryDatabase(
            "SELECT antwoord.gebruikersid, vraag.tekst FROM antwoord INNER JOIN vraag ON vraag.vraagid = antwoord.vraagid WHERE bestemming = ? AND gebruikersid = ?",
            [session.bestemming, gebruikersId_Ander]
        ).done(function (data) {

            //hier wordt een copy gemaakt van de template
            var template = $("#templatevraag").html();

            //hier wordt voor elke vraag ene template aangemaakt en ingevuld
            for (var i = 0; i < data.length; i++) {
                var vraagtemplate = $(template);
                var tekst = data[i].tekst;
                vraagtemplate[0].innerHTML = tekst;
                $(".plekVragen").append(vraagtemplate);
            }
        }).fail(function (reason) {
            console.log(reason);
        })
    }).fail(function (reason) {
        console.log(reason);
    });

    function aanvraag() {

        //pakt datum van reciever
        FYSCloud.API.queryDatabase(
            "SELECT * FROM reis WHERE Profiel_gebruikersid = ?",
            [gebruikersId_Ander]
        ).done(function (data) {
            let datumreciever = data[0].vervaldatum;

            //aanvraag doen
            FYSCloud.API.queryDatabase(
                "INSERT INTO `match` (sender_Profiel_gebruikersid, reciever_id, sender_vervaldatum, sender_Bestemming_plaats, reciever_vervaldatum, status) SELECT Profiel_gebruikersid, Profiel_gebruikersid, vervaldatum, Bestemming_plaats, vervaldatum, standaardstatus FROM `reis` WHERE Profiel_gebruikersid = ? and Bestemming_plaats = ?",
                [gebruikersId_Zelf, session.bestemming]
            ).done(function (data) {

                //aanvraag updaten want de aanvraag kan niet in 1 keer
                FYSCloud.API.queryDatabase(
                    "UPDATE `match` SET `reciever_id`= ?, `reciever_vervaldatum` = ? WHERE reciever_id=?",
                    [gebruikersId_Ander, toSqlDatetime(datumreciever), gebruikersId_Zelf]
                ).done(function (data) {

                    //delete dubble match
                    FYSCloud.API.queryDatabase(
                        "DELETE FROM `match` WHERE sender_Profiel_gebruikersid = reciever_id"
                    ).done(function (data) {

                    }).fail(function (reason) {
                        console.log(reason)
                    })
                }).fail(function (reason) {
                    console.log(reason)
                })
            }).fail(function (reason) {
                console.log(reason)
            })
        }).fail(function (reason) {
            console.log(reason);
        })
    }

    //dit zorgt er voor dat je een datum in de juiste vorm terug krijgt om op te sturen naar de database
    function toSqlDatetime(inputDate) {
        const date = new Date(inputDate);
        const dateWithOffset = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return dateWithOffset
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
    }

    // deze functie stuurd een email naar de gene die de match heeft ontvangen
    function email(naam, email) {
        htmlTemplate = "<h1>Hallo " + naam + "</h1><p>er staat een verzoek voor je klaar bij berichten</p>";
        FYSCloud.API.sendEmail({
            from: {
                name: "Corri en Donnie",
                address: "group@fys.cloud"
            },
            to: [
                {
                    name: naam,
                    address: email
                }
            ],
            subject: "Match gevonden",
            html: htmlTemplate
        }).done(function (data) {
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    //deze functie berekent wat de status is van de match en wat er moet gebeuren bij elke status
    function BerekenStatusInformatie(match, type) {
        switch (match.status) {

            case match.status = "in afwachting":
                //als de match status in afwachting is wordt er gekeken als jij de verstuurder bent of de ontvanger

                if (type == "verstuurd") {
                    //als je zelf de match hebt verstuurd krijg je de match status te zien
                    document.getElementById("statusTekst").style.visibility = "visible";
                    document.getElementById("aanvraagknop").style.visibility = "hidden";
                    document.getElementById("statusTekst").style.fontSize = "25px"
                    document.getElementById("statusTekst").innerText = match.status;
                    break;
                } else if ("ontvangen") {
                    //als je de match hebt ontvangen komen er 2 knopen te voor schijn
                    //om de match te kunnen accepteren of afwijzen en dat wordt hier gemaakt
                    document.getElementById("accepteer").style.visibility = "visible";
                    document.getElementById("accepteer").onclick = function () {
                        AccepteerMatch(match.reciever_id, match.sender_Profiel_gebruikersid);
                    };
                    document.getElementById("wijsaf").style.visibility = "visible";
                    document.getElementById("wijsaf").onclick = function () {
                        WeigerMatch(match.reciever_id, match.sender_Profiel_gebruikersid);
                    };
                    document.getElementById("aanvraagknop").style.visibility = "hidden";
                    break;
                }
            case match.status = 'geaccepteerd':
                //als de status geaccepteerd is krijg je elkaars email te zien
                document.getElementById("email").style.visibility = "visible";
                document.getElementById("email").style.fontSize = "25px"
                document.getElementById("email").innerText = gebruikersinfo.email;
                document.getElementById("aanvraagknop").style.visibility = "hidden";
                break;
            case match.status = 'geweigerd':
                //als de status geweigerd is wordt je gelijk terug gestuurd naar de andere matches
                FYSCloud.URL.redirect("matchesresultaten.html", {
                    geweigerd: true
                });
                break;
        }
    }

    //dit is de functie van de accepteer knop als op deze knop wordt gedrukt wordt de match status geupdate
    //naar geaccepteerd
    function AccepteerMatch(gebruikersid_zelf, gebruikersid_ander) {
        FYSCloud.API.queryDatabase(
            "UPDATE `match` SET `status` = ? WHERE `sender_Profiel_gebruikersid` = ? AND reciever_id = ?",
            ["geaccepteerd", gebruikersid_ander, gebruikersid_zelf]
        ).done(function (data) {
            document.getElementById("email").style.visibility = "visible";
            document.getElementById("email").style.fontSize = "25px"
            document.getElementById("email").innerText = gebruikersinfo.email;
        }).fail(function (reason) {
            console.log(reason)
        })
    }

    //dit is de functie van de weiger knop las je op deze knop drukt wordt je gelijk terug gestuurd
    //en kan je die pagina ook niet meer bezoeken
    function WeigerMatch(gebruikersid_zelf, gebruikersid_ander) {
        FYSCloud.API.queryDatabase(
            "UPDATE `match` SET `status` = ? WHERE `sender_Profiel_gebruikersid` = ? AND reciever_id = ?",
            ["geweigerd", gebruikersid_ander, gebruikersid_zelf]
        ).done(function (data) {
            FYSCloud.URL.redirect("matchesresultaten.html", {
                geweigerd: true
            });



        }).fail(function (reason) {
            console.log(reason)
        })
    }


}