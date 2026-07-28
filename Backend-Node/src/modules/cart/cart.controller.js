const Cart = require('./cart.model');
const { successResponse } = require('../../utils/api-response');

async function addToCart(req, res, next) {
  try {
    const existing = await Cart.findOne({ user_id: req.user._id, product_id: req.body.product_id });
    if (existing) {
      existing.quantity += req.body.quantity;
      await existing.save();
      return successResponse(res, { cart: existing }, 'Item added to cart successfully');
    }
    const cart = await Cart.create({ user_id: req.user._id, ...req.body });
    successResponse(res, { cart }, 'Item added to cart successfully');
  } catch (error) { next(error); }
}

async function viewCart(req, res, next) {
  try {
    const cartItems = await Cart.find({ user_id: req.user._id })
      .populate({ path: 'product_id', populate: { path: 'business_id' } })
      .sort({ createdAt: -1 });
    const total = cartItems.reduce((sum, item) => {
      const p = item.product_id;
      return sum + ((p.final_price || p.price) * item.quantity);
    }, 0);
    successResponse(res, { cartItems, total }, 'Cart retrieved successfully');
  } catch (error) { next(error); }
}

async function removeCart(req, res, next) {
  try {
    await Cart.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    successResponse(res, null, 'Item removed from cart');
  } catch (error) { next(error); }
}

async function removeProduct(req, res, next) {
  try {
    await Cart.deleteMany({ user_id: req.user._id, product_id: req.params.id });
    successResponse(res, null, 'Product removed from cart');
  } catch (error) { next(error); }
}

async function updateQuantity(req, res, next) {
  try {
    const cart = await Cart.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { quantity: req.body.quantity },
      { new: true }
    );
    successResponse(res, { cart }, 'Quantity updated successfully');
  } catch (error) { next(error); }
}

async function getItemCount(req, res, next) {
  try {
    const items = await Cart.find({ user_id: req.user._id });
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ item_count: count });
  } catch (error) { next(error); }
}

module.exports = { addToCart, viewCart, removeCart, removeProduct, updateQuantity, getItemCount };
