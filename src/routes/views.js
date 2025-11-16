const express = require('express');
const passport = require('passport');
const ensureGuest = require('../middleware/ensureGuest');
const ensureAuth = require('../middleware/ensureAuth');

const productService = require('../services/product.service');
const router = express.Router();

router.get('/', (req, res) => {
  // if middleware in app populated res.locals.user, prefer it
  if (res.locals && res.locals.user) return res.redirect('/panel');
  return res.redirect('/login');
});

router.get('/login', ensureGuest, (req, res) => res.render('login', { title: 'Login' }));

router.get('/register', ensureGuest, (req, res) => res.render('register', { title: 'Registro' }));

router.get('/panel', ensureAuth, async (req, res, next) => {
  try {
    const user = req.user || res.locals.user || null;
    if (!user) return res.redirect('/login');
    // delegate panel-specific listing rules to productListService
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      search: req.query.search,
      sort: req.query.sort
    };
  // include user in options so listProducts can apply role-based visibility
  options.user = user;
  const products = await productService.listProducts({}, options);
    return res.render('panel', { user, products });
  } catch (err) {
    return next(err);
  }
});
// product creation view
router.get('/products/create', ensureAuth, (req, res) => {
  return res.render('products/create', { title: 'Crear producto' });
});

module.exports = router;
