
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
    var imageSource = decodeURI(req.body);
    console.log(imageSource.toString());
    playerProvider.updateProfilePic(playernumber, imageSource, function (error) {
        console(error);
        res.send("successfully updated db with imagesource");
        if (isConnected) {
            if (playernumber == 1)
                playerProvider.getPlayers(function (err, players) {
                    if (!err)
                        isConnected.broadcast.emit('updatePlayers', players);
                    else
                        console.log('error ' + err);
                });
        }
    });
});

/*ajax calls from client -- end */

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/1132', function (req, res) {
    playerProvider.getPlayers(function (err, _players) {
        if(!err)
            res.render('admin', { title: 'Admin',players:_players })
    });
    
});
app.post('/push', function(req, res){

    isConnected.emit("updateCount", req.body.user.name);
    res.redirect('/1132');
    
});

app.post('/pop', function(req, res){
    isConnected.emit("negateCount", req.body.user.name);
     res.redirect('/1132');
});




io.sockets.on('connection', function (socket) {
    isConnected = socket;
    isConnected.emit('connected');
//    var timer = setInterval(function () { socket.emit('updateCount'); }, 1000);
//    socket.on('stopUpdating', function () { clearInterval(timer); });

});
