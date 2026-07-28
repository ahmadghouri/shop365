const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  code: { type: String, required: true, unique: true, lowercase: true },
  discount_amount: { type: Number, required: true },
  expiry_date: { type: Date },
  is_used: { type: Boolean, default: false },
  min_purchase_amount: { type: Number, default: 0 },
  deleted_at: { type: Date },
}, { timestamps: true });

voucherSchema.index({ business_id: 1 });
voucherSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Voucher', voucherSchema);
