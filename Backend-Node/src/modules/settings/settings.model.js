const mongoose = require('mongoose');

// Singleton document — one row holds global app settings
const settingsSchema = new mongoose.Schema({
  min_order_price: { type: Number, default: 0 },
  delivery_fee: { type: Number, default: 150 },
}, { timestamps: true });

settingsSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Setting', settingsSchema);
