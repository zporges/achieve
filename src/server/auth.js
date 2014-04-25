var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , User = mongoose.model('User')
  , bcrypt = require('bcrypt')
  ;

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    { usernameField : "email",
      passwordField : "password"
    },
    function(email,pwd,done) {
    User.findOne({email : email}, function(err,user) {
      console.log("Finding");
      if(err) {
        return done(err);
      }
      else if (!user) {
        console.log("Incorrect email");
        return done(null, false, {message : "Incorrect password or e-mail." });
      }
      else if (user.pending) {
        console.log("Account has not been created yet");
        return done(null, false, {message : "Pending account. Need to sign up" });
      }
      else {
        bcrypt.compare(pwd, user.hash, function(err, res) {
          if (err) {
            return done(err);
          }
          else if (res) {
            console.log("Successful login");
            return done(null, user);
          }
          else {
            console.log("Incorrect password");
            return done(null, false, {message : "Incorrect password or e-mail"});
          }
        });
      }
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null,user.id);
  });

  passport.deserializeUser(function(id,done) {
    User.findById(id, function(err,user) {
      if (err) {
        done(err)
      }
      else {
        done(null,user)
      }
    });
  });

  var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    }
    else {
      res.redirect("/login");
    }
  }
  , userExists = function(req, res, next) {
    User.count({ email : req.body.email }, function(err,count) {
      if (err) {
        throw err;
      }
      else if (count === 0) {
        next();
      }
      else {
        res.redirect('/signup', {error : 'email already in use'});
      }
    });
  }
  ;

  return {
    isAuthenticated : isAuthenticated
    , userExists : userExists
  }
}