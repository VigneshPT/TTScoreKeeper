var app = angular.module("tt", []);
app.controller('master', ["$scope", "$http", function ($scope, $http) {
    $scope.player1 = { name: "Narayanan", points: 0, profileImage: "/images/men.jpg" };
    $scope.player2 = { name: "Rajkumar", points: 0, profileImage: "/images/men.jpg" };
    $scope.round = "Round 1";
    var socket = io.connect("http://" + location.host);
    socket.on('updateCount', function (e) {
        if (e === "player1") {
            if ($scope.player1.points < 11)
                $scope.player1.points++;
            else
                $scope.player1.points = "WIN";
        }
        else if (e === "player2") {
            if ($scope.player2.points < 11)
                $scope.player2.points++;
            else
                $scope.player2.points = "WIN";
        }
        $scope.$apply();
    });
    socket.on('negateCount', function (e) {
        if (e === "player1") {
            if ($scope.player1.points !== 0)
                $scope.player1.points--;
            else
                $scope.player1.points = 0;
        }
        else if (e === "player2") {
            if ($scope.player2.points !== 0)
                $scope.player2.points--;
            else
                $scope.player2.points = 0;
        }
        $scope.$apply();
    });


    socket.on('connected', function () {
        console.log('Congrats, you are connected successfully');
    });

    socket.on('updatePlayers', function (players) {
        alert("invoked updatePlayers" + players[0].profileImage);
        $scope.player1 = players[0];
        $scope.player2 = players[1];
        $scope.$apply();
    });
} ]);




/* admin.jade javascript */
