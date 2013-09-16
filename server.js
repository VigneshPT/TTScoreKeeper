<<<<<<< HEAD

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
io.set('log level', 2);
io.set('transports', [ 'websocket', 'xhr-polling' ]);

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
    var imageSource = (req.body).src;
    console.log(imageSource);
    if(imageSource === "")
        imageSource = "default";
    playerProvider.updateProfilePic(playernumber, imageSource, function (error) {
        if (error) console(error);
        res.send("successfully updated db with imagesource");
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
    //listen when a player has won
    isConnected.on('playerWon', function (param) {
        console.log('player ' + param + ' has won');
        isConnected.emit('playerWon', param);
    });
});
=======
#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        // Routes for /health, /asciimo and /
        self.routes['/health'] = function(req, res) {
            res.send('1');
        };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

>>>>>>> d5335ecbcb6a315c9d0edb40e7238b15022a1ac6
