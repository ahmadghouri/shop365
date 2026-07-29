const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  subtitle: { type: String, trim: true, default: '' },
  image: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.virtual('image_url').get(function () {
  if (!this.image) return null;
  return /^https?:\/\//.test(this.image) ? this.image : `/uploads/${this.image}`;
});

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

categorySchema.index({ status: 1, sort_order: 1 });

module.exports = mongoose.model('Category', categorySchema);
