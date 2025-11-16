const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const controller = require('../controllers/order.controller');

const router = express.Router();

router.use(ensureAuth);

// List orders for authenticated user
router.get('/', controller.listOrders);

// Get specific order
router.get('/:id', controller.getOrder);

module.exports = router;
