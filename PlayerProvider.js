var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSONPure;
var ObjectId = require('mongodb').ObjectID;

/*
    {
        _id:ObjectID,
        playerNumber: 1 or 2,
        name: "Ramkumar",
        profileImage: "http://graph.facebook.com/{id}/picture?width=300&height=300",
        points: 0
    }
*/


PlayerProvider = function (host, port) {
    this.db = new Db('tt-score-keeping-db', new Server(host, port, { auto_reconnect: true, safe: false }, {}));
    this.db.open(function (err, db) {
        if (!err) {
            console.log('connected to players tt-score-keeping db');
            db.collection('players', {/*strict:true*/
            }, function (error, player_collection) {
                /*if (error) {
                    console.log("the players collection doesn't exist, creating default players");*/
                player_collection.count(function (err, count) {
                    if (error || count == 0) { 
                        console.log("the players collection doesn't exist, creating default players");
                        player_collection.insert(defaultPlayers, { safe: true }, function (err, result) {
                            if (!err)
                                console.log('inserted default players');
                        });
                    }
                });
                /*if (err) {
                    console.log("the players collection doesn't exist, creating default players");

                    db.collection('players', function (err, collection) {
                        collection.insert(defaultPlayers, { safe: true }, function (err, result) {
                            if (!err)
                                console.log('inserted default players');
                        });
                    });
                }*/
            });
        }
    });
    //this.db.lastError(function(){});
};

PlayerProvider.prototype.getPlayerCollection = function (callback) {
    this.db.collection('players', function (error, player_collection) {
        if (error) callback(error);
        else callback(null, player_collection);
    });
};

PlayerProvider.prototype.getPlayers = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        player_collection.find().sort({playerNumber:1}).toArray(function (error, results) {
            if (error) callback(error);
            else callback(null, results);
        });
    })
};

PlayerProvider.prototype.getFirstPlayer = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        if (error) callback(error);
        else {
            player_collection.findOne({ playerNumber: 1 }, function (error, player_one) {
                if (error) callback(error);
                else callback(null, player_one);
            })
        }
    });
};

PlayerProvider.prototype.getSecondPlayer = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        if (error) callback(error);
        else {
            player_collection.findOne({ playerNumber: 2 }, function (error, player_two) {
                if (error) callback(error);
                else callback(null, player_two);
            })
        }
    });
};

PlayerProvider.prototype.updateProfilePic = function (playerNo, imageSource, callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {
            players.findOne({ playerNumber: parseInt(playerNo) }, function (findError, playerToUpdate) {
                if (findError)
                    console.log('find error');
                else {
                    console.log(playerToUpdate);
                    players.update({ _id: new ObjectId(playerToUpdate._id.toString()) }, { $set: { profileImage: imageSource} }, { multi: false, safe: true }, function (updateError, result) {
                        if (!updateError) {
                            console.log("imageSource updated for player" + playerNo);
                            console.log('affected ' + result + " docs");
                            callback();
                        }
                        else
                            console.log(updateError);
                    });
                }
            });
            /*players.update({ playerNumber: playerNo }, { $set: { profileImage: imageSource} }, { multi: false, safe: false, upset: false }, function (error, result) {
            if (!error) {
            console.log("imageSource updated for player" + playerNo);
            console.log('affected ' + result + " docs");
            callback();
            }
            else
            console.log(error);
            });*/
        }
    });
};

PlayerProvider.prototype.updateScore = function (playerNo, score, callback) {
    
    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {

            players.update({ playerNumber: playerNo }, { $set: { points: score} }, { multi: false },function(err,result){
                if(err) {console.log("error updating image source"); callback(err);}
                else
                    console.log("points updated for player" + playerNo)
            });
                    
        }
    });
};

PlayerProvider.prototype.updatePlayer = function(player,callback){
    this.getPlayerCollection(function(error,players){
        if(error)   callback(error);
        else{
            players.update({playerNumber:player.playerNumber},player,{multi:false},function(err,result){
               if(err){console.log("error updating player"); callback(err);}
               else console.log("player "+player.playerNumber+" updated"); 
            });
        }
    });
};

var defaultPlayers = [
    {
        playerNumber: 1,
        name: "",
        profileImage: "/images/men.jpg",
        points: 0
    },
    {
        playerNumber: 2,
        name: "",
        profileImage: "/images/men.jpg",
        points: 0
    }];

PlayerProvider.prototype.resetPlayers = function (callback) {

    this.getPlayerCollection(function (error, players) {
        for (var i = 0; i < defaultPlayers.length; i++) {
            players.drop();
            players.save(defaultPlayers[i], { safe: true }, function (err, result) {
                if (err) { console.log("couldn't reset player"); callback(error); }
                else {
                    console.log("resetted player " + defaultPlayers[i].playerNumber);
                }
            });
        }
    });

};


exports.PlayerProvider = PlayerProvider;