const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const controller = require('../controllers/cart.controller');

const router = express.Router();

// All cart routes require authentication
router.use(ensureAuth);

// Get cart for current user
router.get('/me', controller.getCart);

// Get cart for a specific user (admin-style)
router.get('/:id', controller.getCart);

// Create or replace cart for current user
router.post('/', controller.createOrUpdateCart);

// Add item to current user's cart
router.post('/items', controller.addItem);

// Clear cart for user
router.delete('/:id', controller.clearCart);

module.exports = router;
