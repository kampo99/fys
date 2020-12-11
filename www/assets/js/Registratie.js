window.onload = function(){

    document.getElementById('registerbtn').onclick = function() {
        var emailInput = document.getElementById("emailbtn").value;
        var passwordInput = document.getElementById("wachtwoordbtn").value;
        var voornaamInput = document.getElementById("voornaam").value;
        var achternaamInput = document.getElementById("achternaam").value;
        var geslachtInput = document.getElementById("geslachtbtn").value;

        FYSCloud.API.queryDatabase(
            "INSERT INTO `profiel` (`wachtwoord`,`voornaam`,`achternaam`, `email` ) VALUES (?, ?, ?, ?)",
            [passwordInput, voornaamInput, achternaamInput, emailInput]
        ).done(function (data) {
            console.log(data)
        }).fail(function (reason) {
         console.log(reason);
            });

    }
        document.getElementById('checkbox').onclick = function () {
            console.log("Ik heb geklikt")
            var x = document.getElementById("wachtwoordbtn");
            if (x.type === "password") {
                x.type = "text";
            } else {
                x.type = "password";
            }
        }

    function toSqlDatetime(inputDate) {
        const date = new Date(inputDate);
        const dateWithOffset = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return dateWithOffset
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
    }

};