const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image: { type: String },
  opening_time: { type: String },
  closing_time: { type: String },
  discount: { type: Number, default: 0 },
  minimum_order: { type: Number, default: 0 },
  delivery_fee: { type: Number, default: 0 },
  delivery_time: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  // Where the business is, used to decide which orders its own riders can reach.
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  // How far (km) the business's OWN riders deliver. Orders farther than this go
  // to platform riders. null = no limit (own riders take every order).
  rider_radius_km: { type: Number, default: null },
}, { timestamps: true });

businessSchema.virtual('image_url').get(function () {
  if (!this.image) return null;
  return /^https?:\/\//.test(this.image) ? this.image : `/uploads/${this.image}`;
});

businessSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

businessSchema.index({ parent_id: 1 });
businessSchema.index({ type: 1 });
businessSchema.index({ category_id: 1 });

module.exports = mongoose.model('Business', businessSchema);
