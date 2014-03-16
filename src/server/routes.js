var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "apppact@gmail.com",
    pass: "cornellpact"
  }
});

function mail_confirm_account(user) {
  link = "http://localhost:8080/confirm_account/" + user._id;

  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG
  // console.log is necessary to make our code syncronous
  // Mail experiences some asyncronous functionality if there isn't a console.log
  console.log(user);
  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG

  mailOptions = {
    from: "Achieve ✔ <apppact@gmail.com>",
    to: user.email,
    subject: "Confirm your account for Achieve!",
    text: "necessary?",
    html: user.name + ", thank you for signing up for Achieve! Click the following link to confirm your account. If this is not you, please disregard this email. <br/>" + link

  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
  });

}

// for faster performance, directly pass in the appropriate email link
function mailSignup(user, leader, groupname) {
	linkSignup = "http://localhost:8080/signup/" + user._id;
	if (! user.pending){
		linkSignup = "http://localhost:8080/login/" + user._id;
	}

	// NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG
	// console.log is necessary to make our code syncronous
	// Mail experiences some asyncronous functionality if there isn't a console.log
	console.log(user);
	// NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG

  mailOptions = {
    from: "Achieve ✔ <apppact@gmail.com>",
    to: user.email,
    subject: "Sign up for Achieve!",
    text: "necessary?",
    html: leader + " has signed you up for the Achieve team:" + groupname +". Click the following link to sign up for Pact: <br/>" + linkSignup
  }
  //TODO: uncomment this out to send email!

  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
		}
  });
}

function sendMail(){
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
  });
}

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , Team = mongoose.model('Team')
  , url = require('url')
  , auth
  ;

module.exports = function(app, passport) {
  auth = require('./auth')(passport);

  app.get('/', auth.isAuthenticated, function(req, res) {
    User.is_user_confirmed(req.user, function(err, is_confirmed) {
      if (err) {
        console.log(err.message);
      }
      console.log("----> " + is_confirmed);
      if (is_confirmed == false) {
        res.render('account_pending');
      }
    });

	  Team.findList(req.user.teams,function(err, doc_teams){
		  if (err){
			  console.log(err.message);
		  }
		  else{
			  User.findList(doc_teams,function(err, doc_users){
				  if (err){
					  console.log(err.message);
				  }
				  else{

				    var now = new Date();
				    now.setDate(now.getDate());
						for (var i = 0; i < doc_teams.length; i++){
							//figure out if deadline includes the last day
							doc_teams[i].countdown = Math.floor((doc_teams[i].deadline - now) / 86400000)	
							if (doc_teams[i].deadline < now){
								doc_teams[i].has_deadline_passed = true;
								doc_teams[i].save(function(err, team, num) {
			            if(err) {
			              res.send(err.message);
			            }
			          });
							}
						}
					  res.render('user_newsfeed', {
			        title: "Personalized Newsfeed",
		  		    teams: doc_teams,
						  users: doc_users,
		          user: req.user
			      });
				  }
			  });
		  }
	  });
  });

  app.get('/resend_redirect', function(req, res){
		mail_confirm_account(req.user);
    res.redirect('/');
  });
	
  app.get('/admin/user', auth.isAuthenticated, function(req,res){
    res.render('admin_user',{
      title: 'Admin User Page'
    });
  });

  app.get('/admin/team', auth.isAuthenticated, function(req,res){
    res.render('admin_team',{
      title: 'Admin Team Page'
    });
  });


  app.get("/pending", auth.isAuthenticated, function(req,res){
    Team.findList(req.user.teams,function(err, docs){
    if (err){
      console.log(err.message);
    }
    else{
     res.render('pending', {
        count : 0,
        teams: docs,
        user: req.user
      });
    }});
  });

  app.get('/team/new', auth.isAuthenticated, function(req,res){
	  res.render('team_new',{
		  title: 'New Team'
	  });
  });

  app.post('/team/new', auth.isAuthenticated, function(req,res){
    req.assert('name', 'Name is required').notEmpty();
    req.assert('deadline', 'Valid deadline required').notEmpty();
		
	  //Checks to see the number of users and loops through the array and gets inputs based on number of users
	  var num_user = parseInt(req.param('num_user'),10);
	  var arr = [];
	  //adds leader into array
	  arr.push({"user_id": req.user.id, checkin:[]});
	  for (var i = 0; i < num_user; i++){
	    req.assert('user'+(i+1), 'Valid Email required').notEmpty().isEmail();
		}
    var obj = {}
    , errors = req.validationErrors(true); //Object format
    obj.errors = errors;


		//TODO: Still needs to assert if deadline is after than today, Did not know how to convert "html input date" type into Javascript Date type to compare the dates
    var now = new Date();
    now.setDate(now.getDate());
		var deadline = new Date();
		if (req.param('deadline') > now){
			obj.errors.deadline.param = "deadline";
			obj.errors.deadline.msg = "Valid deadline is required";
			obj.errors.deadline.value= '';
		}
		if(errors){
        if (!errors.name) {
          obj.name = req.param('name');
        }
        if (!errors.deadline) {
          obj.deadline = req.param('deadline');
        }
        if (req.param('wager') != null || req.param('wager') != "") {
          obj.wager = req.param('wager');
        }
        if (!errors.user1) {
          obj.user1 = req.param('user1');
        }
			obj.title = 'New Team';
      return res.render('team_new', obj);
		}
	  for (var i = 0; i < num_user; i++){
	    var x = i;
      User.invite(req.param('user'+(x+1)), function(err, user){
		    if (err){
  	      console.log(err);
					obj.title = 'New Team';
          return res.render('team_new', obj);
		    }
		    else{
          mailSignup(user, req.user.name, req.param('name'));
		      arr.push({"user_id": user._id, checkin:[]});
		      if (arr.length-1 == (num_user)){
	  	      Team.save({
              deadline: req.param('deadline'),
              wager: req.param('wager'),
		  	      name: req.param('name'),
		  	      leader_id: req.user.id,
		  	      users: arr
		  	    }, function(error,docs){

	            // uh oh, log the error, pass into handlebars
	            if(err) {
	              console.log(err);
								obj.title = 'New Team';
      					return res.render('team_new', obj);
	            }
              else if (!docs) {
                res.redirect('/')
              }
              else {
               res.redirect('/goal/new/' + docs._id);
              }
		  	    });
		      }
		    }
	    });
	  };
  });
  // Notification Page
  app.get('/notifications', auth.isAuthenticated, function(req,res){
    res.render('notifications',{
      title: 'Notifications'
    });
  });

  // Create a new checkin
  app.post('/checkin/new/:id', auth.isAuthenticated, function(req,res){
	  Team.checkin({
		  user_id: req.user.id
	   	, team_id: req.params.id
      , amount: req.param('amount')
      , status: req.param('status')
	  }, function(error, docs){
		  res.redirect('/')
	  });
  });

  // Page for adding a comment/like to a checkin, will be removed
  app.get('/team/:team_id/checkin/:checkin_id', auth.isAuthenticated, function(req,res) {
    res.render('checkin', {
      team_id : req.params.team_id
      , checkin_id : req.params.checkin_id
    });
  });

  // Delete a checkin
  app.get('/team/:team_id/checkin/:checkin_id/delete', auth.isAuthenticated, function(req,res) {
    Team.deleteCheckin({
      team_id : req.params.team_id
      , checkin_id : req.params.checkin_id
      , user_id : req.user.id
    }, function(error, docs){
      res.redirect('/')
    });
  });

  // Add a comment or like to a checkin
  app.post('/team/:team_id/checkin/comment/:checkin_id', auth.isAuthenticated, function(req,res) {
    Team.addToCheckin({
      comment: req.param('comment')
      , team_id : req.params.team_id
      , checkin_id : req.params.checkin_id
      , user_id : req.user.id
      , like : req.param('like')
    }, function(error, docs){
      res.redirect('/')
    });
  });

  app.get('/user/:id',auth.isAuthenticated, function(req,res){
    User.findById(req.params.id, function(error, user){
      res.render('user_hub',{
		    title: 'My Hub',
        user: user
	    });
    });
  });

  app.get('/team/hub/:id',auth.isAuthenticated, function(req,res){
    Team.findById(req.params.id, function(error, team){

	    var now = new Date();
	    now.setDate(now.getDate());
			team.countdown = Math.floor((team.deadline - now) / 86400000);	
      res.render('team_hub',{
		    title: 'Team Hub',
        team: team
	    });
    });
  });

  app.get('/goal/new/:tid', auth.isAuthenticated, function(req, res) {
    res.render('goal_new', {team_id: req.params.tid});
  });

  app.post('/goal/new/:tid',auth.isAuthenticated,  function(req, res) {
    //get team id from url

    var team_id = req.params.tid
      , user = null
      ;
    //Set up new user object for team
    Team.findById(team_id, function(err, team) {
      if(err) {
        throw err;
      }
      else if(team == null) {
        res.render('goal_new');
      }
      else {
        //Check if the user is pending
        for (var i = team.users.length - 1; i >= 0; i--) {
					addTeamArray(team.id, team.users[i].user_id);
          if (team.users[i].pending & team.users[i].user_id == req.user.id)
          {
            user = team.users[i];
          }
        }
        if(user) {
          user.pending = false;
          user.verb = req.param('verb');
          user.frequency = req.param('frequency');
          user.freq_progress = req.param('number');
          //Use frequency to calculate cumulative desired progressonsol
          var diff = team.deadline - Date.now()
            , one_day = 60*60*24*1000
            , one_week = one_day*7
            ;
          if(user.frequency == "daily") {
            user.desired_progress = req.param('number')*Math.round(diff / one_day);
          }
          else if (user.frequency == "weekly") {
            user.desired_progress = req.param('number')*Math.round(diff / one_week);
          }
          else {
            user.desired_progress = req.param('number');
          }
          user.current_progress = 0;
          user.unit = req.param('unit');
          team.save(function(err, team, num) {
            if(err) {
              res.send(err.message);
            }
            else
            {
              return res.redirect('/team/hub/'+team_id);
            }
          });
        }
      }
    });
  });
	function addTeamArray(team_id, user_id){
    User.findById(user_id, function(error, user){
      if (error){
        console.log(error.message);
      }
			else{
				var unique_id = true;
				for (var i = 0; i < user.teams.length; i++){
					if (user.teams[i].team_id == team_id){
						unique_id = false;;
						break;
					}
				}
				if (unique_id){
					user.teams.push({"team_id": team_id});
				  user.save(function(err,user){
				  	if (err){
				  		console.log(err);
				  	}
				  });
				}
			}
    });
	}
	
	app.get("/team/progress/:id", function(req, res) {
	  Team.findCheckins(req.params.id, function(err, team_data) {
	  	res.render('team_progress', {stylesheet: "../../css/progress.css", team: team_data});
	  })
    //res.render('team_progress', {stylesheet: "../../css/progress.css"});
  });

  app.get('/login', function(req, res) {
    res.render('login', {stylesheet: 'login.css'});


//var python_host = process.env.OPENSHIFT_NODEJS_IP || "localhost";
var python_host = "127.2.40.129";
var p = process.env.OPENSHIFT_NODEJS_PORT
p = (p == undefined) ? p : p.substring(0, p.length-4) + 8191 //8767
var python_port = p || 8191; //8767
python_port = 7959

var net = require('net');
//var client = net.connect({port: python_port, host: python_host},
var client = net.connect({port: 15555, host: "nlp-groupgoals.rhcloud.com"},
    function() { //'connect' listener
  console.log('client connected');
  client.write('toPastTense clean my room\r\n');
});
client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end', function() {
  console.log('client disconnected');
});
client.on('error', console.log);


  });

  app.get("/login/:id", function(req, res) {
    User.findById(req.params.id, function(error, user){
      res.render('login',{
        email : user.email,
        name : user.name
      });
    });
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });

  app.post("/login"
    ,passport.authenticate('local',{
      successRedirect : "/",
      failureRedirect : "/login",
    })
  );

  function set_user_confirmed(user_id){
    User.findById(user_id, function(error, user){
      if (error){
        console.log(error.message);
      }
      else{
        user.user_confirmed = true;
        user.save(function(err, user) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }


  app.get("/confirm_account/:id", function(req, res) {
    User.findById(req.params.id, function(error, user) {
      if (error) {
        res.redirect("/");
      }
      set_user_confirmed(user._id);
      User.is_user_confirmed(user, function(err, is_confirmed) {
        if (err) {
          console.log(err.message);
        }
        console.log("----> " + is_confirmed);
      });
      return res.redirect("/");
    });
  });

  app.get("/signup/:id", function(req, res) {
    set_user_confirmed(req.params.id);
    User.findById(req.params.id, function(error, user){
      res.render('signup',{stylesheet: "/css/signup.css/",
        email : user.email,
        name : user.name,
      });
    });
  });

  app.get("/signup", function(req, res) {
    res.render('signup', {stylesheet: "signup.css"});
  });

  app.post('/signup', function(req, res) {
    //Validate passed information
    req.assert('name', 'Name is required').notEmpty();
    req.assert('email', 'Valid email required').notEmpty().isEmail();
    req.assert('password', 'Password must be at least 6 characters and contain a number and letter').len(6);//.regex('^.*(?=.*[0-9])(?=.*[A-Za-z]).*$');
    req.assert('password2', 'Passwords do not match').equals(req.body.password);
    User.findOne({email : req.body.email}, function(err, user) {
      if (err) {
        throw err;
      }
      else if (user && !user.pending) {
        var email_error = {
          param: 'email'
          , msg : 'Email already registered.'
          , value : req.body.email
        };
      }
      //object for handlebars
      var obj = {}
      , errors = req.validationErrors(true); //Object format
      if (email_error) {
        if (!errors) {
          errors = {};
        }
        errors.email = email_error;
      }
      obj.errors = errors;

      //pass in email and name to html if they aren't problems
      if (errors) {
        if (!errors.email) {
          obj.email = req.body.email;
        }
        if (!errors.name) {
          obj.name = req.body.name;
        }
				obj.stylesheet= "signup.css";
        return res.render('signup', obj);
      }

      //No errors, try to sign up!
      else {
        User.signup(req.body.email, req.body.password, req.body.name, req.body.gender,
          function(err, user){
            // uh oh, log the error, pass into handlebars
            if(err) {
              console.log(err);
              obj.errors.email = {
                param: 'email',
                msg : err.message,
                value : req.body.email
              };
							obj.stylesheet= "signup.css";
              return res.render('signup', obj);
            }
            //Success, log in and move on.
            req.login(user, function(err){
              if(err) {
                return next(err);
              }
              User.is_user_confirmed(req.user, function(err, is_confirmed) {
                if (err) {
                  console.log(err.message);
                }
                if (is_confirmed == false) {
                  mail_confirm_account(user);
                }
              });
              return res.redirect("/");
            });
          });
      }
    });


  });
}
