const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0, index: true },
  stock: { type: Number, default: 0, min: 0, index: true },
  code: { type: String, unique: true, index: true },
  status: { type: Boolean, default: true, index: true },
  category: { type: String, default: "", index: true },
  thumbnails: { type: [String], default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
}, { timestamps: true });

// Optional: add helper methods if needed later

module.exports = mongoose.model('Product', productSchema);
