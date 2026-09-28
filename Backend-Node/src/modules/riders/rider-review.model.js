const mongoose = require('mongoose');

// Customer's rating of a rider for a specific delivered order.
const riderReviewSchema = new mongoose.Schema(
  {
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: '' },
  },
  { timestamps: true }
);

// One rider-review per order per user.
riderReviewSchema.index({ order_id: 1, user_id: 1 }, { unique: true });

riderReviewSchema.statics.getAvgForRider = async function (riderId) {
  const result = await this.aggregate([
    { $match: { rider_id: new mongoose.Types.ObjectId(riderId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return result[0] || { average: 0, count: 0 };
};

riderReviewSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('RiderReview', riderReviewSchema);
