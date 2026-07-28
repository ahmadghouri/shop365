const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  discount: { type: Number, default: 0 },
  discount_type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  status: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  sizes: [{ name: { type: String }, price: { type: Number } }],
  prescription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Perscription' },
  easy_buy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyBuy' },
  deleted_at: { type: Date },
}, { timestamps: true });

productSchema.virtual('image_url').get(function () {
  return this.image ? `/be/uploads/${this.image}` : null;
});

productSchema.virtual('final_price').get(function () {
  if (!this.discount) return this.price;
  if (this.discount_type === 'percentage') {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price - this.discount;
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

productSchema.index({ business_id: 1 });
productSchema.index({ type: 1 });

module.exports = mongoose.model('Product', productSchema);
