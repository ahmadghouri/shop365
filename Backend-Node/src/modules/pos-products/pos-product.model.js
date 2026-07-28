const mongoose = require('mongoose');

const posProductSchema = new mongoose.Schema({
  item_code: { type: String, required: true },
  bar_code: { type: String },
  name: { type: String },
  description: { type: String },
  department: { type: String },
  group: { type: String },
  supplier: { type: String },
  brand: { type: String },
  price: { type: Number, required: true },
  discount_price: { type: Number },
  cost: { type: Number },
  quantity: { type: Number },
  is_available: { type: Boolean, default: true },
  uom: { type: String },
  pack_desc: { type: String },
  image_path: { type: String },
  thumbnail_path: { type: String },
  locno: { type: Number, required: true },
}, { timestamps: true });

posProductSchema.index({ item_code: 1, locno: 1 }, { unique: true });
posProductSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('PosProduct', posProductSchema);
