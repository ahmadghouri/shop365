const mongoose = require('mongoose');

const voucherUsageSchema = new mongoose.Schema({
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

voucherUsageSchema.index({ voucher_id: 1, user_id: 1 });
voucherUsageSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('VoucherUsage', voucherUsageSchema);
