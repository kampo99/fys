window.onload = function(){
    
    document.getElementById('signupbutton').onclick = function(){

        var emailInput = document.getElementById("email").value;
        var passwordInput = document.getElementById("psw").value;


        FYSCloud.API.queryDatabase(

            "SELECT * FROM profiel WHERE email = ? and wachtwoord = ?",
            [emailInput, passwordInput]
        ).done(function(data) {

            if (data.length == 1){

                FYSCloud.Session.set("gebruikersId", data[0].gebruikersid);

                FYSCloud.URL.redirect("reiskeuze.html");

            } else
                {
                document.getElementById("debugmessage").innerHTML = "verkeerde informatie ingevuld probeer opnieuw";

            }
        }).fail(function(reason) {
            console.log(reason);
        });



    }

};