const passport = require('passport');


function ensureGuest(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) return res.redirect('/panel');
    return next();
  })(req, res, next);
}

module.exports = ensureGuest;
