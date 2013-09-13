
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
            url: '/resetScores',
            type: 'GET',
            processData: false,
            success: function (successmessage) { console.log(successmessage); },
            error: function (errormessage) { console.log(errormessage); }
        });
        $('#player1Points').text(0);
        $('#player2Points').text(0);
    });
    $('#resetallbtn').click(function () {
        $.ajax({
            url: '/resetAll',
            type: 'GET',
            processData: false,
            success: function (successmessage) { console.log(successmessage); },
            error: function (errormessage) { console.log(errormessage); }
        });
        $('#player1Points').text(0);
        $('#player2Points').text(0);
        $('#player1namelabel').text("Home");
        $('#player2namelabel').text("Away");
    });

    $('.edit-name-button').click(function () {
        var name = prompt("Enter name: ");
        var param = null;
        if (this.id == 'editpname1') {
            $('#player1namelabel').text(name);
            param = 1;
        }
        else if (this.id == 'editpname2') {
            $('#player2namelabel').text(name);
            param = 2;
        }
        $.ajax({
            url: '/updatePlayerName/' + param,
            type: 'POST',
            processData: false,
            data: 'pname=' + name,
            success: function (successmessage) { console.log(successmessage); },
            error: function (errormessage) { console.log(errormessage); }
        });
    });

    $('.updateScoreButton').click(function () {
        switch (this.id) {
            case "upbutton1":
                {
                    //$('#player1Points').text(parseInt($('#player1Points').text(), 10) + 1);
                    $.ajax({
                        url: "/push",
                        type: "POST",
                        processData: false,
                        data: 'player=1&score=' + parseInt($('#player1Points').text(), 10),
                        success: function (data) { console.log(data); $('#player1Points').text(parseInt($('#player1Points').text(), 10) + 1); },
                        error: function (err) { console.log(err); }
                    });
                    break;
                }
            case "upbutton2":
                {
                    $.ajax({
                        url: "/push",
                        type: "POST",
                        processData: false,
                        data: 'player=2&score=' + parseInt($('#player2Points').text(), 10),
                        success: function (data) { console.log(data); $('#player2Points').text(parseInt($('#player2Points').text(), 10) + 1); },
                        error: function (err) { console.log(err); }
                    });

                    break;
                }
            case "downbutton1":
                {
                    var tempPoints = parseInt($('#player2Points').text(), 10);
                    if (tempPoints > 0) {
                        $.ajax({
                            url: "/pop",
                            type: "POST",
                            processData: false,
                            data: 'player=1&score=' + parseInt($('#player1Points').text(), 10),
                            success: function (data) { console.log(data); $('#player1Points').text(tempPoints - 1); },
                            error: function (err) { console.log(err); }
                        });
                    }
                    break;
                }
            case "downbutton2":
                {
                    var tempPoints = parseInt($('#player2Points').text(), 10);
                    if (tempPoints > 0) {
                        $.ajax({
                            url: "/pop",
                            type: "POST",
                            processData: false,
                            data: 'player=2&score=' + parseInt($('#player2Points').text(), 10),
                            success: function (data) { console.log(data); $('#player2Points').text(tempPoints - 1); },
                            error: function (err) { console.log(err); }
                        });
                    }
                    break;
                }
        }
    });
});
