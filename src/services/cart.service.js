const cartRepo = require("../repositories/cart.repository");
const productRepo = require("../repositories/product.repository");
const userRepo = require("../repositories/user.repository");
const orderRepo = require("../repositories/order.repository");

class CartService {
  async createCartForUser(userId, items = []) {
    // validate products exist and normalize items
    const normalized = [];
    for (const it of items) {
      const prod = await productRepo.findById(it.product);
      if (!prod) continue; // skip missing products
      const requested = Math.max(1, parseInt(it.quantity || 1, 10));
      const qty =
        typeof prod.stock === "number"
          ? Math.min(requested, prod.stock)
          : requested;
      normalized.push({ product: prod._id, quantity: qty });
    }
    const cart = await cartRepo.upsertCart(userId, normalized);
    // return populated view
    return this.getCartForUser(userId, true);
  }

  async getCartForUser(userId, populate = false) {
    const cart = await cartRepo.findByUser(userId);
    if (!cart) return null;
    if (!populate) return cart;
    const populated = { ...cart, products: [] };
    for (const it of cart.products || []) {
      const prodId = it.product && it.product._id ? it.product._id : it.product;
      const prod = await productRepo.findById(prodId);
      populated.products.push({
        product: prod || prodId,
        quantity: it.quantity,
      });
    }
    return populated;
  }

  async addItemForUser(userId, productId, quantity = 1) {
    // repository enforces stock limits
    const cart = await cartRepo.addItem(userId, productId, quantity);
    // return populated
    return this.getCartForUser(userId, true);
  }

  async finalizePurchase(userId) {
    const cart = await cartRepo.findByUser(userId);
    if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
      return {
        success: false,
        reason: "Cart is empty",
        purchased: [],
        failed: [],
        total: 0,
        order: null,
      };
    }

    const items = []; // buffer con { prod, requested }
    const failed = [];
    let hasError = false;

    // ---------- PRIMER PASO: validar y preparar ----------
    for (const it of cart.products) {
      const prodId = it.product && it.product._id ? it.product._id : it.product;
      const prod = await productRepo.findById(prodId);
      const requested = Number(it.quantity) || 0;

      if (!prod) {
        hasError = true;
        failed.push({
          product: prodId,
          requested,
          reason: "Product not found",
        });
        continue;
      }

      const available = typeof prod.stock === "number" ? prod.stock : 0;

      if (available < requested) {
        hasError = true;
        failed.push({
          product: prod._id,
          title: prod.title,
          requested,
          available,
          reason: "Insufficient stock",
        });
      }

      // igual lo guardo para posible compra
      items.push({ prod, requested });
    }

    // si algo falló, no compro nada
    if (hasError) {
      return {
        success: false,
        reason: "One or more items do not have enough stock",
        purchased: [],
        failed,
        total: 0,
        order: null,
      };
    }

    // ---------- SEGUNDO PASO: aplicar compra ----------
    const purchased = [];
    let total = 0;

    for (const { prod, requested } of items) {
      const available = typeof prod.stock === "number" ? prod.stock : 0;
      const newStock = available - requested;

      await productRepo.updateById(prod._id, { stock: newStock });

      const unitPrice = prod.price || 0;
      const subtotal = unitPrice * requested;

      purchased.push({
        product: prod._id,
        title: prod.title,
        quantity: requested,
        unitPrice,
        subtotal,
      });

      total += subtotal;
    }

    await cartRepo.clearCart(userId);

    const orderItems = purchased.map((p) => ({
      product: p.product,
      title: p.title,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      subtotal: p.subtotal,
    }));

    const orderData = {
      buyer: userId,
      items: orderItems,
      total,
      status: "completed",
      purchaseDate: new Date(),
    };

    const savedOrder = await orderRepo.create(orderData);

    return {
      success: true,
      purchased,
      failed: [],
      total,
      order: savedOrder,
    };
  }
}

module.exports = new CartService();
