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
  });

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
	findList(teams, callback) returns an array ={users from team1, users from team2, users from team3}
	
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
	
	UserSchema.statics.is_user_confirmed = function(data, callback) {
    console.log(data);
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
