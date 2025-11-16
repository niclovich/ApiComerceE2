const orderRepo = require('../repositories/order.repository');

async function listOrders(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await orderRepo.listByBuyer(userId);
    return res.json(orders || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing order id' });
    const order = await orderRepo.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // ensure buyer is owner
    if (String(order.buyer) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { listOrders, getOrder };
