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

  async findById(id) {
    return Cart.findById(id).lean();
  }

  async upsertCart(userId, items = []) {
    // replace or create
    const updated = await Cart.findOneAndUpdate({ user: userId }, { products: items }, { upsert: true, new: true }).lean();
    return updated;
  }

  async addItem(userId, productId, quantity = 1) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      // ensure not exceed stock on create
      const prod = await Product.findById(productId).lean();
      const qty = prod && typeof prod.stock === 'number' ? Math.min(quantity, prod.stock) : quantity;
      return this.createForUser(userId, [{ product: productId, quantity: qty }]);
    }
    const idx = cart.products.findIndex(p => p.product.toString() === productId.toString());
    if (idx >= 0) {
      // enforce stock limit
      const prod = await Product.findById(productId).lean();
      const stock = prod && typeof prod.stock === 'number' ? prod.stock : null;
      const newQty = cart.products[idx].quantity + quantity;
      cart.products[idx].quantity = stock !== null ? Math.min(newQty, stock) : newQty;
    } else {
      // enforce stock when adding
      const prod = await Product.findById(productId).lean();
      const qty = prod && typeof prod.stock === 'number' ? Math.min(quantity, prod.stock) : quantity;
      cart.products.push({ product: productId, quantity: qty });
    }
    await cart.save();
    return cart.toObject();
  }

  async clearCart(userId) {
    return Cart.findOneAndUpdate({ user: userId }, { products: [] }, { new: true }).lean();
  }

  async updateProductsById(cartId, items = []) {
    return Cart.findByIdAndUpdate(cartId, { products: items }, { new: true }).lean();
  }

  async addItemToCartById(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    const idx = cart.products.findIndex(p => String(p.product) === String(productId));
    if (idx >= 0) {
      const prod = await Product.findById(productId).lean();
      const stock = prod && typeof prod.stock === 'number' ? prod.stock : null;
      const newQty = cart.products[idx].quantity + quantity;
      cart.products[idx].quantity = stock !== null ? Math.min(newQty, stock) : newQty;
    } else {
      const prod = await Product.findById(productId).lean();
      const qty = prod && typeof prod.stock === 'number' ? Math.min(quantity, prod.stock) : quantity;
      cart.products.push({ product: productId, quantity: qty });
    }
    await cart.save();
    return cart.toObject();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    cart.products = cart.products.filter(p => String(p.product) !== String(productId));
    await cart.save();
    return cart.toObject();
  }

  async replaceProducts(cartId, items = []) {
    return Cart.findByIdAndUpdate(cartId, { products: items }, { new: true }).lean();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    const idx = cart.products.findIndex(p => String(p.product) === String(productId));
    if (idx === -1) return null;
    cart.products[idx].quantity = quantity;
    await cart.save();
    return cart.toObject();
  }

  async listAll(filter = {}) {
    return Cart.find(filter).lean();
  }
}

module.exports = new CartRepository();
