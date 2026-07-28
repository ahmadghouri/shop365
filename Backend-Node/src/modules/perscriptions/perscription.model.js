const mongoose = require('mongoose');
const { PrescriptionStatus } = require('../../common/enums');

const perscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  image_url: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: Object.values(PrescriptionStatus), default: PrescriptionStatus.PENDING },
}, { timestamps: true });

perscriptionSchema.virtual('full_image_url').get(function () {
  return `/be/uploads/${this.image_url}`;
});

perscriptionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Perscription', perscriptionSchema);
