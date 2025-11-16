const mongoose = require('mongoose');

// Order model per spec: code, purchase_datetime, amount, purchaser (email)
const orderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  purchaser: { type: String, required: true }
}, { timestamps: true });

// include items purchased in the order
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

orderSchema.add({
  items: { type: [orderItemSchema], default: [] }
});

orderSchema.pre('validate', function(next) {
  if (!this.code) {
    this.code = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
