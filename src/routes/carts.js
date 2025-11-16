const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const controller = require('../controllers/cart.controller');

const router = express.Router();

// All cart routes require authentication
router.use(ensureAuth);

 // Get cart for current user
router.get('/me', controller.getCart);

// // Get cart by cart id
// router.get('/:cid', controller.getCartById);

// // Create or replace cart for current user
// router.post('/', controller.createOrUpdateCart);

// // Add item to current user's cart
// router.post('/items', controller.addItem);

// Add or increment product in a specific cart
router.post('/:cid/product/:pid', controller.addProductToCart);

// Update quantity for a product in a cart
router.put('/:cid/products/:pid', controller.updateCartProductQuantity);

// Remove a product from cart
router.delete('/:cid/products/:pid', controller.removeProductFromCart);

// Replace entire cart products
router.put('/:cid', controller.replaceCartProducts);

// Purchase specific cart by id
router.post('/:cid/purchase', controller.purchaseCart);

// Clear cart for user/cart
router.delete('/:cid', controller.clearCart);

module.exports = router;
