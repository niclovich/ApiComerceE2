const BaseDAO = require('./baseDAO');
const Product = require('../models/Product');

// create DAO instance using BaseDAO
const dao = new BaseDAO(Product);

// convenience: find by code
dao.findByCode = function(code) {
  return this.findOne({ code });
};

// create product ensuring unique code
dao.createProduct = async function(data) {
  if (data.code) {
    const existing = await this.findByCode(data.code);
    if (existing) {
      const err = new Error('Code already in use');
      err.code = 'DUPLICATE_CODE';
      throw err;
    }
  }
  return this.create(data);
};

module.exports = dao;
