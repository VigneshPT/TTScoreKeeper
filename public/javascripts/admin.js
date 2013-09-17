$(document).ready(function () {
    $(".set-picture-button").click(function () {
        var profileId = prompt("Enter Facebook profile id (example: vigneshpt)", "");
        var imageSource = "";
        if (profileId !== "")
            imageSource = "http://graph.facebook.com/" + profileId + "/picture?width=300&height=300";
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
            if (typeof name === "undefined" || name === "null" || name === "") {
                name = "Home";
            }
            $('#player1namelabel').text(name);
            param = 1;
        }
        else if (this.id == 'editpname2') {
            if (typeof name === "undefined" || name === "null") {
                name = "Away";
            }
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

    $('.win-button').click(function () {
        var player = this.id == "player1WinButton" ? 1 : 2;
        //socket.emit('playerWon', player);
        $.ajax({
            url:"/triggerPlayerWin",
            data: "player="+player,
            success:function(successmessage){console.log(successmessage);},
            error: function(errormessage){console.log(errormessage);}
        });
    });

    $('.updateScoreButton').click(function () {
        var player = 0;
        var postURL = "";
        var currentPoints = 0;
        switch (this.id) {
            case "upbutton1":
                {
                    player = 1;
                    postURL = "/push";
                    currentPoints = parseInt($('#player1Points').text(), 10);
                    break;
                }
            case "upbutton2":
                {
                    player = 2;
                    postURL = "/push";
                    currentPoints = parseInt($('#player2Points').text(), 10);
                    break;
                }
            case "downbutton1":
                {
                    player = 1;
                    postURL = "/pop";
                    currentPoints = parseInt($('#player1Points').text(), 10);
                    break;
                }
            case "downbutton2":
                {
                    player = 2;
                    postURL = "/pop";
                    currentPoints = parseInt($('#player2Points').text(), 10);
                    break;
                }
        }
        if (currentPoints > 0 || postURL=="/push") {
            $.ajax({
                url: postURL,
                type: "POST",
                processData: false,
                data: 'player=' + player + '&score=' + currentPoints,
                success: function (data) { console.log(data); $('#player' + player + 'Points').text(currentPoints + (postURL == "/push" ? (1) : (-1))); },
                error: function (err) { console.log(err); }
            });
        }
    });
    
    $.getJSON("/player_list.json",function(data){
        var playerNames=[];
        alert(JSON.stringify(data));
    });
});
