window.onload = function(){
        var gebruikersId1 = 1;
        var gebruikersId2 = 2;
        var gebruikersId3 = 3;
        var gebruikersId4 = 44;
        var gebruikersId5 = 45;

        var session = FYSCloud.Session.get();
        var profielen = session.matchaccounts;

    FYSCloud.API.queryDatabase(
            "SELECT * FROM profiel WHERE gebruikersid = 1 or gebruikersid = 2 or gebruikersid = 3 or gebruikersid = 44 or gebruikersid = 45",
            [gebruikersId1, gebruikersId2, gebruikersId3, gebruikersId4, gebruikersId5]
        ).done(function(data) {
            console.log(data);

        console.log(data[0].voornaam + " " + data[0].achternaam);

        var helenaam1 = data[0].voornaam + " " + data[0].achternaam;
        var helenaam2 = data[1].voornaam + " " + data[1].achternaam;
        var helenaam3 = data[2].voornaam + " " + data[2].achternaam;
        var helenaam4 = data[3].voornaam + " " + data[3].achternaam;
        var helenaam5 = data[4].voornaam + " " + data[4].achternaam;

        document.getElementById('profielnaam1').textContent = helenaam1;
        document.getElementById('profielnaam2').textContent = helenaam2;
        document.getElementById('profielnaam3').textContent = helenaam3;
        document.getElementById('profielnaam4').textContent = helenaam4;
        document.getElementById('profielnaam5').textContent = helenaam5;

            document.getElementById('request1').onclick = function() {
                FYSCloud.URL.redirect("Profiel.html", {
                    id: gebruikersId1
                });
                 }
            document.getElementById('request2').onclick = function() {
                FYSCloud.URL.redirect("Profiel.html", {
                    id: gebruikersId2
                });
            }
            document.getElementById('request3').onclick = function() {
                FYSCloud.URL.redirect("Profiel.html", {
                    id: gebruikersId3
                });
            }
            document.getElementById('request4').onclick = function() {
                FYSCloud.URL.redirect("Profiel.html", {
                    id: gebruikersId4
                });
            }
            document.getElementById('request5').onclick = function() {
                FYSCloud.URL.redirect("Profiel.html", {
                    id: gebruikersId5
                });
            }

        }).fail(function(reason) {
            console.log(reason);
        });

};