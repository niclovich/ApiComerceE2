const productService = require('../services/product.service');

async function createProduct(req, res) {
  try {
    // attach owner from authenticated user if available
    const payload = Object.assign({}, req.body);
    if (req.user && req.user.id) payload.owner = req.user.id;
    const result = await productService.createProduct(payload);
    return res.status(201).json(result);
  } catch (err) {
    if (err.message && err.message.includes('Code already')) return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}

async function listProducts(req, res) {
  try {
    const user = req.user || null;

    const prods = await productService.listProducts({}, { user });

    return res.json(prods);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
async function getProduct(req, res) {
  try {
    const prod = await productService.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    return res.json(prod);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    if (err.message && err.message.includes('not found')) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const ok = await productService.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createProduct, listProducts, getProduct, updateProduct, deleteProduct };
