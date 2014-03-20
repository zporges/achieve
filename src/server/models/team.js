var mongoose = require('mongoose')
  , TeamSchema
  , Team
  , bcrypt = require('bcrypt')
  , User = mongoose.model('User')
  ;

  // Utility Functions
  var findUserById = function(arr, id) {
    for (var i = 0; i < arr.length; i++)
    {
      if(arr[i].user_id = id)
      {
        return arr[i];
      }
    }
  }

  var findCheckin = function(team, id) {
    for (var i = 0; i < team.users.length; i++)
    {
      for (var j = 0; j < team.users[i].checkin.length; j++)
      {
        if (team.users[i].checkin[j]._id == id)
        {
          return team.users[i].checkin[j];
        }
      }
    }
  }

  var isUserInArray = function(arr, id) {
    for (var i = 0; i < arr.length; i++)
    {
      if (arr[i].user_id == id)
      {
        return true;
      }
    }
    return false;
  }

  var indexOfCheckin = function(arr, id) {
    for (var i = 0; i < arr.length; i++)
    {
      if (arr[i]._id == id)
      {
        return i;
      }
    }
    return -1;
  }

  //Schema
  TeamSchema = mongoose.Schema({
    name: String
    , created: {type: Date, default: Date.now}
    , leader_id: String
    , deadline: Date
    , wager: String
    , has_deadline_passed: {type: Boolean, default: false}
    , users: [{
      user_id: String
      , verb: String
      , verb_past: String
      , frequency: String
      , freq_progess: Number
      , current_progress: Number
      , desired_progress: Number
      , pending: {type: Boolean, default: true}
      , unit: String
      , checkin: [{
        created: {type: Date, default: Date.now}
        , amount: Number
        , status: String
        , comments: [{text: String, user_id: String, created: {type: Date, default: Date.now}}]
        , likes: [{user_id: String, created: {type: Date, default: Date.now}}]
      }]

    }]
  });
  
  TeamSchema.statics.findAll = function(callback){
    Team.find({}, function (err, teams) {
        if (err) return handleError(err);
        else callback(null, teams);
      });
  };
  
  TeamSchema.statics.findList = function(team_ids,callback){
		team_ids = team_ids.map(function(id) {return id.team_id; });
		Team.find({_id: {$in: team_ids}},function(err, teams){
      if (err) return handleError(err);
      else callback(null, teams);
    });
	};
	
  TeamSchema.statics.save = function(data, callback) {
    var formatted_data;
    Team = mongoose.model('Team', TeamSchema);
    if (typeof(data.length)=="undefined") {
      formatted_data = data;
    }
    else {
      for ( var i =0;i< teams.length;i++ ) {
        formatted_data = data[i];
      } 
    }
    var team = new Team (formatted_data);
    team.save(function (err) {
      if (err){ console.log(err); return handleError(err);}
      Team.findById(team, function (err, doc) {
        if (err) return handleError(err);
        else callback(null, doc);
      });
    });
  };

  TeamSchema.statics.addPersonalGoal = function(data, callback){
    var t = Team.findById(data.team_id);
  }

  TeamSchema.statics.checkin = function(data, callback) {
    // Find the team, user and then the checkin array
    Team.findById(data.team_id, function(err, team) {
      user = findUserById(team.users, data.user_id);
      user.checkin.push({'amount' : data.amount, 'status' : data.status});
      user.current_progress += parseFloat(data.amount);
      team.save();
      callback(err, team);
    })  
      
    // Add a new checkin with the posted information
  }

  // Adds a comment and/or like to a checkin
  TeamSchema.statics.addToCheckin = function(data, callback) {
    Team.findById(data.team_id, function(err, team) {
      if(err) callback(err);
      checkin = findCheckin(team, data.checkin_id);
      // Add the comment if it exists
      if (data.comment != '')
      {
        checkin.comments.push({'text' : data.comment, 'user_id' : data.user_id});
      }
      // Add the like if it exists and the user hasn't liked it yet
      if (data.like && !isUserInArray(checkin.likes, data.user_id))
      {
        checkin.likes.push({ 'user_id' : data.user_id });
      }
      team.save();
      callback(err, team);
    });
  }

  TeamSchema.statics.deleteCheckin = function(data, callback) {
    Team.findById(data.team_id, function(err, team) {
      if(err) callback(err);
      var user = findUserById(team.users, data.user_id),
      index = indexOfCheckin(user.checkin, data.checkin_id);
			user.current_progress -= parseFloat(user.checkin[index].amount);
      if (index != -1)
      {
        user.checkin.splice(index, 1);
       // console.log(user.checkin.length);
      }
      team.save();
      callback(err, team);
    });
  }

  /**
   * Takes a given team id and returns an array of the form
   * [{name: "Joe", checkins: [] }]
   */

  TeamSchema.statics.findCheckins = function(team_id, callback) {
    Team.findById(team_id, function(err, team) {
      if (err)
      {
        callback(err,null);
      }
      else
      {
      	callback(err, team)
      }
    });
  }


  TeamSchema.statics.allRecentCheckins = function(user_id) {
    User.findById(user_id, function(user, err) {
      if (err) return err;
      for (i = 0; i++; i < user.teams.length)
      {

      }

    });
    
  }
  
  var Team = mongoose.model('Team', TeamSchema);
  exports.Team = Team;
