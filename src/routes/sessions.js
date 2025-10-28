const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const ensureAuth = require('../middleware/ensureAuth');
const router = express.Router();

// Login route - issues JWT
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Unauthorized' });

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };

    const token = jwt.sign(payload, config.jwt_secret, {
      expiresIn: config.jwt_expires_in, // p.ej. '1h'
      issuer: 'api-commerce',
      audience: 'api-clients',
    });

    const toMs = (exp) => {
      if (!exp) return 3600000;
      if (typeof exp === 'number') return exp * 1000;
      if (/^\d+$/.test(exp)) return parseInt(exp, 10) * 1000;
      const v = exp.toLowerCase();
      if (v.endsWith('ms')) return parseInt(v, 10);
      if (v.endsWith('s')) return parseInt(v, 10) * 1000;
      if (v.endsWith('m')) return parseInt(v, 10) * 60 * 1000;
      if (v.endsWith('h')) return parseInt(v, 10) * 60 * 60 * 1000;
      if (v.endsWith('d')) return parseInt(v, 10) * 24 * 60 * 60 * 1000;
      return 3600000;
    };

    const secureFlag =
      process.env.COOKIE_SECURE === 'true' ||
      (process.env.NODE_ENV === 'production' && req.secure);

    res.cookie('token', token, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax', // o 'strict'
      maxAge: toMs(config.jwt_expires_in),
      path: '/',
    });

    // Devuelvo datos para que el front los guarde en memoria/estado.
    return res.json({
      message: 'Login successful',
      token, // si NO querés exponer el token al JS del front, omitilo
      user: { id: user._id, email: user.email, role: user.role },
    });
  })(req, res, next);
});

// Current route - returns user info if token valid
router.get('/current', ensureAuth, (req, res) => {
  // ensureAuth populates req.user (plain object)
  res.json({ user: req.user });
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  // clear token and optional session cookie
  res.clearCookie('token');
  res.clearCookie('session');
  res.json({ ok: true });
});

module.exports = router;
