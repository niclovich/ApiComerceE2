const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const { config } = require('./index');

const JWT_SECRET = config.jwt_secret;

// Local strategy for login
passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'User not found' });
    const valid = user.comparePassword(password);
    if (!valid) return done(null, false, { message: 'Invalid credentials' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// JWT strategy (supports Authorization header or cookie named 'token')
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req) => (req && req.cookies ? req.cookies.token : null)
  ]),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub).select('-password');
    if (!user) return done(null, false, { message: 'Token not matched' });
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// Nothing to export here; other modules should read values from src/config/index.js
