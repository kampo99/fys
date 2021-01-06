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
            reisButtonTemplate.attr("bestemming", reis.Bestemming_plaats);
            for(var j = 0; j < reisButtonTemplate.length; j++){
                if (reisButtonTemplate[j].className == "reisButton"){
                    reisButtonTemplate[j].innerHTML = reis.Bestemming_plaats;
                    reisButtonTemplate[j].onclick = function(){
                        var reisBestemming = $(this).attr("bestemming");
                        FYSCloud.Session.set("bestemming", reisBestemming);
                        FYSCloud.URL.redirect("matching.html");
                    }
                }
            }
            $(".reisButtonContainer").append(reisButtonTemplate);
        }
    }).fail(function(reason) {
        console.log(reason);
    });
};