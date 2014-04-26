var express = require('express')
  , cons = require('consolidate')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , less = require('less-middleware')
  , User = require('./src/server/models/user.js').User
  , Team = require('./src/server/models/team.js').Team
  , auth = require('./src/server/auth')(passport)
  , validate = require('express-validator')
  ;

/**
 *  Pact - App
 */
var Pact = function() {

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
    self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    self.mongo_host = process.env.OPENSHIFT_MONGODB_DB_HOST || "localhost";
    self.mongo_port = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

    if (typeof self.ipaddress === "undefined") {
      //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
      //  allows us to run/test the app locally.
      console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
      self.ipaddress = "127.0.0.1";
    };
  };

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
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  self.initializeServer = function() {
    require('./src/server/routes')(self.app, passport, debug);
  };

  /**
   *  Initializes the sample application.
   */
  self.initialize = function() {
    self.setupVariables();
    self.setupTerminationHandlers();
    self.app = express();
    self.app.use(express.cookieParser());
    self.app.use(express.bodyParser());
    self.app.use(validate());
    self.app.use(express.session({ secret: 'SECRET' })); //TODO: secret
    //Remember me functionality
    self.app.use( function (req, res, next) {
      if ( req.method == 'POST' && req.url == '/login' ) {
        if ( req.param('rememberMe') ) {
          req.session.cookie.maxAge = 24*60*60*1000*30; // 30*24*60*60*1000 = 30 days
        } else {
          req.session.cookie.expires = false;
        }
      }
      next();
    });
    self.app.use(passport.initialize());
    self.app.use(passport.session());
    self.app.use(less({
        dest: __dirname + '/public/css',
        src: __dirname + '/src/less',
        prefix: '/css',
        compress: true,
        debug: debug,
        force: debug
      }));
    self.app.configure(function() {
      self.app.use(express.static(__dirname + '/public'));
    });
    self.app.set('view engine', 'html');
    self.app.set('views', __dirname + '/src/views')
    //If you want to update hmtl without restarting the server, comment this line out for now.
    if (!debug) {
      self.app.enable('view cache');
    }
    self.app.engine('html', cons.ejs);

    var uri = 'mongodb://' + self.mongo_host + ':' + self.mongo_port + '/pact'
      , options = { user : "pact", pass : "danco<3ch33se" }
      ;
    if(self.mongo_host == "localhost") {
      mongoose.connect(uri);
    }
    else {
      mongoose.connect(uri, options);
    }

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
var pact = new Pact();
var debug = (process.argv.indexOf('--debug') >= 0);
pact.initialize();
pact.start();



var java_host = process.env.OPENSHIFT_NODEJS_IP || "localhost";
var p = process.env.OPENSHIFT_NODEJS_PORT
var java_port = p || 15160;
var exec = require('child_process').exec;
var child;

//java_command = "java -Djava.library.path=$PWD/NLPj "
//java_command = "java -Djava.library.path=" + __dirname + "/NLPj:NLPj "
java_command = "java -cp "
java_command += "NLPj/stanford-parser-3.3.1-models.jar:"
java_command += "NLPj/stanford-parser.jar:"
java_command += "NLPj/stanford-postagger-3.3.1.jar:"
java_command += "NLPj/simplenlg-v4.4.2.jar:"
java_command += "NLPj/ejml-0.23.jar:"
java_command += "NLPj/jnisvmlight.jar:"
java_command += "NLPj/jsoup-1.7.3.jar:"
java_command += "NLPj/stanford-corenlp-3.3.1.jar:"
java_command += "NLPj/stanford-corenlp-3.3.1-models.jar:"
java_command += "NLPj/libsvm.jar:"
java_command += "NLPj Server "
java_command += java_host + " " + java_port

/*
java_command = "java -cp "
java_command += "NLPj/stanford-parser-3.3.1-models.jar:"
java_command += "NLPj/stanford-parser.jar:"
java_command += "NLPj/stanford-postagger-3.3.1.jar:"
java_command += "NLPj/simplenlg-v4.4.2.jar:"
java_command += "NLPj Server "
java_command += java_host + " " + java_port
*/


child = exec(java_command,
   function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
          console.log('exec error: ' + error);
      }
   });

//Calls toPastTense so that Java libraries can load
setTimeout(function() {
  var net = require('net');

  var client = net.connect({port: java_port, host: java_host},
    function() {
    console.log('client connected');
    client.write('toPastTense;test past tense verbs;male;\r\n');
  });
  client.on('data', function(data) {
    console.log(data.toString());
    client.end();
  });
  client.on('end', function() {
    console.log('client disconnected');
  });
  client.on('error', function() {
    setTimeout(function() {
      var net = require('net');

      var client = net.connect({port: java_port, host: java_host},
        function() {
        console.log('client connected');
        client.write('toPastTense;test past tense verbs;male;\r\n');
      });
      client.on('data', function(data) {
        console.log(data.toString());
        client.end();
      });
      client.on('end', function() {
        console.log('client disconnected');
      });
      client.on('error', console.log);
    }, 4000);
  });
}, 1000);

setTimeout(function() {
  var net = require('net');

  var client = net.connect({port: java_port, host: java_host},
    function() {
      console.log('client connected');
      client.write('getAdvice;study;this is the worst;\r\n');
  });
  client.on('data', function(data) {
    console.log(data.toString());
    client.end();
  });
  client.on('end', function() {
    console.log('client disconnected');
  });
  client.on('error', console.log);
  
}, 5000);


