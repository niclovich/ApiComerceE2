const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const controller = require('../controllers/product.controller');

const router = express.Router();

// Public: list products
router.get('/', controller.listProducts);

// Public: get product by id
router.get('/:id', controller.getProduct);

// Protected: create product
router.post('/', ensureAuth, controller.createProduct);

// Protected: update product
router.put('/:id', ensureAuth, controller.updateProduct);

// Protected: delete product
router.delete('/:id', ensureAuth, controller.deleteProduct);

module.exports = router;
