const mongoose = require('mongoose');
const { OrderStatus } = require('../../common/enums');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  total_price: { type: Number, required: true },
  delivery_fee: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  // When the order is expected to arrive. Set at placement and recalculated on
  // each status transition so the tracking screen can show a real ETA.
  estimated_delivery_at: { type: Date, default: null },
  // When it actually arrived (set once the order reaches "delivered").
  delivered_at: { type: Date, default: null },
  status_history: [{
    status: { type: String },
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

orderSchema.index({ user_id: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Order', orderSchema);
