var app = angular.module("tt", []);
app.controller('master', ["$scope", "$http", function ($scope, $http) {
    $scope.player1 = players[0] || { name: "Home", points: 0, profileImage: "/images/men.jpg" };
    $scope.player2 = players[1] || { name: "Away", points: 0, profileImage: "/images/men.jpg" };
    $scope.round = 1;
    var socket = io.connect("http://" + location.host);
    socket.on('updateCount', function (e) {
        //alert(e);
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        /*if (e === "upbutton1") {
        if ($scope.player1.points < 11)
        $scope.player1.points++;
        else
        $scope.player1.points = "WIN";
        }
        else if (e === "upbutton2") {
        if ($scope.player2.points < 11)
        $scope.player2.points++;
        else
        $scope.player2.points = "WIN";
        }*/
        $scope.$apply();
    });
    socket.on('negateCount', function (e) {
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        /*if (e === "downbutton1") {
        if ($scope.player1.points !== 0)
        $scope.player1.points--;
        else
        $scope.player1.points = 0;
        }
        else if (e === "downbutton2") {
        if ($scope.player2.points !== 0)
        $scope.player2.points--;
        else
        $scope.player2.points = 0;
        }*/
        $scope.$apply();
    });


    socket.on('connected', function () {
        console.log('Congrats, you are connected successfully');
    });

    socket.on('updatePlayers', function (data) {
        //alert("invoked updatePlayers" + JSON.stringify(data));
        $scope.player1 = data.players[0];
        $scope.player2 = data.players[1];
        if (data.advanceRound == 1)
            $scope.round = parseInt($scope.round, 10) + 1; //Advance to next round
        else if (data.advanceRound == 2)
            $scope.round = 1;
        $scope.$apply();
    });
} ]);




/* admin.jade javascript */
