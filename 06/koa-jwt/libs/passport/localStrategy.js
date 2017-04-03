const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const User = require('../../models/user');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, (email, password, done) => {
  User.findOne({ email }, (err, user) => {
    if (err) {
      return done(err);
    }

    console.log(user.checkPassword(password.toString()));

    if (!user || !user.checkPassword(password.toString())) {
      return done(err, false, { message: 'User not found or password is invalid' });
    }

    return done(null, user);
  });
}));
