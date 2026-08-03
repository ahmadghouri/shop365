const Cart = require('./cart.model');
const { successResponse } = require('../../utils/api-response');

function extrasKey(extras) {
  return (extras || []).map((e) => e.id).sort().join(',');
}

async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1, variant, extras = [] } = req.body;

    // Find existing cart item with same product + variant + extras combination
    const userCart = await Cart.find({ user_id: req.user._id, product_id });
    const existing = userCart.find((item) => {
      const sameVariant = (item.variant?.id || '') === (variant?.id || '');
      const sameExtras = extrasKey(item.extras) === extrasKey(extras);
      return sameVariant && sameExtras;
    });

    if (existing) {
      existing.quantity += Number(quantity) || 1;
      await existing.save();
      return successResponse(res, { cart: existing }, 'Item added to cart successfully');
    }

    const cart = await Cart.create({
      user_id: req.user._id,
      product_id,
      quantity: Number(quantity) || 1,
      variant: variant || undefined,
      extras: extras || [],
    });
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
      if (!p) return sum;
      const basePrice = item.variant?.price || p.final_price || p.price || 0;
      const extrasTotal = (item.extras || []).reduce((s, e) => s + (e.price || 0), 0);
      return sum + (basePrice + extrasTotal) * item.quantity;
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
      { returnDocument: 'after' }
    );
    successResponse(res, { cart }, 'Quantity updated successfully');
  } catch (error) { next(error); }
}

async function clearCart(req, res, next) {
  try {
    await Cart.deleteMany({ user_id: req.user._id });
    successResponse(res, null, 'Cart cleared');
  } catch (error) { next(error); }
}

async function getItemCount(req, res, next) {
  try {
    const items = await Cart.find({ user_id: req.user._id });
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ item_count: count });
  } catch (error) { next(error); }
}

module.exports = { addToCart, viewCart, removeCart, removeProduct, updateQuantity, clearCart, getItemCount };
