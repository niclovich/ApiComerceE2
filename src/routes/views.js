const express = require('express');
const passport = require('passport');
const ensureGuest = require('../middleware/ensureGuest');
const ensureAuth = require('../middleware/ensureAuth');

const router = express.Router();

router.get('/', (req, res) => {
  // if middleware in app populated res.locals.user, prefer it
  if (res.locals && res.locals.user) return res.redirect('/panel');
  return res.redirect('/login');
});

router.get('/login', ensureGuest, (req, res) => res.render('login', { title: 'Login' }));

router.get('/register', ensureGuest, (req, res) => res.render('register', { title: 'Registro' }));

router.get('/panel', ensureAuth, (req, res) => {
  const user = req.user || res.locals.user || null;
  if (!user) return res.redirect('/login');
  return res.render('panel', { user });
});

module.exports = router;
