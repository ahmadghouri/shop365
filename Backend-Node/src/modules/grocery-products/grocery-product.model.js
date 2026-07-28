const mongoose = require('mongoose');

const groceryProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  deleted_at: { type: Date },
}, { timestamps: true });

groceryProductSchema.index({ business_id: 1 });
groceryProductSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('GroceryProduct', groceryProductSchema);
