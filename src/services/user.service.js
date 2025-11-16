const userRepo = require('../repositories/user.repository');
const { toPublicDTO, fromRequestBody } = require('../dtos/user.dto');

class UserService {
  async createUser(payload) {
    const data = fromRequestBody(payload);
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new Error('Email already in use');
    const user = await userRepo.create(data);
    return toPublicDTO(user);
  }

  async listUsers() {
    const users = await userRepo.findAll();
    return users.map(u => toPublicDTO(u));
  }

  async getUserById(id) {
    const user = await userRepo.findById(id);
    return toPublicDTO(user);
  }

  async updateUser(id, updates) {
    const updated = await userRepo.updateById(id, updates);
    if (!updated) throw new Error('User not found');
    return updated;
  }

  async deleteUser(id) {
    const deleted = await userRepo.deleteById(id);
    return !!deleted;
  }
}

module.exports = new UserService();
