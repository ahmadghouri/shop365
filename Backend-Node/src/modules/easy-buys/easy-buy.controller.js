const EasyBuy = require('./easy-buy.model');
const Product = require('../products/product.model');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    const items = await EasyBuy.find();
    res.json(items);
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const { title, image, payload } = req.body;
    if (!title || !payload) {
      return res.status(422).json({ message: 'Validation failed' });
    }
    const easyBuy = await EasyBuy.create({ title, image, payload: typeof payload === 'string' ? JSON.parse(payload) : payload });
    res.status(201).json({ message: 'EasyBuy and products created successfully', data: easyBuy });
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const item = await EasyBuy.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'EasyBuy item not found' });
    res.json(item);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const easybuy = await EasyBuy.findById(req.params.id);
    if (!easybuy) return res.status(404).json({ message: 'EasyBuy not found' });
    const Cart = require('../cart/cart.model');
    const products = await Product.find({ easy_buy_id: easybuy._id });
    const productIds = products.map(p => p._id);
    await Cart.deleteMany({ product_id: { $in: productIds } });
    await Product.deleteMany({ easy_buy_id: easybuy._id });
    await EasyBuy.findByIdAndDelete(req.params.id);
    const { title, image, payload } = req.body;
    const newEasyBuy = await EasyBuy.create({ title, image, payload: typeof payload === 'string' ? JSON.parse(payload) : payload });
    res.status(201).json({ message: 'EasyBuy and products created successfully', data: newEasyBuy });
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const easybuy = await EasyBuy.findById(req.params.id);
    if (!easybuy) return res.status(404).json({ message: 'EasyBuy not found' });
    await Product.deleteMany({ easy_buy_id: easybuy._id });
    await EasyBuy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Easybuy & Product deleted successfully' });
  } catch (error) { next(error); }
}

async function filters(req, res, next) {
  try {
    const filter = req.body.filter || req.query.filter || 'null';
    let products;
    if (filter === 'null' || filter === 'All') {
      products = await EasyBuy.find();
    } else {
      products = await EasyBuy.find({ title: { $regex: filter, $options: 'i' } });
    }
    if (products.length === 0) {
      res.status(404).json({ message: 'No products found for the given filter' });
    } else {
      res.json({ message: 'Products found', products });
    }
  } catch (error) { next(error); }
}

async function resolveProduct(req, res, next) {
  try {
    const items = req.body.items;
    if (!items || !Array.isArray(items)) {
      return res.status(422).json({ message: 'Validation failed' });
    }
    const allProducts = [];
    for (const item of items) {
      const title = item.title + ' ' + item.name;
      const regularProducts = await Product.find({ type: 'easy_buy', title, price: item.price });
      allProducts.push(...regularProducts);
    }
    if (allProducts.length === 0) {
      res.status(404).json({ message: 'No related product found for the given items' });
    } else {
      res.json({ message: 'Product found', regularProducts: allProducts });
    }
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy, filters, resolveProduct };
