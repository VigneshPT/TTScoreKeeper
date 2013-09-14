var app = angular.module("tt", []);
app.controller('master', ["$scope", "$http", function ($scope, $http) {
    $scope.player1 = players[0] || { name: "Home", points: 0, profileImage: "/images/men.jpg" };
    $scope.player2 = players[1] || { name: "Away", points: 0, profileImage: "/images/men.jpg" };
    $scope.round = 1;
    var socket = io.connect("http://" + location.host);
    socket.on('updateCount', function (e) {
<<<<<<< HEAD
=======
        //alert(e);
>>>>>>> 4b66c0d1b14996383754548186a332159c0433b9
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
<<<<<<< HEAD
=======
        //alert("invoked updatePlayers" + JSON.stringify(data));
>>>>>>> 4b66c0d1b14996383754548186a332159c0433b9
        $scope.player1 = data.players[0];
        $scope.player2 = data.players[1];
        if (data.advanceRound == 1){
            if($scope.round < 3)
                $scope.round = parseInt($scope.round, 10) + 1;
        } //Advance to next round
        else if (data.advanceRound == 2)
            $scope.round = 1;
        $scope.$apply();
    });
}]);




/* admin.jade javascript */
