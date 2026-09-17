const mongoose = require('mongoose');

const headerImageSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image_path: { type: String, required: true },
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

headerImageSchema.virtual('image_url').get(function () {
  return `/uploads/${this.image_path}`;
});

headerImageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('HeaderImage', headerImageSchema);
