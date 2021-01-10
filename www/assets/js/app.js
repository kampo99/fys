$(document).ready(function() {
    //De onclick functie van de home knop
    $("#HomeButton").click(function() {
        FYSCloud.URL.redirect("reiskeuze.html");
    });
    //De onclick functie van de profiel knop
    $("#ProfielButton").click(function() {
        FYSCloud.URL.redirect("editableprofile.html");
    });
    //De onclick functie van de uitlog knop
    $("#UitloggenKnop").click(function() {
        //FYSCloud.Session.clear();
        FYSCloud.URL.redirect("Index.html");
    });
});
//Handige functie om voor een bepaalde tijd feedback te laten zien
function geefFeedback(feedbackObject,feedbackTekst,overleefTijd) {
    feedbackObject.innerText = feedbackTekst;
    setTimeout(function() { verwijderFeedback(feedbackObject); }, overleefTijd);
}
function verwijderFeedback(feedback){
    feedback.innerText = "";
}
function leeftijdBerekenen(geboortedatumPar){
    var geboortedatum = new Date(geboortedatumPar);
    var geboortejaar = geboortedatum.getFullYear();
    var heden = new Date();
    var hedenJaar = heden.getFullYear();
    var leeftijd = hedenJaar - geboortejaar;

    if(heden.getMonth() < 0 || (heden.getMonth() === 0 && heden.getDate() < geboortedatum.getDate())){
        leeftijd--;
    }

    return leeftijd;

}