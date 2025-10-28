const express = require('express');
const User = require('../models/User');
const passport = require('passport');

const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const user = new User({ first_name, last_name, email, age, password, cart, role });
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all users (protected)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read user by id (protected)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (protected)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updates = { ...req.body };
    // If password present, it will be hashed by pre-save hook when using save()
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, updates);
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (protected)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
