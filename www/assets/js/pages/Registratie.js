window.onload = function(){

    document.getElementById('registerbtn').onclick = function() {

      var inputfields = document.querySelectorAll("input");
      console.log(inputfields);

      for(let i = 0; i < inputfields.length; i++){
          if(inputfields[i].value.length == 0){
              const feedbackObject = document.getElementById('feedBack');
              geefFeedback(feedbackObject,"Alle tekst vakken moeten worden ingevuld",5000);
              break;
          }
      }

        var emailInput = document.getElementById("emailbtn").value; //id word verbonden met het atribuut
        var passwordInput = document.getElementById("wachtwoordbtn").value; //id word verbonden met het atribuut
        var voornaamInput = document.getElementById("voornaam").value; //id word verbonden met het atribuut
        var achternaamInput = document.getElementById("achternaam").value; //id word verbonden met het atribuut
        var geslachtInput = document.getElementById("geslachtbtn").value; //id word verbonden met het atribuut


        //database atribturen worden opgehaald.
        FYSCloud.API.queryDatabase(
            "INSERT INTO `profiel` (`wachtwoord`,`voornaam`,`achternaam`, `email` ) VALUES (?, ?, ?, ?)",
            [passwordInput, voornaamInput, achternaamInput, emailInput]
        ).done(function (data) {
            console.log(data)
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