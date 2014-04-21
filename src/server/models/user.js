var mongoose = require('mongoose')
  , UserSchema
  , User
  , bcrypt = require('bcrypt')
  ;

  //Schema
  UserSchema = mongoose.Schema({
    email: {type: String, lowercase: true, index: true, unique: true}
    , name: String
    , gender: String
    , hash: String
    , created: {type: Date, default: Date.now}
    , pending: {type: Boolean, default: false }
    , user_confirmed: {type: Boolean, default: false}  // is account confirmed via email
		, teams: [{
      team_id: String
      }]
    , notifications : [{
        event_id: String
        , info: String
        , seen: {type: Boolean, default: false}
        , event_type: String
    }]
    , num_unread: {type: Number, default: 0}
    /*
        look into chron jobs   "https://www.npmjs.org/package/node-schedule"
        checkins + comments and likes.
        on notification page, when it opens up, 
        all the current notifs should be set as seen. 
        (loop until seen = true)
      */  
  });

  UserSchema.statics.changePassword = function(data, callback) {
    User.findById(data.user_id, function(err,user) {
      if (err) {
        callback(err);
      }
      else {
        if (data.password) {
          bcrypt.genSalt(10, function(err, salt) {
            if (err) {
              callback(err);
            }
            else {
              bcrypt.hash(data.password, salt, function(err, hash) {
                if (err) {
                  callback(err);
                }
                else {
                  user.hash = hash;
                  user.save(function(err,user) {
                    callback(err,user);
                  });
                }
              });
            }
          });
        }
        else {
          user.save(function(err,user) {
            callback(err,user);
          });
        }
      }
    });
  }

  UserSchema.statics.findByEmail = function(email, callback) {
    var self = this;
    self.findOne({email : email}, function(err, u) {
      if (err) {
        return callback(err)
      }
      else if (!u) {
        console.log(err);
        return callback("no user");
      }
      else{
        callback(null, u);
      }
    }) 
  };

  UserSchema.statics.invite = function(email, callback) {
    var self = this;
    self.findOne({email : email}, function(err, u) {
      if (err) {
        return callback(err)
      }
      else if (!u) {
	    self.create({
	      email : email
	      , pending: true
	    }, function(err, user) {
        if (callback) {
	      if(err) {
	        callback(err);
	      }
	      else {
	        callback(null, user);
          }
        }
	    });
      }
	  else{
		callback(null, u);
	  }
    }) 
  };

  /*
   * Function for creating a user in the database
   * TODO: Solve callback hell.
   */
  
  /*
	Return users in an array given an array of teams
	
	teams[]= {team1, team2, team3}
	findList(teams, callback) returns an array = 
      {users from team1, users from team2, users from team3}
	
	*/
  UserSchema.statics.findList = function(teams,callback){
		if (teams.length == 0){
	    callback(null, null);
		}
		user_ids = teams.map(function (team){
			return team.users.map(function(user){
				return user.user_id
			})
		});
		users = [];
		for (var i = 0; i < user_ids.length; i ++){
			(function findUserList(id){
				User.find({_id: {$in: user_ids[id]}},function(err, doc_users){
		      if (err) console.log(err);
		      else{
					  users.push(doc_users);
						if (users.length == user_ids.length){
					    callback(null, users);
						}
				  }
		    });
			})(i);
		}
	};

//TODO check to see that you don't get a notification from yourself.
// get the proper data from docs. 
  UserSchema.statics.add_notification = function (data, callback) {
    info = data.info;
    src_user = info[1];
    user_id = src_user.user_id;
    console.log("THIs:::::  " + user_id);
    User.findById(user_id, function(err, user) {    
      // comment
      if (data.comment != '') 
      {
        user.notifications.push(
          { event_id : data.checkin_id
            , info : data.comment
            , seen : false
            , event_type : "comment"
          }); 
        user.num_unread = user.num_unread + 1;
        user.save();        
      }

      // like
      if (info[0]) 
      {
        user.notifications.push(
          { event_id : data.checkin_id
            , info : "like"
            , seen : false
            , event_type : "like"
          }); 
        user.num_unread = user.num_unread + 1;
        user.save();
      }            
    });
  }


  /*
  Function will 10 most recent conversations, starting from number x.
  For example, if x = 0, then it will load the 10 most recent.
  x = 10: it will load notifications 11 - 20
  total = current num of notifications. For use when new notifs come in

  Returns [total_num_notifs , [notifications] ]
  */
  UserSchema.statics.load_from_notifications = function (data, x, callback) {
    User.findById(data, function(err, user) {
      MAX_DIFF = x;
      // error handling
      if (err) {
        return [-1, []];
      }


      notifications = user.notifications;

      // new start point
      x_new = 0;

      // check to see if there were any new notifications
      // if (total != notifications.length) {
      //   x_new = 0;
      // }

      to_return = [];
      // start_point = notifications.length - 1 - x_new;
      start_point = notifications.length - 1;
      for (var i = start_point; start_point-i < MAX_DIFF && i >= 0; i--) {
        cur = notifications[i];
        to_return.push(cur);

        // check to see if any of these notifications are now seen.
        if (notifications[i].seen == false) {
          notifications[i].seen = true;
          user.num_unread--;
        }
      }

      //save any changes
      user.save();
      
      callback(err, to_return);
      // return to_return;


    });
  }
	
	UserSchema.statics.is_user_confirmed = function(data, callback) {
    User.findById(data._id, function(err, user) {
      // return user.user_confirmed;
      callback(err, user.user_confirmed);
    });
  }

  UserSchema.statics.set_user_confirmed = function(data, bool, callback) {
    var user = User.findById(data.user_id);
    user.user_confirmed = bool;
  }
	
  UserSchema.statics.findAll = function(callback){
	  User.find({}, function (err, users) {
  	    if (err) return handleError(err);
        else callback(null, users);
  	  });
  };

  UserSchema.statics.changeProfile = function(data, callback) {
    User.findById(data.user_id, function(err,user) {
      if (err) {
        callback(err);
      }
      else {
        if(data.email) {
          user.email = data.email;
        }
        if (data.name) {
          user.name = data.name;
        }
        if (data.gender) {
          user.gender = data.gender;
        }
        if (data.password) {
          bcrypt.genSalt(10, function(err, salt) {
            if (err) {
              callback(err);
            }
            else {
              bcrypt.hash(data.password, salt, function(err, hash) {
                if (err) {
                  callback(err);
                }
                else {
                  user.hash = hash;
                  user.save(function(err,user) {
                    callback(err,user);
                  });
                }
              });
            }
          });
        }
        else {
          user.save(function(err,user) {
            callback(err,user);
          });
        }
      }
    });
  }

  UserSchema.statics.signup = function(email, password, name, gender, callback) {
    var self = this;
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return callback(err);
      }
      else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            return callback(err);
          }
          else {
            self.findOne({email : email}, function(err, u) {
              if (err) {
                return callback(err)
              }
              else if (!u) {
                self.create({
                  email : email
                  , name : name
                  , hash: hash
                  , gender : gender
                  , 
                }, function(err, user) {
                  if (err) {
                    return callback(err);
                  }
                  else {
                    return callback(null, user);
                  }
                });
              }
              else if (u.pending) {
                u.name = name;
                u.hash = hash;
                u.gender = gender;
                u.pending = false;
                u.created = new Date();
                u.save(function(err, usr) {
                  if (err) {
                    return callback(err);
                  }
                  else {
                    return callback(null, usr);
                  }
                });
              }
              else {
                return callback(new Error('Email already in use.'));
              }
            });
          }
        });
      }
    });
  };

  var User = mongoose.model('User', UserSchema);
  exports.User = User;
