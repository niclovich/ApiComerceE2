const express = require('express');
const passport = require('passport');

const router = express.Router();


router.get('/', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) return res.redirect('/panel');
    return res.redirect('/login');
  })(req, res, next);
});

router.get('/login', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) return res.redirect('/panel');
    return res.render('login', { title: 'Login' });
  })(req, res, next);
});

router.get('/register', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) return res.redirect('/panel');
    return res.render('register', { title: 'Registro' });
  })(req, res, next);
});

router.get('/panel', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');

    // convierte documento/instancia a POJO
    const u = user?.toObject?.({ getters:true, virtuals:true })
          ?? user?.toJSON?.()
          ?? JSON.parse(JSON.stringify(user));

    // normaliza nombres por si tu modelo usa firstName/lastName
    const userPlain = {
      first_name: u.first_name ?? u.firstName ?? '',
      last_name : u.last_name  ?? u.lastName  ?? '',
      email     : u.email      ?? '',
      role      : u.role       ?? ''
    };

    return res.render('panel', { user: userPlain });
  })(req, res, next);
});


module.exports = router;
