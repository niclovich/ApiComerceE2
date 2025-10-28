const passport = require('passport');

/**
 * ensureAuth middleware
 * Verifies JWT (Authorization header or cookie) and populates req.user and res.locals.user
 * If not authenticated responds 401 JSON.
 */
function ensureAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // convert to plain object and normalize fields for templates and APIs
    let u;
    try {
      u = (typeof user.toObject === 'function') ? user.toObject() : JSON.parse(JSON.stringify(user));
    } catch (e) {
      u = user;
    }

    const userPlain = {
      id: u._id || u.id || '',
      first_name: u.first_name ?? u.firstName ?? '',
      last_name : u.last_name  ?? u.lastName  ?? '',
      email     : u.email      ?? '',
      role      : u.role       ?? ''
    };

    req.user = userPlain;
    res.locals.user = userPlain;
    return next();
  })(req, res, next);
}

module.exports = ensureAuth;
