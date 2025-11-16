const express = require('express');
const passport = require('passport');
const controller = require('../controllers/user.controller');
const router = express.Router();

// Create user (public)
router.post('/', controller.createUser);

// Read all users (protected)
router.get('/', passport.authenticate('jwt', { session: false }), controller.listUsers);

// Read user by id (protected)
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getUser);

// Update user (protected)
router.put('/:id', passport.authenticate('jwt', { session: false }), controller.updateUser);

// Delete user (protected)
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.deleteUser);

module.exports = router;
