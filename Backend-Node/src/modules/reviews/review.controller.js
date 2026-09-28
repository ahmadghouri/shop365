const Review = require('./review.model');
const Order = require('../orders/order.model');
const OrderItem = require('../orders/order-item.model');
const RiderReview = require('../riders/rider-review.model');

// The logged-in customer's own reviews (vendor + rider), newest first.
async function myReviews(req, res, next) {
  try {
    const userId = req.user._id;

    const [vendorReviews, riderReviews] = await Promise.all([
      Review.find({ user_id: userId })
        .populate('business_id', 'name image')
        .sort({ createdAt: -1 })
        .lean(),
      RiderReview.find({ user_id: userId })
        .populate('rider_id', 'name image')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // First product image per order, so each review card can show the item.
    const orderIds = [
      ...new Set(
        [...vendorReviews, ...riderReviews].map((r) => r.order_id?.toString()).filter(Boolean)
      ),
    ];
    const items = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate('product_id', 'title image image_url')
      .lean();
    const productImageByOrder = {};
    for (const it of items) {
      const oid = it.order_id?.toString();
      if (!oid || productImageByOrder[oid]) continue; // keep the first item's image
      const p = it.product_id || {};
      productImageByOrder[oid] = p.image_url || p.image || '';
    }

    const productImageFor = (orderId) => productImageByOrder[orderId?.toString()] || '';

    const vendor = vendorReviews.map((r) => ({
      _id: r._id,
      type: 'vendor',
      order_id: r.order_id,
      rating: r.rating,
      comments: r.comments || '',
      reply: r.reply || '',
      createdAt: r.createdAt,
      target_name: r.business_id?.name || 'Vendor',
      target_image: r.business_id?.image || '',
      product_image: productImageFor(r.order_id),
    }));

    const rider = riderReviews.map((r) => ({
      _id: r._id,
      type: 'rider',
      order_id: r.order_id,
      rating: r.rating,
      comments: r.comments || '',
      createdAt: r.createdAt,
      target_name: r.rider_id?.name || 'Rider',
      target_image: r.rider_id?.image || '',
      product_image: productImageFor(r.order_id),
    }));

    // Merge and sort by newest.
    const data = [...vendor, ...rider].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ message: 'My reviews', data });
  } catch (error) {
    next(error);
  }
}

// Customer rates the rider who delivered their order.
async function storeRiderReview(req, res, next) {
  try {
    const { order_id, rating, comments } = req.body;
    if (!order_id || !rating) {
      return res.status(422).json({ message: 'order_id and rating are required' });
    }

    const order = await Order.findById(order_id).select('user_id rider_id status');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (!order.rider_id) {
      return res.status(422).json({ message: 'This order has no rider to review' });
    }

    const existing = await RiderReview.findOne({ order_id, user_id: req.user._id });
    if (existing) {
      return res.status(422).json({ message: 'You have already reviewed this rider.' });
    }

    await RiderReview.create({
      rider_id: order.rider_id,
      user_id: req.user._id,
      order_id,
      rating,
      comments: comments || '',
    });
    res.json({ message: 'Rider review submitted successfully.' });
  } catch (error) {
    next(error);
  }
}

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

module.exports = { store, storeRiderReview, myReviews, index, getReviews, reply, destroy };
