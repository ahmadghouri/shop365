const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  reply: { type: String },
}, { timestamps: true });

reviewSchema.index({ business_id: 1 });
reviewSchema.index({ user_id: 1 });

reviewSchema.statics.getAvgReview = async function (businessId) {
  const result = await this.aggregate([
    { $match: { business_id: new mongoose.Types.ObjectId(businessId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return result[0] || { average: 0, count: 0 };
};

reviewSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Review', reviewSchema);
