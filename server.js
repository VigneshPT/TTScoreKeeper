
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var isConnected = false;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/1132',function(req,res){res.render('admin', { title: 'Admin' })});
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
