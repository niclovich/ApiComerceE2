const BaseDAO = require('./baseDAO');

// Helper to create a BaseDAO instance for a given Mongoose model.
function createDAO(model) {
  return new BaseDAO(model);
}

module.exports = {
  BaseDAO,
  createDAO,
};
