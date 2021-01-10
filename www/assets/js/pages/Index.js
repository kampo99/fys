window.onload = function(){



    document.getElementById('signupbutton').onclick = function(){ //een onclick event word gemaakt op de signupbutton

        var inputfields = document.querySelectorAll("input");

        for(let i = 0; i < inputfields.length; i++){
            if(inputfields[i].value.length == 0){
                const feedbackObject = document.getElementById('feedback');
                geefFeedback(feedbackObject,"Alle tekst vakken moeten worden ingevuld",5000);
                return;
            }
        }

        var emailInput = document.getElementById("email").value; //invoer balk emailInput word verbonden aan atribuut email
        var passwordInput = document.getElementById("wachtwoord").value;//invoer balk passwordInput word verbonden aan atribuut psw

        /*selecteer de tabel profiel en de atributen email en wachtwoord.
          Die worden geassigend aan de id's van email en wachtwoord in de index.
        */
        FYSCloud.API.queryDatabase(

            "SELECT * FROM profiel WHERE email = ?",
            [emailInput]
        ).done(function(data) {
        //Als de gebruiker informatie invult zonder dat het in de database bekent is krijgt hij/zij een fout melding
        // data.length mag ook worden geschreven als | data.lenght > 1 omdat je soms meer data terug kan krijgen dan 1
            if (data.length == 1){
                if(data[0].wachtwoord == passwordInput){
                    FYSCloud.Session.set("gebruikersId", data[0].gebruikersid);
                    FYSCloud.URL.redirect("reiskeuze.html"); //gebruiker word verwezen naar de reiskeuze pagina.
                }else{
                    const feedbackObject = document.getElementById('feedback');
                    document.getElementById('wachtwoordvergetenlink').style.display = "inline-block";
                    setTimeout(function() { VerwijderHref(document.getElementById('wachtwoordvergetenlink')); }, 10000);
                    geefFeedback(feedbackObject,"Onjuist wachtwoord, wachtwoord vergeten?",10000);
                }
            } else
                {
                    const feedbackObject = document.getElementById('feedback');
                    geefFeedback(feedbackObject,"Onjuiste informatie, profiel bestaat niet.",5000);

            }

        }).fail(function(reason) {
            console.log(reason);
        });

    }

    function VerwijderHref(ahref){
        ahref.style.display = "none";
    }

};