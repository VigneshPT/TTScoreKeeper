var socket = io.connect("http://" + location.host);
var app = angular.module("tt", []);
app.controller('master', ["$scope", "$http", function ($scope, $http) {
    $scope.player1 = players[0] || { name: "Home", points: 0, profileImage: "/images/men.jpg" };
    $scope.player2 = players[1] || { name: "Away", points: 0, profileImage: "/images/men.jpg" };

    $scope.$watch("player1", function (newValue, oldValue) {
        if (newValue.profileImage === "default") {
            $scope.player1.profileImage = "/images/men.jpg"
        }
    });
    $scope.$watch("player2", function (newValue, oldValue) {
        if (newValue.profileImage === "default") {
            $scope.player2.profileImage = "/images/men.jpg"
        }
    });

    $scope.round = 1;
    socket.on('updateCount', function (e) {
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        $scope.$apply();
    });
    socket.on('negateCount', function (e) {
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        $scope.$apply();
    });


    socket.on('connected', function () {
        console.log('Congrats, you are connected successfully');
    });

    socket.on('updatePlayers', function (data) {
        document.getElementById('player-points-1').style.color="#333";
        document.getElementById('player-points-1').style.color="#333";
        $scope.player1 = data.players[0];
        $scope.player2 = data.players[1];
        if (data.advanceRound == 1) {
            if ($scope.round < 3)
                $scope.round = parseInt($scope.round, 10) + 1;
        } //Advance to next round
        else if (data.advanceRound == 2)
            $scope.round = 1;
        $scope.$apply();
    });

    
} ]);

socket.on('playerWon', function (param) {
        //Decide how to show the WIN message in a good way
        if (param == 1)
        { document.getElementById('player-points-1').style.color="green"; }
        else if (param == 2)
        { document.getElementById('player-points-2').style.color="green"; }
        
 });


/* admin.jade javascript */
