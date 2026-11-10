const mongoose = require('mongoose');
const { OrderStatus } = require('../../common/enums');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
  total_price: { type: Number, required: true },
  delivery_fee: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  // Who delivers this order:
  //   restaurant — the business's own riders (the business assigns one)
  //   platform   — the open pool of platform riders (business has no riders,
  //                the address is outside its riders' radius, or it sent the
  //                order to the platform manually)
  // Older orders have no value and are treated as platform.
  delivery_mode: { type: String, enum: ['restaurant', 'platform'], default: null },
  // Last time a rider dropped this delivery. While `status` is "pending" the
  // restaurant (and the admin, for platform riders) must decide: cancel the
  // order, assign another rider, or send it to platform riders.
  rider_cancel: {
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
    rider_name: { type: String, default: '' },
    rider_kind: { type: String, enum: ['restaurant', 'platform', null], default: null },
    reason: { type: String, default: '' },
    at: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'resolved', null], default: null },
    // what was decided: cancelled | reassigned | platform
    resolution: { type: String, default: '' },
  },
  // Address the customer chose at checkout.
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
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
