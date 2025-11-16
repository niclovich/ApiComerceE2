const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], default: [] },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['created', 'completed', 'cancelled'], default: 'created' },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
