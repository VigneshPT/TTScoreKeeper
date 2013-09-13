
//var fname = prompt("Enter Facebook profile id (example: vigneshpt)", "");
$(document).ready(function () {
    $(".set-picture-button").click(function () {
        var profileId = prompt("Enter Facebook profile id (example: vigneshpt)", "");
        var imageSource = "http://graph.facebook.com/" + profileId + "/picture?width=300&height=300";
        //var dataToSend = { "src": encodeURI(imageSource) };
        if (this.id == 'player1SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/1',
                type: "POST",
                processData: false,
                data: 'src=' + encodeURIComponent(imageSource), //encodeURI(imageSource),
                success: function (data) { console.log(data); },
                error: function () { console.log('error'); }

            });
        }
        else if (this.id == 'player2SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/2',
                type: "POST",
                processData: false,
                data: 'src=' + encodeURIComponent(imageSource),
                success: function (data) { console.log(data); },
                error: function () { console.log('error'); }

            });
        }
    });

    $('#nextroundbtn').click(function () {
        $.ajax({
            url: '/resetPlayers/1', //1 => to change to next round
            type: 'GET',
            processData: false,
            success: function (successmessage) { console.log(successmessage); },
            error: function (errormessage) { console.log(errormessage); }
        });
    });

    $('.updateScoreButton').click(function () {
        switch (this.id) {
            case "upbutton1":
                {
                    $('#player1Points').text(parseInt($('#player1Points').text(), 10) + 1);
                }
            case "upbutton2":
                {
                    $.ajax({
                        url: "/push",
                        type: "POST",
                        processData: false,
                        data: 'user=' + this.id,
                        success: function (data) { console.log(data); },
                        error: function (err) { console.log(err); }
                    });

                    break;
                }
            case "downbutton1":
            case "downbutton2":
                {
                    $.ajax({
                        url: "/pop",
                        type: "POST",
                        processData: false,
                        data: 'user=' + this.id,
                        success: function (data) { console.log(data); },
                        error: function (err) { console.log(err); }
                    });
                    break;
                }
        }
    });
});
