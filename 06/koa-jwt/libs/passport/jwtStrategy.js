const passport = require('koa-passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('config');
const User = require('../../models/user');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.get('secret')
};

passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
  User.find({ email: payload.email }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (user) {
      done(null, user);
    } else {
      done(null, null);
    }
  });
}));
