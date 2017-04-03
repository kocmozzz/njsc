const passport = require('koa-passport');

require('./localStrategy');
require('./jwtStrategy');

module.exports = passport;
