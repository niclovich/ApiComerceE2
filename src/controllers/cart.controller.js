const cartService = require('../services/cart.service');
const { toPublicDTO, fromRequestBody } = require('../dtos/cart.dto');

async function createOrUpdateCart(req, res) {
  try {
    const body = fromRequestBody(req.body);
    const userId = req.user && req.user.id ? req.user.id : body.user;
    if (!userId) return res.status(400).json({ error: 'Missing user id' });
    const cart = await cartService.createCartForUser(userId, body.items);
    return res.status(201).json(toPublicDTO(cart));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getCart(req, res) {
  try {
    const who = req.params.id === 'me' ? (req.user && req.user.id) : req.params.id;
    if (!who) return res.status(400).json({ error: 'Missing user id' });
    const cart = await cartService.getCartForUser(who, true);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    return res.json(toPublicDTO(cart));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function addItem(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { product, quantity } = req.body;
    if (!product) return res.status(400).json({ error: 'Missing product id' });
    const cart = await cartService.createCartForUser(userId, [{ product, quantity }]);
    return res.json(toPublicDTO(cart));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const userId = req.params.id === 'me' ? (req.user && req.user.id) : req.params.id;
    if (!userId) return res.status(400).json({ error: 'Missing user id' });
    const cleared = await require('../repositories/cart.repository').clearCart(userId);
    return res.json({ ok: true, cart: cleared });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrUpdateCart, getCart, addItem, clearCart };
