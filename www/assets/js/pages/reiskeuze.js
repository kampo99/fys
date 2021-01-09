window.onload = function(){
    var session = FYSCloud.Session.get();
    var gebruikersId = session.gebruikersId;
    FYSCloud.API.queryDatabase(
        "SELECT * FROM reis WHERE Profiel_gebruikersId = ?",
        [gebruikersId]
    ).done(function(data) {
        var template = $("#reisButtonTemplate").html();
        for(var i = 0; i < data.length; i++) {
            var reisButtonTemplate = $(template);
            var reis = data[i];
            reisButtonTemplate.find(".reisButton").text(reis.Bestemming_plaats);
            reisButtonTemplate.find(".reisButton").on("click", function(){
                FYSCloud.Session.set("bestemming", reis.Bestemming_plaats);
                FYSCloud.URL.redirect("matching.html");
            });
            $(".reisButtonContainer").append(reisButtonTemplate);
        }
    }).fail(function(reason) {
        console.log(reason);
    });
};