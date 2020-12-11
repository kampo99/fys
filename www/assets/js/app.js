$(document).ready(function() {
    //De onclick functie van de home knop
    $("#HomeButton").click(function() {
        console.log("mooiman");
        FYSCloud.URL.redirect("reiskeuze.html");
    });
});