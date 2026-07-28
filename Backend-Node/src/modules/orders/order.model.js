const mongoose = require('mongoose');
const { OrderStatus } = require('../../common/enums');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_price: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
}, { timestamps: true });

orderSchema.index({ user_id: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Order', orderSchema);
