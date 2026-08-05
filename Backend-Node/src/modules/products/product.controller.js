const mongoose = require('mongoose');
const Product = require('./product.model');
const Business = require('../businesses/business.model');
const Category = require('../categories/category.model');
const User = require('../users/user.model');
const { successResponse } = require('../../utils/api-response');
const { getPaginationParams, paginateResponse } = require('../../utils/pagination');
const { uploadToCloudinary } = require('../../utils/cloudinary-upload');

function normalizeProductOptions(input, label) {
  let options = input;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch (error) {
      return { error: `${label} must be a valid list` };
    }
  }

  if (!Array.isArray(options)) {
    return { error: `${label} must be a valid list` };
  }

  const normalized = [];
  for (const option of options) {
    if (
      !option ||
      typeof option !== 'object' ||
      Array.isArray(option) ||
      typeof option.name !== 'string' ||
      !['string', 'number'].includes(typeof option.price)
    ) {
      return { error: `Every ${label.toLowerCase()} item requires a valid name and price` };
    }

    const name = option.name.trim();
    const hasPrice = typeof option.price === 'number' || option.price.trim() !== '';
    const price = hasPrice ? Number(option.price) : Number.NaN;
    if (!name || !Number.isFinite(price) || price < 0) {
      return { error: `Every ${label.toLowerCase()} item requires a valid name and price` };
    }
    normalized.push({ name, price });
  }

  return { value: normalized };
}

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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(422).json({ status: false, message: 'Invalid product id' });
    }
    const product = await Product.findOne({
      _id: req.params.id,
      deleted_at: null,
      is_active: true,
      status: true,
    }).populate('business_id', 'name image status');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    successResponse(res, product, 'Product details');
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const data = { ...(req.body || {}) };
    delete data._method;
    delete data.business_id;

    for (const [field, label] of [['sizes', 'Sizes'], ['extras', 'Extras']]) {
      if (data[field] === undefined) continue;
      const result = normalizeProductOptions(data[field], label);
      if (result.error) {
        return res.status(422).json({ message: result.error });
      }
      data[field] = result.value;
    }

    if (data.price !== undefined) data.price = Number(data.price);
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'products');
      data.image = result.secure_url;
    }

    Object.assign(product, data);
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

    const filter = { business_id: businessId, deleted_at: null, type: { $ne: 'easy_buy' } };
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
    const type = String(req.body.type || '').trim();
    if (!type) {
      return res.status(422).json({ status: false, message: 'Product type is required' });
    }

    const data = {
      ...req.body,
      type,
      business_id: req.user.business_id,
      price: parseFloat(req.body.price),
    };
    for (const [field, label] of [['sizes', 'Sizes'], ['extras', 'Extras']]) {
      const result = normalizeProductOptions(data[field] ?? [], label);
      if (result.error) {
        return res.status(422).json({ message: result.error });
      }
      data[field] = result.value;
    }
    // Handle image from multer
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'products');
      data.image = result.secure_url;
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

async function categoryProducts(req, res, next) {
  try {
    const { categoryId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(422).json({ status: false, message: 'Invalid category id' });
    }

    const category = await Category.findOne({ _id: categoryId, status: 'active' });
    if (!category) {
      return res.status(404).json({ status: false, message: 'Category not found' });
    }

    const categoryBusinesses = await Business.find({
      status: 'active',
      $or: [
        { category_id: category._id },
        { category_id: null, type: category.name },
      ],
    }).select('_id');
    const categoryBusinessIds = categoryBusinesses.map((business) => business._id);
    const childBusinesses = await Business.find({
      status: 'active',
      parent_id: { $in: categoryBusinessIds },
    }).select('_id');
    const businessIds = [
      ...categoryBusinessIds,
      ...childBusinesses.map((business) => business._id),
    ];

    const baseFilter = {
      business_id: { $in: businessIds },
      deleted_at: null,
      is_active: true,
      status: true,
      type: { $ne: 'easy_buy' },
    };

    const rawTypes = await Product.distinct('type', baseFilter);
    const types = [...new Set(
      rawTypes
        .map((type) => String(type || '').trim())
        .filter((type) => type && type.toLowerCase() !== 'all')
    )].sort((first, second) => first.localeCompare(second));

    const productFilter = { ...baseFilter };
    const selectedType = String(req.query.type || '').trim();
    if (selectedType && selectedType.toLowerCase() !== 'all') {
      productFilter.type = selectedType;
    }

    const search = String(req.query.search || '').trim();
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      productFilter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { type: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const productDocs = await Product.find(productFilter)
      .populate('business_id', 'name image status')
      .sort({ createdAt: -1 });

    const products = productDocs.map((product) => {
      const item = product.toJSON();
      const image = item.image;
      if (!image) item.image_url = null;
      else if (/^https?:\/\//.test(image)) item.image_url = image;
      else if (image.startsWith('/be/uploads/')) item.image_url = image.replace('/be/uploads/', '/uploads/');
      else if (image.startsWith('/uploads/')) item.image_url = image;
      else item.image_url = `/uploads/${image}`;
      return item;
    });

    successResponse(
      res,
      { types, products },
      'Category products retrieved successfully'
    );
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
  index, store, show, update, destroy, getProducts, categoryProducts,
  businessProducts, businessAdminsProducts, randomProductsByBusiness,
  businessProductsDiscount, businessProductsTypes, businessProductsFiltered,
  updateStatus, addProduct, updateDiscount, removeDiscount, applyDiscountToProduct,
  toggleActive, updateGroceryBusinessId, deleteTodayProductsByBusinessId,
};
