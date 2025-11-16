const User = require('../models/User');

class UserRepository {
  async create(data) {
    const user = new User(data);
    await user.save();
    return user;
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findAll() {
    return User.find().select('-password');
  }

  async findById(id) {
    return User.findById(id).select('-password');
  }

  async updateById(id, updates) {
    const user = await User.findById(id);
    if (!user) return null;
    Object.assign(user, updates);
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
