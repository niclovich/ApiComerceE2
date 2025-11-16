const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartRepository {
  async createForUser(userId, items = []) {
    const cart = new Cart({ user: userId, products: items });
    await cart.save();
    return cart.toObject();
  }

  async findByUser(userId) {
    return Cart.findOne({ user: userId }).lean();
  }

  async upsertCart(userId, items = []) {
    // replace or create
    const updated = await Cart.findOneAndUpdate({ user: userId }, { products: items }, { upsert: true, new: true }).lean();
    return updated;
  }

  async addItem(userId, productId, quantity = 1) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return this.createForUser(userId, [{ product: productId, quantity }]);
    }
    const idx = cart.products.findIndex(p => p.product.toString() === productId.toString());
    if (idx >= 0) {
      cart.products[idx].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    await cart.save();
    return cart.toObject();
  }

  async clearCart(userId) {
    return Cart.findOneAndUpdate({ user: userId }, { products: [] }, { new: true }).lean();
  }

  async listAll(filter = {}) {
    return Cart.find(filter).lean();
  }
}

module.exports = new CartRepository();
