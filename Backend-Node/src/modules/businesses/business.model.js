const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  image: { type: String },
  opening_time: { type: String },
  closing_time: { type: String },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
}, { timestamps: true });

businessSchema.virtual('image_url').get(function () {
  return this.image ? `/be/uploads/${this.image}` : null;
});

businessSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

businessSchema.index({ parent_id: 1 });
businessSchema.index({ type: 1 });

module.exports = mongoose.model('Business', businessSchema);
