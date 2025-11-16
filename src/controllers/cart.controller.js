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
    let who;
    if (req.params.id === 'me') {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      who = req.user && req.user.id;
    } else {
      who = req.params.id || (req.user && req.user.id);
    }
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
    const cart = await cartService.addItemForUser(userId, product, quantity || 1);
    return res.json(toPublicDTO(cart));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function clearCart(req, res) {
  try {
    // support clearing by cart id or by current user
    const cartIdParam = req.params.cid || req.params.id;
    if (!cartIdParam) return res.status(400).json({ error: 'Missing cart id' });
    const cartRepo = require('../repositories/cart.repository');
    let cleared;
    if (cartIdParam === 'me') {
      const userId = req.user && req.user.id; if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      cleared = await cartRepo.clearCart(userId);
    } else {
      // clear by cart document id
      cleared = await cartRepo.updateProductsById(cartIdParam, []);
    }
    return res.json({ ok: true, cart: cleared });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function _ensureCartOwner(cart, reqUser) {
  if (!cart) return false;
  // cart.user may be ObjectId or string
  const owner = cart.user || cart.user?._id;
  return String(owner) === String(reqUser && reqUser.id);
}

async function getCartById(req, res) {
  try {
    const cid = req.params.cid;
    if (!cid) return res.status(400).json({ error: 'Missing cart id' });
    const cart = await cartService.getCartById(cid, true);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (! _ensureCartOwner(cart, req.user)) return res.status(403).json({ error: 'Forbidden' });
    return res.json(toPublicDTO(cart));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function addProductToCart(req, res) {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const qty = req.body && (req.body.quantity || req.body.qty) ? parseInt(req.body.quantity || req.body.qty, 10) : 1;
    if (!cid || !pid) return res.status(400).json({ error: 'Missing cart id or product id' });
    const cart = await cartService.getCartById(cid, false);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (! _ensureCartOwner(cart, req.user)) return res.status(403).json({ error: 'Forbidden' });
    const updated = await cartService.addProductToCart(cid, pid, qty);
    if (!updated) return res.status(500).json({ error: 'Could not add product to cart' });
    return res.json(toPublicDTO(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function removeProductFromCart(req, res) {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    if (!cid || !pid) return res.status(400).json({ error: 'Missing cart id or product id' });
    const cart = await cartService.getCartById(cid, false);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (! _ensureCartOwner(cart, req.user)) return res.status(403).json({ error: 'Forbidden' });
    const updated = await cartService.removeProductFromCart(cid, pid);
    if (!updated) return res.status(500).json({ error: 'Could not remove product' });
    return res.json(toPublicDTO(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function replaceCartProducts(req, res) {
  try {
    const cid = req.params.cid;
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!cid) return res.status(400).json({ error: 'Missing cart id' });
    const cart = await cartService.getCartById(cid, false);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (! _ensureCartOwner(cart, req.user)) return res.status(403).json({ error: 'Forbidden' });
    const updated = await cartService.replaceCartProducts(cid, items);
    if (!updated) return res.status(500).json({ error: 'Could not replace products' });
    return res.json(toPublicDTO(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateCartProductQuantity(req, res) {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body && req.body.quantity !== undefined ? req.body.quantity : null;
    if (!cid || !pid || quantity === null) return res.status(400).json({ error: 'Missing parameters' });
    const cart = await cartService.getCartById(cid, false);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (! _ensureCartOwner(cart, req.user)) return res.status(403).json({ error: 'Forbidden' });
    const updated = await cartService.updateCartProductQuantity(cid, pid, quantity);
    if (!updated) return res.status(500).json({ error: 'Could not update quantity' });
    return res.json(toPublicDTO(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}



async function purchaseCart(req, res) {
  try {
    const cartId = req.params.cid;
    if (!cartId) return res.status(400).json({ error: 'Missing cart id (cid)' });
    const purchaser = req.user && req.user.email;
    if (!purchaser) return res.status(401).json({ error: 'Unauthorized - purchaser email missing' });
    const result = await cartService.purchaseCart(cartId, purchaser);
    if (result && result.error) return res.status(404).json({ error: result.error });
    return res.json({ order: result.order, products_not_processed: result.products_not_processed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createOrUpdateCart,
  getCart,
  addItem,
  clearCart,
  purchaseCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  replaceCartProducts,
  updateCartProductQuantity
};
