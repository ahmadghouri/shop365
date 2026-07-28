const mongoose = require('mongoose');

const easyBuySchema = new mongoose.Schema({
  title: { type: String, required: true },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  image: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

easyBuySchema.virtual('image_url').get(function () {
  return this.image ? `/be/uploads/${this.image}` : null;
});

easyBuySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('EasyBuy', easyBuySchema);
