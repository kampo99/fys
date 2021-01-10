window.onload = function(){


    //een onclick event word gemaakt op de signupbutton
    document.getElementById('loginbutton').onclick = function(){

        //Alle input waardes worden gecheckt
        var inputfields = document.querySelectorAll("input");

        //Als 1 input veld niet is ingevuld word een bericht gestuurd dat na de overleefTijd verdwijnt.
        for(let i = 0; i < inputfields.length; i++){
            if(inputfields[i].value.length == 0){
                const feedbackObject = document.getElementById('feedback');
                geefFeedback(feedbackObject,"Alle tekst vakken moeten worden ingevuld",5000);
                return;
            }
        }

        var emailInput = document.getElementById("email").value;
        var passwordInput = document.getElementById("wachtwoord").value;


        FYSCloud.API.queryDatabase(

            "SELECT * FROM profiel WHERE email = ?",
            [emailInput]
        ).done(function(data) {

        //Als de gebruiker informatie invult zonder dat het in de database bekent is krijgt hij/zij een fout melding
            if (data.length == 1){
                if(data[0].wachtwoord == passwordInput){
                    FYSCloud.Session.set("gebruikersId", data[0].gebruikersid);//
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
    //verwijderd de link die naar corendon verwijst
    function VerwijderHref(ahref){
        ahref.style.display = "none";
    }

};