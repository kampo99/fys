function testDatabase() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profiel WHERE voornaam = 'Angelica'"
    ).done(function(data) {
        console.log(data);
    }).fail(function(reason) {
        console.log(reason);
    });
}