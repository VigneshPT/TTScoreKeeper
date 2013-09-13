
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , ejs = require('ejs')
  ,PlayerProvider = require('./PlayerProvider').PlayerProvider;

var app = express();
var isConnected = false;

app.configure(function(){
  app.set('port',/* process.env.PORT ||*/ 3000);
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

//render client.js with correct port no.
var clientjsPath = __dirname + "/public/javascripts/client.js";
fs.readFile(clientjsPath, 'utf-8', function (err, completeJsFile) {
    if (err)
        console.log('file reading error');
    console.log(completeJsFile);
    var renderedJs = ejs.render(completeJsFile, { portNo: app.get('port') });
    console.log('rendered port number to client: ' + app.get('port'));
});

//connecting to db
var playerProvider = new PlayerProvider('localhost', 27017);


server.listen(app.get('port'), function(){
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
    console.log(playernumber);
    var imageSource = (req.body).src;
    console.log(imageSource);
    playerProvider.updateProfilePic(playernumber, imageSource, function (error) {
        if (error) console(error);
        res.send("successfully updated db with imagesource");
        //res.writeHead(200, { 'Content-Type': 'text/plain' });
        //res.write("successfully updated db with imagesource");
        //res.end();
        if (isConnected) {
            playerProvider.getPlayers(function (err, _players) {
                if (!err)
                    isConnected.emit('updatePlayers', {players:_players,advanceRound:0});//players);
                else
                    console.log('error ' + err);
            });
        }
    });
});

/*ajax calls from client -- end */

app.get('/', function(req,res){
    playerProvider.getPlayers(function (err, _players) {
        if(!err)
            res.render('index', { title: 'Global English Table Tennis Tournament',players:_players })
    });
});//routes.index);
app.get('/users', user.list);
app.get('/1132', function (req, res) {
    playerProvider.getPlayers(function (err, _players) {
        if(!err)
            res.render('admin', { title: 'Admin',players:_players })
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
    playerProvider.updatePlayerName(pnumber, req.body.pname, function (err, result) {
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




io.sockets.on('connection', function (socket) {
    isConnected = socket;
    isConnected.emit('connected');
//    var timer = setInterval(function () { socket.emit('updateCount'); }, 1000);
//    socket.on('stopUpdating', function () { clearInterval(timer); });

});
