const Product = require('./product.model');
const Business = require('../businesses/business.model');
const User = require('../users/user.model');
const { successResponse } = require('../../utils/api-response');
const { getPaginationParams, paginateResponse } = require('../../utils/pagination');

async function index(req, res, next) {
  try {
    const filter = { deleted_at: null };
    if (req.query.business_id) filter.business_id = req.query.business_id;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { type: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter)
      .select('_id title image price business_id is_active')
      .populate('business_id')
      .sort({ createdAt: -1 });
    successResponse(res, products, 'products');
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const business = await Business.findOne({ name: req.body.business });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const product = await Product.create({ ...req.body, business_id: business._id, price: parseFloat(req.body.price) });
    successResponse(res, product, 'Product created');
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    successResponse(res, product, 'Product details');
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    await product.save();
    successResponse(res, product, 'Updated Product');
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Product.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Product deleted successfully');
  } catch (error) { next(error); }
}

async function getProducts(req, res, next) {
  try {
    const businessId = req.user.business_id;
    if (!businessId) {
      return successResponse(res, paginateResponse([], 0, 1, 10), 'Products found');
    }
    const search = req.query.search;
    const perPage = parseInt(req.query.per_page) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * perPage;

    // Include child businesses too
    const Business = require('../businesses/business.model');
    const childBusinesses = await Business.find({ parent_id: businessId }).select('_id');
    const businessIds = [businessId, ...childBusinesses.map(b => b._id)];

    const filter = { business_id: { $in: businessIds }, deleted_at: null, type: { $ne: 'easy_buy' } };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(perPage).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);
    successResponse(res, paginateResponse(products, total, page, perPage), 'Products found');
  } catch (error) { next(error); }
}

async function businessProducts(req, res, next) {
  try {
    const mongoose = require('mongoose');
    const businessId = req.params.businessId;
    let match;
    try {
      match = { business_id: new mongoose.Types.ObjectId(businessId), type: { $ne: 'easy_buy' } };
    } catch (e) {
      match = { business_id: businessId, type: { $ne: 'easy_buy' } };
    }
    const searchTerm = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    if (searchTerm) {
      match.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { type: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    const [products, total, types] = await Promise.all([
      Product.find(match).sort({ discount: -1 }).skip(skip).limit(limit),
      Product.countDocuments(match),
      Product.distinct('type', { business_id: match.business_id, type: { $ne: 'easy_buy' } }),
    ]);
    const User = require('../users/user.model');
    const user = await User.findOne({ business_id: businessId });
    const number = user ? user.phone_no : null;
    successResponse(res, { number, types: types.sort(), products: { current_page: page, data: products, from: skip + 1, last_page: Math.ceil(total / limit), per_page: limit, to: Math.min(skip + limit, total), total } }, 'All the products');
  } catch (error) { next(error); }
}

async function businessAdminsProducts(req, res, next) {
  try {
    const filter = { business_id: req.params.businessId };
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
    const products = await Product.find(filter);
    successResponse(res, products, 'All the products');
  } catch (error) { next(error); }
}

async function randomProductsByBusiness(req, res, next) {
  try {
    const products = await Product.aggregate([
      { $match: { deleted_at: null, is_active: true } },
      { $sample: { size: 100 } },
      { $group: { _id: '$business_id', products: { $push: '$$ROOT' } } },
      { $project: { _id: 1, products: { $slice: ['$products', 3] } } },
    ]);
    successResponse(res, products, 'Three random products from each business');
  } catch (error) { next(error); }
}

async function businessProductsDiscount(req, res, next) {
  try {
    const discount = parseFloat(req.query.discount) || 0;
    const products = await Product.find({ business_id: req.params.businessId });
    const result = products.map(p => {
      const obj = p.toJSON();
      obj.final_price = obj.price - obj.price * (discount / 100);
      return obj;
    });
    successResponse(res, result, 'All the products with discounts applied');
  } catch (error) { next(error); }
}

async function businessProductsTypes(req, res, next) {
  try {
    const types = await Product.distinct('type', { business_id: req.params.businessId, deleted_at: null });
    successResponse(res, { types }, 'Product types retrieved successfully');
  } catch (error) { next(error); }
}

async function businessProductsFiltered(req, res, next) {
  try {
    const filter = { business_id: req.params.businessId, deleted_at: null };
    if (req.body.type) filter.type = req.body.type;
    if (req.body.min_price || req.body.max_price) {
      filter.price = {};
      if (req.body.min_price) filter.price.$gte = parseFloat(req.body.min_price);
      if (req.body.max_price) filter.price.$lte = parseFloat(req.body.max_price);
    }
    const products = await Product.find(filter);
    successResponse(res, { products }, 'Products retrieved successfully');
  } catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.status = req.body.status;
    await product.save();
    successResponse(res, product, 'Product status updated successfully');
  } catch (error) { next(error); }
}

async function addProduct(req, res, next) {
  try {
    const data = { ...req.body, business_id: req.user.business_id, price: parseFloat(req.body.price) };
    // Parse sizes if sent as JSON string (from FormData)
    if (data.sizes && typeof data.sizes === 'string') {
      try { data.sizes = JSON.parse(data.sizes); } catch (e) { data.sizes = []; }
    }
    // Handle image from multer
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.create(data);
    successResponse(res, product, 'Product Created');
  } catch (error) { next(error); }
}

async function updateDiscount(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const discount = req.body.discount;
    await Product.updateMany({ business_id: businessId }, { discount });
    const Business = require('../businesses/business.model');
    await Business.findByIdAndUpdate(businessId, { discount });
    successResponse(res, null, 'Discount updated successfully');
  } catch (error) { next(error); }
}

async function removeDiscount(req, res, next) {
  try {
    const businessId = req.user.business_id;
    await Product.updateMany({ business_id: businessId }, { discount: 0 });
    const Business = require('../businesses/business.model');
    await Business.findByIdAndUpdate(businessId, { discount: 0 });
    res.json({ message: 'Discount removed successfully' });
  } catch (error) { next(error); }
}

async function applyDiscountToProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const discount = req.body.discount;
    const discountType = req.body.discount_type || 'percentage';
    if (discountType === 'percentage' && discount > 100) {
      return res.status(422).json({ message: 'Percentage discount cannot exceed 100%' });
    }
    product.discount = discount;
    product.discount_type = discountType;
    await product.save();
    successResponse(res, product, 'Discount applied to the product');
  } catch (error) { next(error); }
}

async function toggleActive(req, res, next) {
  try {
    const product = await Product.findById(req.params.product);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.is_active = !product.is_active;
    await product.save();
    successResponse(res, product, 'Product active status updated!');
  } catch (error) { next(error); }
}

async function updateGroceryBusinessId(req, res, next) {
  try {
    await Product.updateMany({ business_id: req.body.business_id }, { business_id: req.body.grocery_business_id });
    successResponse(res, null, 'Grocery business ID updated successfully');
  } catch (error) { next(error); }
}

async function deleteTodayProductsByBusinessId(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Product.deleteMany({ business_id: req.params.businessId, createdAt: { $gte: today } });
    successResponse(res, null, 'Products deleted successfully');
  } catch (error) { next(error); }
}

module.exports = {
  index, store, show, update, destroy, getProducts,
  businessProducts, businessAdminsProducts, randomProductsByBusiness,
  businessProductsDiscount, businessProductsTypes, businessProductsFiltered,
  updateStatus, addProduct, updateDiscount, removeDiscount, applyDiscountToProduct,
  toggleActive, updateGroceryBusinessId, deleteTodayProductsByBusinessId,
};
