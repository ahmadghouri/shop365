const PosProduct = require('./pos-product.model');
const posProductService = require('./pos-product.service');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    const query = PosProduct.find();
    if (req.query.locno) {
      query.where('locno', req.query.locno);
    }
    if (req.query.search) {
      query.where('name', { $regex: req.query.search, $options: 'i' });
    }
    if (req.query.sort === 'price_asc') {
      query.sort({ price: 1 });
    } else if (req.query.sort === 'price_desc') {
      query.sort({ price: -1 });
    }
    if (req.query.max_quantity !== undefined && req.query.max_quantity !== null && req.query.max_quantity !== '') {
      query.where('quantity', parseFloat(req.query.max_quantity));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const total = await PosProduct.countDocuments(query._conditions);
    const products = await query.skip(skip).limit(limit);
    res.json({
      current_page: page,
      data: products,
      from: skip + 1,
      last_page: Math.ceil(total / limit),
      per_page: limit,
      to: Math.min(skip + limit, total),
      total,
    });
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const product = await PosProduct.create(req.body);
    successResponse(res, { product }, 'POS product created successfully', 201);
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const product = await PosProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'POS product not found' });
    successResponse(res, { product }, 'POS product retrieved successfully');
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const product = await PosProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, { product }, 'POS product updated successfully');
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    await PosProduct.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'POS product deleted successfully');
  } catch (error) { next(error); }
}

async function importProducts(req, res, next) {
  try {
    const result = await posProductService.syncProducts();
    successResponse(res, result, 'POS products synced successfully');
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy, importProducts };
