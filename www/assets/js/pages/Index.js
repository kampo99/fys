window.onload = function(){



    document.getElementById('signupbutton').onclick = function(){ //een onclick event word gemaakt op de signupbutton

        var inputfields = document.querySelectorAll("input");
        console.log(inputfields);

        for(let i = 0; i < inputfields.length; i++){
            if(inputfields[i].value.length == 0){
                const feedbackObject = document.getElementById('feedback');
                geefFeedback(feedbackObject,"Alle tekst vakken moeten worden ingevuld",5000);
                break;
            }
        }

        var emailInput = document.getElementById("email").value; //invoer balk emailInput word verbonden aan atribuut email
        var passwordInput = document.getElementById("psw").value;//invoer balk passwordInput word verbonden aan atribuut psw

        /*selecteer de tabel profiel en de atributen email en wachtwoord.
          Die worden geassigend aan de id's van email en wachtwoord in de index.
        */
        FYSCloud.API.queryDatabase(

            "SELECT * FROM profiel WHERE email = ? and wachtwoord = ?",
            [emailInput, passwordInput]
        ).done(function(data) {

        //Als de gebruiker informatie invult zonder dat het in de database bekent is krijgt hij/zij een fout melding
        // data.leght mag ook worden geschreven als | data.lenght > 1 omdat je soms meer data terug kan krijgen dan 1
            if (data.length == 1){

                FYSCloud.Session.set("gebruikersId", data[0].gebruikersid);

                FYSCloud.URL.redirect("reiskeuze.html"); //gebruiker word verwezen naar de reiskeuze pagina.

            } else
                {
                document.getElementById("debugmessage").innerHTML = "verkeerde informatie ingevuld probeer opnieuw";

            }
        }).fail(function(reason) {
            console.log(reason);
        });



    }

};