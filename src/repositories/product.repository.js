const Product = require('../models/Product');

class ProductRepository {
  async create(data) {
    const p = new Product(data);
    await p.save();
    return p;
  }

  async findByCode(code) {
    return Product.findOne({ code });
  }

  async findAll(filter = {}) {
    // Support optional pagination/sorting via second parameter
    // findAll(filter, options)
    // options: { skip, limit, sort }
    return Product.find(filter).lean();
  }

  async findById(id) {
    return Product.findById(id).lean();
  }

  async updateById(id, updates) {
    const p = await Product.findById(id);
    if (!p) return null;
    Object.assign(p, updates);
    await p.save();
    return p.toObject();
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();
