const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const ensureAuth = require('../middleware/ensureAuth');
const router = express.Router();

const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../lib/mailer');

// Login route - issues JWT
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Unauthorized' });

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };

    try {
      const cartRepo = require('../repositories/cart.repository');
      const existing = await cartRepo.findByUser(user._id);
      if (!existing) await cartRepo.createForUser(user._id, []);
    } catch (e) {
      console.error('Failed to ensure cart on login:', e && e.message ? e.message : e);
    }

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

// Request password reset
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ ok: true }); // do not reveal existence

    // generate token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // send email (best-effort)
    try { await mailer.sendPasswordReset(user, token); } catch (e) { console.error('Failed to send password reset email:', e && e.message ? e.message : e); }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Render reset password form
router.get('/reset/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).send('El enlace es inválido o expiró.');
    return res.render('reset', { token, title: 'Restablecer contraseña' });
  } catch (e) { console.error(e); return res.status(500).send('Error'); }
});

// Handle new password submission
router.post('/reset/:token', async (req, res) => {
  try {
    console.log('Password reset request received');
    const token = req.params.token;
    const { password } = req.body || {};
    if (!password) return res.status(400).send('Falta la nueva contraseña');
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).send('El enlace es inválido o expiró.');

    // avoid reusing same password
    const same = user.comparePassword(password);
    if (same) return res.status(400).send('La nueva contraseña no puede ser la misma que la anterior');

    // set new password and clear token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.render('reset-success', { title: 'Contraseña restablecida' });
  } catch (e) { console.error(e); return res.status(500).send('Error'); }
});

module.exports = router;
