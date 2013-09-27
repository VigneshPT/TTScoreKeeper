
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  ,PlayerProvider = require('./PlayerProvider').PlayerProvider;

var app = express();
var isConnected = false;
var port =process.env.OPENSHIFT_NODEJS_PORT || '3000';
app.configure(function(){
  app.set('port',port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 2);
//io.set('transports', [ 'websocket', 'xhr-polling' ]);

//connecting to db
var playerProvider = new PlayerProvider();


server.listen(app.get('port'),process.env.OPENSHIFT_NODEJS_IP||"localhost", function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* ajax calls from client -- start */
app.get('/getPlayers', function (req, res) {
    playerProvider.getPlayers(function (err, players) {
        console.log(players);
        res.send(JSON.stringify(players));
    });
});

app.post('/admin/updateUserPicture/:number', function (req, res) {
    var playernumber = req.params.number;
    var imageSources = (req.body).src;
    console.log(imageSources);
    playerProvider.updateProfilePic(playernumber, JSON.parse(imageSources), function(error){
        if(error) console.log(error);
        else{
            res.send('successfully updated db with imagesources');
            if (isConnected) {
                 playerProvider.getPlayers(function (err, _players) {
                     if (!err)
                         isConnected.emit('updatePlayers', {players:_players,advanceRound:0});//players);
                     else
                         console.log('error ' + err);
                 });
             }
        }
    });
});

/*ajax calls from client -- end */

app.get('/', function(req,res){
    playerProvider.getPlayers(function (err, _players) {
        if(!err)
            res.render('index', { title: 'Global English Table Tennis Tournament',players:_players }) //check with index2
    });
});//routes.index);
app.get('/users', user.list);
app.get('/1132', function (req, res) {
    playerProvider.getPlayers(function (err, _players) {
        if(!err)
            res.render('admin', { title: 'Admin',players:_players })
    });
    
});

app.get('/admin/rounds',function(req,res){
    playerProvider.getAllRounds(function(err,_rounds){
        if(!err)
            res.render('rounds',{title:'Rounds',rounds:_rounds});
    });
});


app.get('/resetScores', function (req, res) {
    playerProvider.resetScores(function (err, result) {
        if (err) { console.log(err); res.send(err); }
        else { 
            console.log('successfully resetted'); 
            var _advanceRound =req.params.advanceRound;
            if (isConnected) {
                playerProvider.getPlayers(function (err, _players) {
                    if (!err)
                        isConnected.emit('updatePlayers', {players:_players,advanceRound:1});
                    else
                        console.log('error ' + err);
                });
            }
            res.send('success'); 
        }
    });
});

app.get('/resetAll', function (req, res) {
    playerProvider.resetPlayers(function (err, result) {
        if (err) { console.log(err); res.send(err); }
        else { 
            console.log('resetted everything to default'); 
            if (isConnected) {
                playerProvider.getPlayers(function (err, _players) {
                    if (!err)
                        isConnected.emit('updatePlayers', {players:_players,advanceRound:2}); // advanceRound:2 for resetting the Round
                    else
                        console.log('error ' + err);
                });
            }
            res.send('success'); 
        }
    });
});

app.post('/updatePlayerName/:number', function (req, res) {
    //console.log(req.body);
    var pnumber = req.params.number;
    playerProvider.updatePlayerName(pnumber, req.body.pname, req.body.ptype, function (err, result) {
        if (err) { console.log('error updating player name: ' + err); res.send('error'); }
        else {
            res.send('success: updated player name');
            if (isConnected) {
                playerProvider.getPlayers(function (err, _players) {
                    if (!err)
                        isConnected.emit('updatePlayers', {players:_players,advanceRound:0});//players);
                    else
                        console.log('error ' + err);
                });
            }
        }
    });
});

app.post('/push', function (req, res) {
    console.log(req.body);
    playerProvider.updateScore(req.body.player, parseInt(req.body.score,10)+1, function (err, result) {
        if (err) { console.log('could not update player to db: ' + err); }
        else {
            playerProvider.getPlayers(function (error, players) {
                if (error) { console.log('could not get players [in push post]' + error); }
                else {isConnected.emit("updateCount", players); res.send('success'); }
            });
        }
    });
    //isConnected.emit("updateCount", req.body);
    //res.redirect('/1132');

});

app.post('/pop', function(req, res){
    playerProvider.updateScore(req.body.player, parseInt(req.body.score,10)-1, function (err, result) {
        if (err) { console.log('could not update player to db: ' + err); }
        else {
            playerProvider.getPlayers(function (error, players) {
                if (error) { console.log('could not get players [in pop post]' + error); }
                else {isConnected.emit("negateCount", players); res.send('success'); }
            });
        }
    });

    //isConnected.emit("negateCount", req.body.user);
    // res.redirect('/1132');
});

Date.prototype.today = function() {
	var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	return (weekday[this.getDay()] + ", " + monthNames[this.getMonth()] + " " + ((this.getDate() < 10) ? "0" : "") + this.getDate());
};
//For the time now
Date.prototype.timeNow = function() {
	return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes();
};

app.post('/recordRoundInfo',function(req,res){
    //post round info
    var date = new Date();
    var _readableTimestamp = date.timeNow() + ", "+ date.today();
    var data = {
        p1Name : req.body.p1Name,
        p1Score: req.body.p1Score,
        p2Name: req.body.p2Name,
        p2Score: req.body.p2Score,
        readableTimestamp: _readableTimestamp,
        timestamp: Date.now()
        
    }
    playerProvider.insertRoundData(data,function(error,docs){
        if(error) res.send('error inserting round data');
        else{
            res.send('successfully inserted round data');
        }
    });
});

app.post('/triggerPlayerWin',function(req,res){
    //listen when a player has won
    isConnected.emit('playerWon', req.body.player);
    res.send('player'+player +" has won");
});

//testing code
app.post('/updatePlayerObject',function(req,res){
    console.log(JSON.parse(req.body.player));
    playerProvider.updatePlayer(JSON.parse(req.body.player),function(err,result){
        if(err) res.send('error '+err);
        else{
            res.send('success, updated player object'+result);
        }
    });
});


io.sockets.on('connection', function (socket) {
    isConnected = socket;
    isConnected.emit('connected');
    //    var timer = setInterval(function () { socket.emit('updateCount'); }, 1000);
    //    socket.on('stopUpdating', function () { clearInterval(timer); });
});