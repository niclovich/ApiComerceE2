const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const router = express.Router();

// Login route - issues JWT
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Unauthorized' });

    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwt_secret, { expiresIn: config.jwt_expires_in });

    // Helper para convertir '1h', '7d', etc. en milisegundos
    const toMs = (exp) => {
      if (!exp) return 3600000;
      if (typeof exp === 'number') return exp * 1000;
      if (/^\d+$/.test(exp)) return parseInt(exp) * 1000;
      const v = exp.toLowerCase();
      if (v.endsWith('ms')) return parseInt(v.slice(0, -2));
      if (v.endsWith('s')) return parseInt(v.slice(0, -1)) * 1000;
      if (v.endsWith('m')) return parseInt(v.slice(0, -1)) * 60 * 1000;
      if (v.endsWith('h')) return parseInt(v.slice(0, -1)) * 60 * 60 * 1000;
      if (v.endsWith('d')) return parseInt(v.slice(0, -1)) * 24 * 60 * 60 * 1000;
      return 3600000;
    };

    const secureFlag =
      process.env.COOKIE_SECURE === 'true' ||
      (process.env.NODE_ENV === 'production' && req.secure);

    // Cookie httpOnly para el token (el frontend no puede acceder)
      res.cookie('token', token, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: 'lax',
        maxAge: toMs(config.jwt_expires_in),
      });

        // Cookie accesible desde el frontend con la información del usuario
        res.cookie('session', JSON.stringify({
          id: user._id,
          email: user.email,
          role: user.role
        }), {
          httpOnly: false,
          secure: secureFlag,
          sameSite: 'lax',
          maxAge: toMs(config.jwt_expires_in),
        });

    // También devolvemos el token por conveniencia
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  })(req, res, next);
});

// Current route - returns user info if token valid
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  // req.user comes from jwt strategy and does not include password
  res.json({ user: req.user });
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
