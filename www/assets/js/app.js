$(document).ready(function() {
    //De onclick functie van de home knop
    $("#HomeButton").click(function() {
        FYSCloud.URL.redirect("reiskeuze.html");
    });
    //De onclick functie van de profiel knop
    $("#ProfielButton").click(function() {
        FYSCloud.URL.redirect("EditableProfile.html");
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