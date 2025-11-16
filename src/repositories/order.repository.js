const Order = require('../models/Order');

class OrderRepository {
  async create(data) {
    const o = new Order(data);
    await o.save();
    return o.toObject();
  }

  async findById(id) {
    return Order.findById(id).lean();
  }

  async listByBuyer(buyerId, filter = {}) {
    return Order.find(Object.assign({ purchaser: buyerId }, filter)).lean();
  }
}

module.exports = new OrderRepository();
