window.onload = function(){

    document.getElementById('registerbtn').onclick = function() {

      var inputfields = document.querySelectorAll("input");

          for(let i = 0; i < inputfields.length; i++){
          if(inputfields[i].value.length == 0){
              const feedbackObject = document.getElementById('feedback');
              geefFeedback(feedbackObject,"Alle tekst vakken moeten worden ingevuld",5000);
              return;
          }
      }
        if (wachtwoordbtn.value != herhaalWachtwoord.value ){
            const feedbackObject = document.getElementById('feedback');
            geefFeedback(feedbackObject,"Wachtwoord komt niet overeen",5000);
            return;
        }

        var emailInput = document.getElementById("emailbtn").value; //id word verbonden met het atribuut
        var passwordInput = document.getElementById("wachtwoordbtn").value; //id word verbonden met het atribuut
        var voornaamInput = document.getElementById("voornaam").value; //id word verbonden met het atribuut
        var achternaamInput = document.getElementById("achternaam").value; //id word verbonden met het atribuut
        var geslachtInput = document.getElementById("geslacht").value; //id word verbonden met het atribuut



        //database atribturen worden opgehaald.
        FYSCloud.API.queryDatabase(
            "SELECT * FROM profiel WHERE email =?",
            [emailInput]
        ).done(function (data) {

            console.log(data);
            if (data.length > 0){
                const feedbackObject = document.getElementById('feedback');
                geefFeedback(feedbackObject,"De email bestaat al, probeer een andere.",5000);
                return;
            }
            FYSCloud.API.queryDatabase(
                "INSERT INTO `profiel` (`wachtwoord`,`voornaam`,`achternaam`, `email`, `geslacht` ) VALUES (?, ?, ?, ?, ?)",
                [passwordInput, voornaamInput, achternaamInput, emailInput, geslachtInput]
            ).done(function (data) {
                FYSCloud.URL.redirect("Index.html"); //gebruiker word verwezen naar de inlog pagina.

            }).fail(function (reason) {
                console.log(reason);
            });

        }).fail(function (reason) {
            console.log(reason);
        });


    }

    //password hasen en laten zien met een checkbox functie.
        document.getElementById('checkbox').onclick = function () {
            console.log("Ik heb geklikt")
            var x = document.getElementById("wachtwoordbtn");
            if (x.type === "password") {
                x.type = "text";
            } else {
                x.type = "password";
            }
        }

};