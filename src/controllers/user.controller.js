const userService = require('../services/user.service');

async function createUser(req, res) {
  try {
    const result = await userService.createUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    if (err.message && err.message.includes('Email already')) return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const users = await userService.listUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    if (err.message && err.message.includes('not found')) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const ok = await userService.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createUser, listUsers, getUser, updateUser, deleteUser };
