const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const ensureRole = require('../middleware/ensureRole');
const controller = require('../controllers/product.controller');

const router = express.Router();

// Public: list products
router.get('/', controller.listProducts);

// Public: get product by id
router.get('/:id', controller.getProduct);

// Protected: create product (only vendors)
router.post('/', ensureAuth, ensureRole('vendor'), controller.createProduct);

// Protected: update product (only vendors)
router.put('/:id', ensureAuth, ensureRole('vendor'), controller.updateProduct);

// Protected: delete product (only vendors)
router.delete('/:id', ensureAuth, ensureRole('vendor'), controller.deleteProduct);

module.exports = router;
