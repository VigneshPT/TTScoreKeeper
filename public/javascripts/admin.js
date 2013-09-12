
//var fname = prompt("Enter Facebook profile id (example: vigneshpt)", "");
$(document).ready(function () {
    $(".set-picture-button").click(function () {
        var profileId = prompt("Enter Facebook profile id (example: vigneshpt)", "");
        var imageSource = "http://graph.facebook.com/" + profileId + "/picture"
        if (this.id == 'player1SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/1',
                type: "POST",
                processData: false,
                dataType:"text",
                data: encodeURI(imageSource),
                success: function () { console.log("Updated"); },
                error: function () { console.log('error'); }

            });
        }
        else if (this.id == 'player2SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/2',
                type: "PUT",
                processData: false,
                data: encodeURI(imageSource),
                success: function () { console.log("Updated"); },
                error: function () { console.log('error'); }

            });
        }
    });

});
