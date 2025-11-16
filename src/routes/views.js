const express = require('express');
const ensureGuest = require('../middleware/ensureGuest');
const ensureAuth = require('../middleware/ensureAuth');

const {renderPanel} = require('../controllers/panel.controller');
const { route } = require('./sessions');
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
module.exports = router;
