// for mail
var nodemailer = require('nodemailer');
''
// for node-schedule
var schedule = require('node-schedule');

// view https://www.npmjs.org/package/node-schedule for API
var rule = new schedule.RecurrenceRule();

// script will execute everyday at 8:00 PM
rule.hour = 20;   // 8PM
rule.minute = 0;  // :00 


var j = schedule.scheduleJob(rule, function(){
  reminder_emails();
});

function reminder_emails() {
  Team.findAll(function(err, teams) {
    if (err) {
      console.log("findall from chronjob failed...");
      return;    
    }
    // var that stores which users have received an email today
    ob = [];
  
    for (var i = 0; i < teams.length; i++) {
      // go through ever user, check to see if they checked in today
      users = teams[i].users;
      
      for (var k = 0; k < users.length; k++) {
        
        if (ob.indexOf(users[k].user_id) == -1) {          
          
          // check to see if they checked in today
          checkins = users[k].checkin;

          // there are prior checkins 
          if (checkins.length > 0) {
            most_recent = checkins[checkins.length - 1].created;
            time_now = new Date();
            if (time_now - most_recent > 86400000) {
              // send a reminder email.
              //console.log("email sent for: " + users[k].user_id);
              User.findById(users[k].user_id, function(error, user){     
                if (user.opt_out_emails !== "never"){
                    mailReminder(user);
                }           
              });
              ob.push(users[k].user_id);
            }
          }
          else {
            // no checkins yet
            //console.log("email sent for: " + users[k].user_id);
            User.findById(users[k].user_id, function(error, user){                
                mailReminder(user);
              });            
            ob.push(users[k].user_id);
          }
        }
      }
    }
  });
}


var host;

var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "apppact@gmail.com",
    pass: "cornellpact"
  }
});

function mail_confirm_account(user) {
  link = host + "confirm_account/" + user._id;

  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG
  // console.log is necessary to make our code syncronous
  // Mail experiences some asyncronous functionality if there isn't a console.log
  console.log(user);
  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG

  mailOptions = {
    from: "Achieve ✔ <apppact@gmail.com>",
    to: user.email,
    subject: "Confirm your account for Achieve!",
    text: "Message from Achieve",
    html: user.name + ", thank you for signing up for Achieve! Click the following " +
      "link to confirm your account. If this is not you, please disregard this email. <br/>" + 
      link

  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
     // console.log("Message sent: " + response.message);
    }
  });

}

function forgot_password(user) {
  link = host + "reset_password/" + user._id;

  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG
  // console.log is necessary to make our code syncronous
  // Mail experiences some asyncronous functionality if there isn't a console.log
  console.log(user);
  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG

  mailOptions = {
    from: "Achieve ✔ <apppact@gmail.com>",
    to: user.email,
    subject: "Reset password for Achieve!",
    text: "Message from Achieve",
    html: user.name + ", click the following " +
      "link to reset your password. If this is not you, please disregard this email. <br/>" + 
      link

  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
     // console.log("Message sent: " + response.message);
    }
  });

}



// for faster performance, directly pass in the appropriate email link
function mailSignup(user, leader, groupname) {
	linkSignup = host + "signup/" + user._id;
	if (! user.pending){
		linkSignup = host + "login/" + user._id;
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
    text: "Message from Achieve",
    html: leader + " has signed you up for the Achieve team:" + groupname +
    ". Click the following link to sign up for Achieve: <br/>" + linkSignup
  }
  //TODO: uncomment this out to send email!

  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
     // console.log("Message sent: " + response.message);
		}
  });
}

// for faster performance, directly pass in the appropriate email link
function mailReminder(user) {
  linkSignup = host + "login/"

  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG
  // console.log is necessary to make our code syncronous
  // Mail experiences some asyncronous functionality if there isn't a console.log
  console.log(user);
  // NOTE: VERY IMPORTANT. DO NOT REMOVE CONSOLE.LOG

  mailOptions = {
    from: "Achieve ✔ <apppact@gmail.com>",
    to: user.email,
    subject: "Check In Today for Achieve!",
    text: "Message from Achieve",
    html: "We noticed that you have not checked in for one of the teams you are in."+
    " Click the following link to check in your progress: <br/>" + linkSignup+
    "<br/><br/><br/><br/>"+
    "If you want to opt-out of emails, sign in and go into settings. Then set your reminder status as never"
  };
  //TODO: uncomment this out to send email!


  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
     // console.log("Message sent: " + response.message);
    }
  });

}


function sendMail(){
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
      console.log(error);
    } else {
    //  console.log("Message sent: " + response.message);
    }
  });
}

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , Team = mongoose.model('Team')
  , url = require('url')
  , auth
  ;

module.exports = function(app, passport, debug) {
  auth = require('./auth')(passport);
  host = debug ? 'localhost:8080/' : 'achieve-cornell.rhcloud.com/';
  app.get('/', auth.isAuthenticated, function(req, res) {    
    User.is_user_confirmed(req.user, function(err, is_confirmed) {
      if (err) {
        console.log(err.message);
      }
      if (is_confirmed == false) {
        res.render('account_pending');
      }
    });

    // list pending team requests:
    teams_remaining = [];
    User.findById(req.user.id, function(error, user){
      all_teams = user.teams;
      for (var i = 0; i < all_teams.length; i++) {  // the teams this user is part of
        //console.log(">>> " + i + " " + all_teams[i].team_id);
        Team.findById(all_teams[i].team_id, function(error, team) {
          for (var j = 0; j < team.users.length; j++) { // the users that are part of this team.
            if (team.users[j].user_id == req.user.id) {
              if (team.users[j].pending == true) {
                res.redirect('/goal/new/' + team._id);
                return;
                teams_remaining.push(team._id);
              }
            }
          }
        });
      }
    });
    // gets information about every team that the user is in and all users in those teams
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
            var allcheckins = [];
						for (var i = 0; i < doc_teams.length; i++){
              for (var x = 0; x < doc_teams[i].users.length;x++){
                for (var t =0; t<doc_teams[i].users[x].checkin.length;t++){
                  checkin = JSON.parse(JSON.stringify(doc_teams[i].users[x].checkin[t]));
                  //Changed below from i to x - was causing login errors - Tre'
                  checkin.user_id = doc_teams[i].users[x].user_id;
                  checkin.team_id = doc_teams[i]._id;
                  checkin.user_name = doc_users[i][x].name;
                  checkin.team_name = doc_teams[i].name;
                  checkin.unit = doc_teams[i].users[x].unit;
                  checkin.verb = doc_teams[i].users[x].verb_past;
                  checkin.allcomments = [];
                  for (var k = 0; k < checkin.comments.length; k++) {
                    comment = JSON.parse(JSON.stringify(checkin.comments[k]));
                    for (var j = 0; j < doc_users[i].length; j++) {
                      if(String(doc_users[i][j]._id) === checkin.comments[k].user_id)
                      {
                        comment.name = doc_users[i][j].name;
                      }
                    }
                    checkin.allcomments.push(comment);
                  }
                  checkin.allcomments.reverse();
                  allcheckins.push(checkin);
                }
              }
              var now = new Date();
              //now.setDate(now.getDate() +1);
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
            allcheckins.sort(function(a, b) {
              a = new Date(a.created);
              b = new Date(b.created);
              return a>b ? -1 : a<b ? 1 : 0;
            });
					  res.render('user_newsfeed', {
			        title: "Personalized Newsfeed",
		  		    teams: doc_teams,
						  users: doc_users,
		          user: req.user,
              allcheckins: allcheckins
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
    User.findById(req.user.id, function(error, user){
      res.render('team_new',{
		    title: 'New Team',
        user: user,
        stylesheet: "team_new.css"
	    });
    });
  });

  app.post('/team/new', auth.isAuthenticated, function(req,res){
    req.assert('name', 'Name is required').notEmpty();
    req.assert('deadline', 'Valid deadline required').notEmpty();

	  //Checks to see the number of users and loops through the array 
    //and gets inputs based on number of users
	  var num_user = parseInt(req.param('num_user'),10);
	  var arr = [];
	  //adds leader into array
	  arr.push({"user_id": req.user.id, checkin:[]});
	  for (var i = 0; i < num_user; i++){
	     if (req.param('user'+(i+1)) !== '') {
         req.assert('user'+(i+1), 'Valid Email required').isEmail();
       }
		}
    var obj = {}
    , errors = req.validationErrors(true); //Object format
    obj.errors = errors;

		//TODO: Still needs to assert if deadline is after than today, Did not know how to convert
    //"html input date" type into Javascript Date type to compare the dates
    var now = new Date();
    var deadline = new Date(req.param('deadline'));
		if (deadline < now){
      if (obj.errors == null){
        obj.errors = {};
      }
      var deadline_error = {
            param: "deadline"
          , msg : "Deadline must be in the future"
          , value : req.param('deadline')
        };

      obj.errors.deadline = deadline_error;

      console.log(obj);
      console.log(obj.errors);
		}
		if(obj.errors){
      console.log()
        if (!obj.errors.name) {
          obj.name = req.param('name');
        }
        if (!obj.errors.deadline) {
          obj.deadline = req.param('deadline');
        }
        if (req.param('wager') != null || req.param('wager') != "") {
          obj.wager = req.param('wager');
        }
        if (!obj.errors.user1) {
          obj.user1 = req.param('user1');
        }
			obj.title = 'New Team';
      obj.user = req.user;
      return res.render('team_new', obj);
		}


    //remove dupes and blanks from the array
    var arrResult = {};
    var email_array = [];
    for (var i = 0; i < num_user; i++) {
      if (req.param('user'+(i+1)) !== '') {
        arrResult[req.param('user'+(i+1))] = req.param('user'+(i+1));
      }
    }
    var y = 0;    
    for(var item in arrResult) {
        email_array[y++] = arrResult[item];
    }

    if(email_array.length == 0){
        Team.save({
          deadline: req.param('deadline'),
          wager: req.param('wager'),
          name: req.param('name'),
          leader_id: req.user.id,
          users: arr
        }, function(error,docs){

          // uh oh, log the error, pass into handlebars
          if(error) {
            console.log(error);
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
    else{
      for (var i = 0; i < email_array.length; i++){
        var x = i;
        console.log(email_array[i]);
        User.invite(email_array[x], function(err, user){
          if (err){
            console.log(err);
            obj.title = 'New Team';
            return res.render('team_new', obj);
          }
          else{
            mailSignup(user, req.user.name, req.param('name'));
            arr.push({"user_id": user._id, checkin:[]});

            if (arr.length-1 == email_array.length){
              Team.save({
                deadline: req.param('deadline'),
                wager: req.param('wager'),
                name: req.param('name'),
                leader_id: req.user.id,
                users: arr
              }, function(error,docs){

                // uh oh, log the error, pass into handlebars
                if(error) {
                  console.log(error);
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
      }
    }
  });

  // Teams Page
  app.get("/teams/:id", auth.isAuthenticated, function(req, res){
    User.findById(req.params.id, function(error, user){
      Team.findList(user.teams, function(error, team){
        res.render('teams_page',{
          title: 'Teams Page',
          user: user,
          teams: team
        });
      });
    });
  });

  app.get("/user/settings", auth.isAuthenticated, function(req, res){
    User.findById(req.user.id, function(error, user){
      res.render('me_settings',{
        title: 'User Settings',
        user: user,
        stylesheet:"me_settings.css"
      }); 
    });
  });

  app.post("/user/settings", auth.isAuthenticated, function(req, res) {
    var data = {user_id : req.user.id};
    if(req.param('name') != '') {
      data.name = req.param('name');
    }
    if(req.param('email') != '') {
      data.email = req.param('email');
    }
    if(req.param('gender')) {
      data.gender = req.param('gender');
    }
    if(req.param('password') != '') {
      data.password = req.param('password');
    }
    if(req.param('password2') != '') {
      data.password2 = req.param('password');
    }
    if(req.param('never') == "never") {
      data.opt_out_emails = req.param('never');
    }
    else{
      data.opt_out_emails = "daily";
    }
    User.changeProfile(data, function(err, user) {
      res.redirect('/user/settings');
    });
  });

  // Notification Page
  app.get('/notifications/:id', auth.isAuthenticated, function(req,res){

    User.load_from_notifications(req.user.id, 10, function(err, arr){
      // console.log("arr:::::: " + arr);
      User.findById(req.params.id, function(error, user){
        res.render('notifications',{
          title: 'Notifications',
          user: user,
          stylesheet: 'index.css'
          , notifs : arr
          , load_num : 10
        });
      });
    });

  });

  // Notification Page after more notifications are requested
  app.post('/notifications/:id', auth.isAuthenticated, function(req,res){
    load_num = parseInt(req.param('cur_num'),10) + 10;
    console.log("======== " + load_num.toString());    
    User.load_from_notifications(req.user.id, load_num, function(err, arr){
      // console.log("arr:::::: " + arr);
      User.findById(req.params.id, function(error, user){
        res.render('notifications',{
          title: 'Notifications',
          user: user,
          stylesheet: 'index.css'
          , notifs : arr
          , load_num : load_num
        });
      });
    });

  });

  // Create a new checkin
  app.post('/checkin/new/:id', auth.isAuthenticated, function(req,res){
    req.assert('amount', 'Amount is required').notEmpty();
    var obj = {};
    obj.errors = req.validationErrors(true);

    //pass in email and name to html if they aren't problems
    if (obj.errors) {
      Team.checkin({
        user_id: req.user.id
        , team_id: req.params.id
        , amount: 0
        , status: req.param('status')
      }, function(error, docs){
        res.redirect('/')
      });
    }
    else{
  	  Team.checkin({
  		  user_id: req.user.id
  	   	, team_id: req.params.id
        , amount: req.param('amount')
        , status: req.param('status')
  	  }, function(error, docs){
  		  res.redirect('/')
  	  });
    }
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
      //TODO: have the above function return info such as whether it was liked.

      if (!error) {
        User.add_notification({
          comment: req.param('comment')
          , team_id : req.params.team_id
          , checkin_id : req.params.checkin_id
          , user_id : req.user.id
          , like : req.param('like')
          , info : docs
        }, function(error, docs) {

        });
      }
      res.redirect('/')
    });
  });

  app.get('/user/:id',auth.isAuthenticated, function(req,res){
    User.findById(req.params.id, function(err, user){
      if (err){
        console.log(err.message);
      }
      else{
        Team.findList(user.teams,function(err, doc_teams){
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
                var completed_teams = 0;
                var num_checkins = 0;
                now.setDate(now.getDate());
                for (var i = 0; i < doc_teams.length; i++){
                  for (var t = 0; t < doc_teams[i].users.length; t++){
                    if (doc_teams[i].users[t].user_id == req.params.id){
                      num_checkins+= doc_teams[i].users[t].checkin.length;
                    }
                  }
                  //figure out if deadline includes the last day
                  doc_teams[i].countdown = Math.floor((doc_teams[i].deadline - now) / 86400000)
                  if (doc_teams[i].deadline < now){
                    completed_teams +=1;
                    doc_teams[i].has_deadline_passed = true;
                    doc_teams[i].save(function(err, team, num) {
                      if(err) {
                        res.send(err.message);
                      }
                    });
                  }
                }
                res.render('user_hub',{
                  title: 'My Hub',
                  user: user,
                  teams: doc_teams,
                  users: doc_users,
                  completed_teams: completed_teams,
                  num_checkins: num_checkins,
                  stylesheet:"user_hub.css"
                });
              }
            });
          }
        });
      }
    });
  });

  app.get('/team/hub/:id',auth.isAuthenticated, function(req,res){
    Team.findById(req.params.id, function(error, team){
      var teamArray = [];
      teamArray.push(team);
      //added user names to checkins -- Brian
      User.findList(teamArray,function(err, doc_users){
        if (err){
            console.log(err.message);
        }
        else{
          var now = new Date();
          team.countdown = Math.floor((team.deadline - now) / 86400000);
          var allcheckins = [];
          for (var i=0;i<team.users.length;i++)
          {
            for (var j=0;j<team.users[i].checkin.length;j++)
            {
              checkin = JSON.parse(JSON.stringify(team.users[i].checkin[j]));
              checkin.user_id = team.users[i].user_id;
              checkin.user_name = doc_users[0][i].name;
              checkin.allcomments = [];
              checkin.team_name = team.name;
              checkin.unit = team.users[i].unit;
              checkin.verb = team.users[i].verb_past;
              for (var k = 0; k < checkin.comments.length; k++) {
                comment = JSON.parse(JSON.stringify(checkin.comments[k]));
                for (var j = 0; j < doc_users[0].length; j++) {
                  if(String(doc_users[0][j]._id) === checkin.comments[k].user_id)
                  {
                    comment.name = doc_users[0][j].name;
                  }
                }
                checkin.allcomments.push(comment);
              }
              checkin.allcomments.reverse();
              allcheckins.push(checkin);
            }
          }
          allcheckins.sort(function(a, b) {
            a = new Date(a.created);
            b = new Date(b.created);
            return a>b ? -1 : a<b ? 1 : 0;
          });
          res.render('team_hub', {
            title: 'Team Hub',
            team: team,
            allcheckins: allcheckins,
            user: req.user
          });
        }
      });
    });
  });

  app.get('/goal/new/:tid', auth.isAuthenticated, function(req, res) {
    res.render('goal_new', {team_id: req.params.tid, user: req.user});
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

          function finishloading() {
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

          //to past tense
          var java_host = process.env.OPENSHIFT_NODEJS_IP || "localhost";
          var java_port = 15157;
          var net = require('net');

          var client = net.connect({port: java_port, host: java_host},
              function() { //'connect' listener
            console.log('client connected');
            client.write('toPastTense;' + req.param('verb') +';' + req.user.gender + ';\r\n');
          });

          client.on('data', function(data) {
            client.end();
            console.log(data.toString());
            var past = data.toString();
            past = past.substring(past.indexOf("]")+2);
            user.verb_past = past;
            console.log("res: " + user.verb_past);
            finishloading();
          });

          client.on('end', function() {
            console.log('client disconnected');
            if (!user.verb_past) user.verb_past = "accomplished part of the goal";
            finishloading();
          });

          client.on('error', function() {
            if (!user.verb_past) user.verb_past = "accomplished part of the goal";
            finishloading();
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
  
  app.get("/team/progress/:id", auth.isAuthenticated, function(req, res) {
	User.findById(req.user.id, function(err,user){
	console.log(user);
  	if (err){
	  	console.log(err.message);
  	}
	
	else{
	  	Team.findCheckins(req.params.id, function(err, checkin_data) {
	  		Team.findById(req.params.id, function(err,team){
	  			var teamArray = [];
	  			teamArray.push(team);
	  			
	  			User.findList(teamArray, function(err, doc_users){
	  				if (err){
		  				console.log(err.message);
	  				}
	  				else{
	  					var allcheckins = [];
	  					for(var i=0; i < team.users.length; i++){
	  					if(doc_users[0][i] != null && doc_users[0][i].pending == false) {
		  						var user = JSON.parse(JSON.stringify(team.users[i]));
			  					user.user_name = doc_users[0][i].name;
			  					user.team_start_date = teamArray[0].created;
			  					user.team_end_date = teamArray[0].deadline;
			  					allcheckins[i] = user;	  	
		  					}				
		  				}
			  			//console.log(req.params.id);
			  			//console.log(team);
              console.log(user);
              console.log(user.id);

				      res.render('team_progress', {
					  		title: "Team Progress",
							stylesheet: "../../css/progress.css", 
							checkins: allcheckins, 
              team: team,
							user: req.user
					    });
	  				}	
	  			});
  			});
		});		  		
	}
	
	});
  });

  app.get('/login', function(req, res) {
    /*
    //If user is on mobile, show the login page
    var ua = req.headers['user-agent'].toLowerCase();
    //Check useragent with regular expressions
    var ios = /ip(hone|od|ad)/.test(ua)||/ip(hone|od|ad)/.test(ua.substr(0,4));
    var android = /android/.test(ua)||/android/.test(ua.substr(0,4));
    var safari = /safari/.test(ua) || /safari/.test(ua.substr(0,4));
    if(ios) {
      //If we are in the app and not mobile safari, render the app
      if (!safari) {*/
        res.render('login', {stylesheet: 'login.css'});
      /*}
      //else redirect to appstore or to the app
      else {
        // If "custom-uri://" is registered the app will launch immediately and your
        // timer won't fire. If it's not set, you'll get an ugly "Cannot Open Page"
        // dialogue prior to the App Store application launching ... some solutions 
        // I thought of included altering the UA, but express/consolidate doesn't like that.
        res.render('redirect');
      }
    }
    if(android) {
      //TODO:
    }
    //Else show the desktop landing page
    else {
      res.render('desktop',{
        title: 'Please use a mobile device!',
        stylesheet: "desktop.css"
      });
    }*/

/*
var python_host = process.env.OPENSHIFT_NODEJS_IP || "localhost";
//var python_host = "127.2.40.129";
//var p = process.env.OPENSHIFT_NODEJS_PORT
var python_port = 15151;

var net = require('net');
var client = net.connect({port: python_port, host: python_host},
//var client = net.connect({port: 15555, host: "nlp-groupgoals.rhcloud.com"},
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
*/
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
      });
      return res.redirect("/");
    });
  });

  app.get("/forgot_password", function(req, res) {
    User.findById(req.params.id, function(error, user){
      res.render('forgot_password',{stylesheet: "/css/signup.css/"
      });
    });
  });

  app.post('/forgot_password', function(req, res) {
    User.findByEmail(req.param('email'), function(error, user){
      if (error === "no user"){
        errors = {};
        errors.email = "Email not found in database";
        return res.render('forgot_password', errors);
      }
      else{
        forgot_password(user);
        return res.redirect("/");
      }
    });
  });

  app.get("/reset_password/:id", function(req, res) {
    set_user_confirmed(req.params.id);
    User.findById(req.params.id, function(error, user){
      res.render('reset_password',{stylesheet: "/css/signup.css/",
        email : user.email,
        name : user.name,
        user_id: user.id
      });
    });
  });

  app.post('/reset_password', function(req, res) {
    req.assert('password', 
      'Password must be at least 6 characters').len(6);
    req.assert('password2', 'Passwords do not match').equals(req.body.password);
    errors = req.validationErrors(true); //Object format
    console.log(errors);
    if (errors) {
      res.render('reset_password/'+ req.param('user_id'),{stylesheet: "/css/signup.css/", errors:errors
      });
    }
    else{
      User.findById(req.param('user_id'), function(err, user) {
        data = {};
        data.password = req.param('password');
        data.user_id = req.param('user_id');
        User.changePassword(data, function(error, user){
          if (error){
            res.render('reset_password/'+ req.param('user_id'),{stylesheet: "/css/signup.css/"
            });
          }
          else{
            return res.redirect("/");
          }
        });
      });
    }
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
    req.assert('name', 'Name is required').notEmpty();
    req.assert('email', 'Valid email required').notEmpty().isEmail();
    req.assert('password', 
      'Password must be at least 6 characters and contain a number and letter').len(6);
      //.regex('^.*(?=.*[0-9])(?=.*[A-Za-z]).*$');
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
