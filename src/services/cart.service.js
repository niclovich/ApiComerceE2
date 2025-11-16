const cartRepo = require('../repositories/cart.repository');
const productRepo = require('../repositories/product.repository');
const userRepo = require('../repositories/user.repository');

class CartService {
  async createCartForUser(userId, items = []) {
    // validate products exist and normalize items
    const normalized = [];
    for (const it of items) {
      const prod = await productRepo.findById(it.product);
      if (!prod) continue; // skip missing products
      normalized.push({ product: prod._id, quantity: Math.max(1, parseInt(it.quantity || 1, 10)) });
    }
    return cartRepo.upsertCart(userId, normalized);
  }


}

module.exports = new CartService();
