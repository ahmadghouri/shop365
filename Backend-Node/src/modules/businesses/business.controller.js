const Business = require('./business.model');
const Product = require('../products/product.model');
const Review = require('../reviews/review.model');
const Cart = require('../cart/cart.model');
const User = require('../users/user.model');
const { successResponse } = require('../../utils/api-response');
const { getPaginationParams, paginateResponse } = require('../../utils/pagination');

async function index(req, res, next) {
  try {
    const businesses = await Business.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'business_id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
          reviews_count: { $size: '$reviews' },
          reviews_avg_rating: { $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, { $avg: '$reviews.rating' }, 0] }
        }
      },
      { $project: { reviews: 0, __v: 0 } },
      { $sort: { discount: -1, reviews_count: -1, reviews_avg_rating: -1, createdAt: 1 } }
    ]);
    successResponse(res, businesses, 'All the businesses');
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const data = { ...req.body };
    // Sanitize: empty string/object should be null
    if (!data.parent_id || data.parent_id === '') delete data.parent_id;
    if (!data.image || typeof data.image === 'object') delete data.image;
    const business = await Business.create(data);
    successResponse(res, business, 'Business added successfully');
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const products = await Product.find({ business_id: req.params.id, is_active: true, deleted_at: null });
    const reviewStats = await Review.aggregate([
      { $match: { business_id: business._id } },
      { $group: { _id: null, avg_rating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const businessObj = business.toJSON();
    businessObj.products = products;
    businessObj.reviews_count = reviewStats.length > 0 ? reviewStats[0].count : 0;
    businessObj.reviews_avg_rating = reviewStats.length > 0 ? reviewStats[0].avg_rating : 0;
    successResponse(res, businessObj, 'Business', 201);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const allowed = ['type', 'name', 'opening_time', 'closing_time'];
    allowed.forEach(f => { if (req.body[f] !== undefined) business[f] = req.body[f]; });
    // Handle image - only set if it's a valid string
    if (req.body.image && typeof req.body.image === 'string') business.image = req.body.image;
    // Handle parent_id - only set if valid ObjectId
    if (req.body.parent_id && req.body.parent_id !== '') business.parent_id = req.body.parent_id;
    else if (req.body.parent_id === '' || req.body.parent_id === null) business.parent_id = null;
    await business.save();
    successResponse(res, business, 'Updated');
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    await Product.updateMany({ business_id: business._id }, { deleted_at: new Date() });
    await User.updateMany({ business_id: business._id }, { deleted_at: new Date() });
    await Business.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Deleted Successfully');
  } catch (error) { next(error); }
}

async function getChildBusiness(req, res, next) {
  try {
    const businesses = await Business.find({ parent_id: req.params.businessId });
    successResponse(res, businesses, 'Sub-businesses retrieved successfully');
  } catch (error) { next(error); }
}

async function getBusinessStats(req, res, next) {
  try {
    const businesses = await Business.find();
    successResponse(res, { stats: { totalBusinesses: businesses.length } }, 'Stats retrieved successfully');
  } catch (error) { next(error); }
}

async function getNumber(req, res, next) {
  try {
    const user = await User.findById(req.params.businessId);
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });
    const business = await Business.findById(user.business_id);
    successResponse(res, { business }, 'Business retrieved successfully');
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy, getChildBusiness, getBusinessStats, getNumber };
