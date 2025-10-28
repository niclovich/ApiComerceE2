class BaseDAO {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = new this.model(data);
    return await doc.save();
  }

  async getById(id, projection = null) {
    return this.model.findById(id, projection).exec();
  }

  async getAll(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options).exec();
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findOne(filter, projection = null) {
    return this.model.findOne(filter, projection).exec();
  }
}

module.exports = BaseDAO;
