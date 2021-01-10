window.onload = function(){

        //wanneer er op de registreer knop word drukt begint het onderstaande.
    document.getElementById('registeerbtn').onclick = function() {

        //We kijken alle input waardes waar de gebruikers gegevens invult
      var inputfields = document.querySelectorAll("input");

        //Als 1 input veld niet is ingevuld word een bericht gestuurd dat na de overleefTijd verdwijnt.
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
        var geboortedatumInput = document.getElementById("geboortedatum").value; //id word verbonden met het atribuut


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
                "INSERT INTO `profiel` (`wachtwoord`,`voornaam`,`achternaam`, `email`, `geslacht`, `geboortedatum` ) VALUES (?, ?, ?, ?, ?, ?)",
                [passwordInput, voornaamInput, achternaamInput, emailInput, geslachtInput, geboortedatumInput]
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
        document.getElementById('wachtwoordzien').onclick = function () {
            console.log("Ik heb geklikt")
            var wachtwoordText = document.getElementById("wachtwoordbtn");
            var herhaalwachtwoordText = document.getElementById("herhaalWachtwoord");
            if (wachtwoordText.type === "password") {
                wachtwoordText.type = "text";
                herhaalwachtwoordText.type = "text";
            } else {
                wachtwoordText.type = "password";
                herhaalwachtwoordText.type = "password";
            }
        }

};