window.onload = function () {
    var session = FYSCloud.Session.get();
    var gebruikersid_ander = FYSCloud.URL.queryString("id");
    var gebruikersid_zelf = session.gebruikersId;
    var gebruikersinfo;
// kijkt als er al een match is
    FYSCloud.API.queryDatabase(
        "SELECT * FROM `match` WHERE `sender_Profiel_gebruikersid`= ? or `reciever_id` = ? and `sender_Bestemming_plaats` = ?",
        [gebruikersid_zelf, gebruikersid_zelf, session.bestemming]
    ).done(function (data) {
        console.log(data)
        data.forEach(match => {
            if (gebruikersid_ander == match.reciever_id && gebruikersid_zelf == match.sender_Profiel_gebruikersid) {
                console.log("match was verstuurd")
                BerekenStatusInformatie(match, "verstuurd");

            } else if (gebruikersid_zelf == match.reciever_id && gebruikersid_ander == match.sender_Profiel_gebruikersid) {
                console.log("Ontvangen");
                BerekenStatusInformatie(match, "ontvangen");
            } else {
                console.log("Geen match");
            }
        })

    }).fail(function (reason) {
        console.log(reason)

    })


// vraagt de data aan van de profiel die je bezoekt
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE gebruikersid = ?",
        [gebruikersid_ander]
    ).done(function (data) {
        console.log(data);
        gebruikersinfo = data[0]
        var helenaam = data[0].voornaam + " " + data[0].achternaam;
        document.getElementById('naam').textContent = helenaam;


        if (data[0].foto != null) {
            var foto = data[0].foto;

            $("#profielfoto").attr("src", foto);
        }

        document.getElementById('biosub').textContent = data[0].bio;


        document.getElementById('aanvraagbutton').onclick = function () {
            document.getElementById("boxtext").style.visibility = "visible";
            this.style.visibility = "hidden";

            aanvraag();
            email(data[0].voornaam, data[0].email);
        }


        FYSCloud.API.queryDatabase(
            "SELECT antwoord.gebruikersid, vraag.tekst FROM antwoord INNER JOIN vraag ON vraag.vraagid = antwoord.vraagid WHERE bestemming = ? AND gebruikersid = ?",
            [session.bestemming, gebruikersid_ander]
        ).done(function (data) {
            console.log(data);
            var template = $("#templatevraag").html();
            for (var i = 0; i < data.length; i++) {
                var vraagtemplate = $(template);
                var tekst = data[i].tekst;
                vraagtemplate[0].innerHTML = tekst;
                console.log(vraagtemplate[0])
                $(".containerVragen").append(vraagtemplate);
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
            "SELECT * FROM reis WHERE Profiel_gebruikersid = ? or Profiel_gebruikersid = ?",
            [gebruikersid_zelf, gebruikersid_ander]
        ).done(function (data) {
            console.log(data)
            let datumreciever = data[1].vervaldatum;


            //aanvraag doen
            FYSCloud.API.queryDatabase(
                "INSERT INTO `match` (sender_Profiel_gebruikersid, reciever_id, sender_vervaldatum, sender_Bestemming_plaats, reciever_vervaldatum, status) SELECT Profiel_gebruikersid, Profiel_gebruikersid, vervaldatum, Bestemming_plaats, vervaldatum, standaardstatus FROM `reis` WHERE Profiel_gebruikersid = ? and Bestemming_plaats = ?",
                [gebruikersid_zelf, session.bestemming]
            ).done(function (data) {
                console.log(data)

                //aanvraag updaten
                FYSCloud.API.queryDatabase(
                    "UPDATE `match` SET `reciever_id`= ?, `reciever_vervaldatum` = ? WHERE reciever_id=?",
                    [gebruikersid_ander, toSqlDatetime(datumreciever), gebruikersid_zelf]
                ).done(function (data) {
                    console.log(data)

                    //delete dubble match
                    FYSCloud.API.queryDatabase(
                        "DELETE FROM `match` WHERE sender_Profiel_gebruikersid = reciever_id"
                    ).done(function (data) {
                        console.log(data)

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

    function toSqlDatetime(inputDate) {
        const date = new Date(inputDate);
        const dateWithOffset = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return dateWithOffset
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
    }

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
            console.log(data);
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    function BerekenStatusInformatie(match, type) {
        switch (match.status) {
            case match.status = "in afwachting":
                if (type == "verstuurd") {
                    document.getElementById("boxtext").style.visibility = "visible";
                    document.getElementById("aanvraagbutton").style.visibility = "hidden";
                    document.getElementById("boxtext").style.fontSize = "25px"
                    document.getElementById("boxtext").innerText = match.status;
                    break;
                } else if ("ontvangen") {
                    document.getElementById("accepteer").style.visibility = "visible";
                    document.getElementById("accepteer").onclick = function () {
                        AccepteerMatch(match.reciever_id, match.sender_Profiel_gebruikersid);
                    };
                    document.getElementById("wijsaf").style.visibility = "visible";
                    document.getElementById("wijsaf").onclick = function () {
                        WeigerMatch(match.reciever_id, match.sender_Profiel_gebruikersid);
                    };
                    document.getElementById("aanvraagbutton").style.visibility = "hidden";
                    break;
                }
            case match.status = 'geaccepteerd':
                document.getElementById("email").style.visibility = "visible";
                document.getElementById("email").style.fontSize = "25px"
                document.getElementById("email").innerText = gebruikersinfo.email;
                document.getElementById("aanvraagbutton").style.visibility = "hidden";
                break;
            case match.status = 'geweigerd':
                FYSCloud.URL.redirect("matchesresultaten.html")
                break;
        }
    }

    function AccepteerMatch(gebruikersid_zelf, gebruikersid_ander) {
        FYSCloud.API.queryDatabase(
            "UPDATE `match` SET `status` = ? WHERE `sender_Profiel_gebruikersid` = ? AND reciever_id = ?",
            ["geaccepteerd", gebruikersid_ander, gebruikersid_zelf]
        ).done(function (data) {
            document.getElementById("email").style.visibility = "visible";
            console.log(email)
            document.getElementById("email").style.fontSize = "25px"
            document.getElementById("email").innerText = gebruikersinfo.email;

        }).fail(function (reason) {
            console.log(reason)
        })
    }

    function WeigerMatch(gebruikersid_zelf, gebruikersid_ander) {
        FYSCloud.API.queryDatabase(
            "UPDATE `match` SET `status` = ? WHERE `sender_Profiel_gebruikersid` = ? AND reciever_id = ?",
            ["geweigerd", gebruikersid_ander, gebruikersid_zelf]
        ).done(function (data) {
            FYSCloud.URL.redirect("matchesresultaten.html")

        }).fail(function (reason) {
            console.log(reason)
        })
    }


}