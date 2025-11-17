const express = require('express');
const ensureGuest = require('../middleware/ensureGuest');
const ensureAuth = require('../middleware/ensureAuth');

const {renderPanel} = require('../controllers/panel.controller');
const { route } = require('./sessions');
const User = require('../models/User');
const router = express.Router();

router.get('/', (req, res) => {
  // if middleware in app populated res.locals.user, prefer it
  if (res.locals && res.locals.user) return res.redirect('/panel');
  return res.redirect('/login');
});

router.get('/login', ensureGuest, (req, res) => res.render('login', { title: 'Login' }));

router.get('/register', ensureGuest, (req, res) => res.render('register', { title: 'Registro' }));

router.get('/panel', ensureAuth, renderPanel);
// product creation view
router.get('/products/create', ensureAuth, (req, res) => {
  return res.render('products/create', { title: 'Crear producto' });
});

router.get('/cart', ensureAuth, (req, res) => {
  return res.render('cart', { title: 'Carrito de compras' });
});

router.get('/checkout', ensureAuth, (req, res) => {
  return res.render('checkout', { title: 'Checkout' });
});
// Orders views
router.get('/orders', ensureAuth, (req, res) => {
  return res.render('orders', { title: 'Mis órdenes' });
});

router.get('/orders/:id', ensureAuth, (req, res) => {
  return res.render('order', { title: 'Orden' });
});

// Password reset request view
router.get('/forgot', ensureGuest, (req, res) => {
  return res.render('forgot', { title: 'Restablecer contraseña' });
});

// Redirect bare /reset (no token) to /forgot so user doesn't see an empty form
router.get('/reset', ensureGuest, (req, res) => {
  return res.redirect('/forgot');
});

// Render reset form when user clicks link in email (root path /reset/:token)
router.get('/reset/:token', ensureGuest, async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) {
      return res.render('reset', { invalid: true, title: 'Enlace inválido o expirado' });
    }
    return res.render('reset', { token, title: 'Restablecer contraseña' });
  } catch (e) {
    console.error('Error rendering reset view:', e && e.message ? e.message : e);
    return res.status(500).send('Error interno');
  }
});
module.exports = router;
