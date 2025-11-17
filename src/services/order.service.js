const orderRepo = require('../repositories/order.repository');

class OrderService {
  /**
   * List orders for a purchaser (by email or id stored in purchaser field)
   */
  async listOrdersForPurchaser(purchaser) {
    if (!purchaser) throw new Error('Missing purchaser');
    const orders = await orderRepo.listByBuyer(purchaser);
    return orders || [];
  }

  /**
   * Get a specific order and ensure the purchaser is the owner
   */
  async getOrderForPurchaser(orderId, purchaser) {
    if (!purchaser) throw new Error('Missing purchaser');
    if (!orderId) return null;
    const order = await orderRepo.findById(orderId);
    if (!order) return null;
    if (String(order.purchaser) !== String(purchaser)) {
      return { forbidden: true };
    }
    return order;
  }
}

module.exports = new OrderService();
