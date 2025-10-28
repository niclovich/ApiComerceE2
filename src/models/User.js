const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' }
}, { timestamps: true });

// Hash password before save if modified
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  try {
    const hash = bcrypt.hashSync(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compareSync(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
