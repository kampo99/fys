window.onload = function () {
    var session = FYSCloud.Session.get();
    var gebruikersid_ander = FYSCloud.URL.queryString("id");
    var gebruikersid_zelf = session.gebruikersId;


// kijkt als er al een match is
        FYSCloud.API.queryDatabase(
            "SELECT * FROM `match` WHERE sender_Profiel_gebruikersid = ? AND reciever_id = ? AND sender_Bestemming_plaats = ?",
            [gebruikersid_zelf, gebruikersid_ander, session.bestemming]
        ).done(function (data) {
            console.log(data)
                if (gebruikersid_ander == data[0].reciever_id && gebruikersid_zelf == data[0].sender_Profiel_gebruikersid) {
                    console.log("er is match")
                    document.getElementById("boxtext").style.visibility = "visible";
                    document.getElementById("aanvraagbutton").style.visibility = "hidden";
                    var status = data[0].status;
                    console.log(status)
                    document.getElementById("boxtext").style.fontSize = "25px"
                    document.getElementById("boxtext").innerText = status;

                } else {
                    console.log("er is geen match")
                }

        }).fail(function (reason) {
            console.log(reason)
            console.log("er is geen match")
        })


// vraagt de data aan van de profiel die je bezoekt
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE gebruikersid = ?",
        [gebruikersid_ander]
    ).done(function (data) {
        console.log(data);

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

            document.getElementById('aanvraagbutton').onclick = aanvraag();
            document.getElementById('aanvraagbutton').onclick = email(data[0].voornaam,data[0].email);
        }



            FYSCloud.API.queryDatabase(
                "SELECT antwoord.gebruikersid, vraag.tekst FROM antwoord INNER JOIN vraag ON vraag.vraagid = antwoord.vraagid WHERE bestemming = ? AND gebruikersid = ?",
                [session.bestemming, gebruikersid_ander]
            ).done(function (data){
                console.log(data);
                var template = $("#templatevraag").html();
                for (var i = 0; i <data.length; i++){
                    var vraagtemplate = $(template);
                    var tekst = data[i].tekst;
                    vraagtemplate[0].innerHTML= tekst;
                    console.log(vraagtemplate[0])
                    $(".containerVragen").append(vraagtemplate);
                }


            }).fail(function (reason){
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

    function email(naam,email){
        htmlTemplate = "<h1>Hallo " + naam + "</h1><p>er staat een verzoek voor je klaar bij berichten</p>" ;
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
        }).done(function(data) {
            console.log(data);
        }).fail(function(reason) {
            console.log(reason);
        });
    }






}