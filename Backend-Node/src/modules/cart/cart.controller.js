const Cart = require('./cart.model');
const Product = require('../products/product.model');
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

    // Group by business for multi-vendor delivery fee + min order
    const groupMap = {};
    for (const item of cartItems) {
      const p = item.product_id;
      if (!p) continue;
      const b = p.business_id;
      const bid = b?._id?.toString() || 'unknown';
      if (!groupMap[bid]) {
        groupMap[bid] = {
          business_id: bid,
          business_name: b?.name || 'Unknown',
          subtotal: 0,
          delivery_fee: b?.delivery_fee ?? 150,
          min_order_price: b?.min_order_price ?? 0,
        };
      }
      const basePrice = item.variant?.price || p.final_price || p.price || 0;
      const extrasTotal = (item.extras || []).reduce((s, e) => s + (e.price || 0), 0);
      groupMap[bid].subtotal += (basePrice + extrasTotal) * item.quantity;
    }

    const groups = Object.values(groupMap).map((g) => ({
      ...g,
      meets_min_order: g.min_order_price === 0 || g.subtotal >= g.min_order_price,
    }));

    const deliveryFee = groups.reduce((sum, g) => sum + g.delivery_fee, 0);

    successResponse(res, { cartItems, total, delivery_fee: deliveryFee, groups }, 'Cart retrieved successfully');
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

async function removeVendorItems(req, res, next) {
  try {
    const productIds = await Product.find({ business_id: req.params.businessId }).distinct('_id');
    await Cart.deleteMany({ user_id: req.user._id, product_id: { $in: productIds } });
    successResponse(res, null, 'Vendor items removed from cart');
  } catch (error) { next(error); }
}

module.exports = { addToCart, viewCart, removeCart, removeProduct, updateQuantity, clearCart, getItemCount, removeVendorItems };
