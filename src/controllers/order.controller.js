const orderService = require('../services/order.service');

async function listOrders(req, res) {
  try {
    const purchaser = req.user && req.user.email;
    if (!purchaser) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await orderService.listOrdersForPurchaser(purchaser);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const purchaser = req.user && req.user.email;
    if (!purchaser) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing order id' });
    const result = await orderService.getOrderForPurchaser(id, purchaser);
    if (!result) return res.status(404).json({ error: 'Order not found' });
    if (result && result.forbidden) return res.status(403).json({ error: 'Forbidden' });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { listOrders, getOrder };
