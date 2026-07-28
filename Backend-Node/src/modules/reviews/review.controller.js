const Review = require('./review.model');
const Order = require('../orders/order.model');

async function store(req, res, next) {
  try {
    const { business_id, order_id, rating, comments } = req.body;
    if (!business_id || !order_id || !rating || !comments) {
      return res.status(422).json({ message: 'Validation failed' });
    }
    const user = req.user;
    const existing = await Review.findOne({ order_id, user_id: user._id });
    if (existing) {
      return res.status(422).json({ message: 'You have already reviewed this order.' });
    }
    await Review.create({ user_id: user._id, business_id, order_id, rating, comments });
    res.json({ message: 'Review submitted successfully.' });
  } catch (error) { next(error); }
}

async function index(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 1000;
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments({ business_id: req.params.business_id });
    const reviews = await Review.find({ business_id: req.params.business_id })
      .populate('user_id', 'name phone_no')
      .populate('business_id', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
    res.json({
      reviews: {
        current_page: page,
        data: reviews,
        from: skip + 1,
        last_page: Math.ceil(total / limit),
        per_page: limit,
        to: Math.min(skip + limit, total),
        total,
      }
    });
  } catch (error) { next(error); }
}

async function getReviews(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const reviews = await Review.find({ business_id: businessId })
      .populate('user_id', 'name phone_no')
      .populate('business_id', 'name')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) { next(error); }
}

async function reply(req, res, next) {
  try {
    const review = await Review.findById(req.params.review_id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const business = req.user;
    if (business.business_id && business.business_id.toString() !== review.business_id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to reply to this review' });
    }
    if (review.reply) {
      return res.status(422).json({ message: 'This review has already been replied to' });
    }
    review.reply = req.body.reply;
    await review.save();
    res.json({ message: 'Reply submitted successfully.', review });
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) { next(error); }
}

module.exports = { store, index, getReviews, reply, destroy };
