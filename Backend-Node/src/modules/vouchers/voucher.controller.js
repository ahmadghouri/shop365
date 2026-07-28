const Voucher = require('./voucher.model');
const Cart = require('../cart/cart.model');
const Order = require('../orders/order.model');
const { successResponse } = require('../../utils/api-response');

async function store(req, res, next) {
  try {
    const voucher = await Voucher.create(req.body);
    successResponse(res, voucher, 'Voucher created successfully');
  } catch (error) { next(error); }
}

async function applyVoucher(req, res, next) {
  try {
    const voucherCode = (req.body.voucher_code || '').toLowerCase();
    const voucher = await Voucher.findOne({ code: voucherCode });
    if (!voucher) return res.status(400).json({ message: 'Invalid voucher code' });
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Voucher has expired' });
    }
    const user = req.user;
    const voucherUsed = await Order.findOne({ user_id: user._id, voucher_id: voucher._id });
    if (voucherUsed) return res.status(400).json({ message: 'Voucher already used' });
    const cartItems = await Cart.find({ user_id: user._id }).populate({ path: 'product_id' });
    if (!cartItems.length) return res.status(400).json({ message: 'Your cart is empty' });
    const activeProducts = cartItems.filter(i => i.product_id && i.product_id.status === 1);
    const inactiveProducts = cartItems.filter(i => i.product_id && (i.product_id.status === 0 || i.product_id.status === false));
    const totalActivePrice = activeProducts.reduce((sum, i) => sum + ((i.product_id.final_price || i.product_id.price) * i.quantity), 0);
    const totalInActivePrice = inactiveProducts.reduce((sum, i) => sum + ((i.product_id.final_price || i.product_id.price) * i.quantity), 0);
    if (totalActivePrice < voucher.min_purchase_amount) {
      const remainingAmount = voucher.min_purchase_amount - totalActivePrice;
      const inactiveNames = inactiveProducts.map(i => i.product_id.title).join(', ');
      return res.status(400).json({
        message: 'Voucher cannot be applied yet. Due to: ' + inactiveNames + ' Buy products of worth more than : ' + totalInActivePrice,
        remaining_amount: remainingAmount,
        inactive_products: inactiveNames,
        action_required: 'Add products worth ' + remainingAmount + ' more to apply the voucher.',
      });
    }
    const ordersByBusiness = {};
    activeProducts.forEach(i => {
      const bid = (i.product_id.business_id || '').toString();
      if (!ordersByBusiness[bid]) ordersByBusiness[bid] = [];
      ordersByBusiness[bid].push(i);
    });
    const businessIds = Object.keys(ordersByBusiness);
    if (businessIds.length > 1) {
      return res.status(400).json({ message: 'Voucher can only be applied if all items belong to the same business' });
    }
    if (voucher.business_id.toString() !== businessIds[0]) {
      return res.status(400).json({ message: 'Voucher cannot be applied to the products in your cart' });
    }
    const discountedPrice = totalActivePrice - voucher.discount_amount;
    const inactiveNames = inactiveProducts.map(i => i.product_id.title).join(', ');
    res.json({
      message: inactiveNames ? 'Voucher applied successfully but not on these products:' + inactiveNames : 'Voucher applied successfully.',
      discount: voucher.discount_amount,
      cart_total: totalActivePrice,
      final_price: discountedPrice,
      inactive_products: inactiveNames ? 'Voucher not applied to the following inactive products: ' + inactiveNames : null,
    });
  } catch (error) { next(error); }
}

async function getVoucher(req, res, next) {
  try {
    const vouchers = await Voucher.find().populate('business_id', 'name').sort({ createdAt: -1 });
    successResponse(res, vouchers, 'Vouchers retrieved successfully');
  } catch (error) { next(error); }
}

async function deleteVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) { next(error); }
}

async function verifyCode(req, res, next) {
  try {
    const voucher = await Voucher.findOne({ code: req.params.code.toLowerCase() });
    if (!voucher) return res.status(404).json({ status: false, message: 'Invalid voucher code' });
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return res.status(400).json({ status: false, message: 'Voucher has expired' });
    }
    res.json({ status: true, message: 'Voucher is valid', data: { voucher } });
  } catch (error) { next(error); }
}

module.exports = { store, applyVoucher, getVoucher, deleteVoucher, verifyCode };
