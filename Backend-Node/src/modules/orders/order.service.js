const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const Voucher = require('../vouchers/voucher.model');
const VoucherUsage = require('../vouchers/voucher-usage.model');
const Perscription = require('../perscriptions/perscription.model');
const User = require('../users/user.model');
const { getPaginationParams, paginateResponse } = require('../../utils/pagination');
const { notifyUser } = require('../../services/socket.service');

class OrderService {
  async placeOrder(userId, data) {
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: 'product_id',
      populate: { path: 'business_id' },
    });
    if (!cartItems.length) {
      const err = new Error('Cart is empty');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(userId);
    const deliveryCharge = 50;

    // Group by business
    const groups = {};
    for (const item of cartItems) {
      const p = item.product_id;
      const bid = (p.business_id?._id || p.business_id).toString();
      if (!groups[bid]) groups[bid] = { items: [], business: p.business_id };
      groups[bid].items.push(item);
    }

    // Validate voucher
    let voucher = null;
    if (data.voucher_code) {
      voucher = await Voucher.findOne({ code: data.voucher_code.toLowerCase(), deleted_at: null });
      if (!voucher) throw Object.assign(new Error('Invalid voucher code'), { statusCode: 400 });

      const used = await VoucherUsage.findOne({ voucher_id: voucher._id, user_id: userId });
      if (used) throw Object.assign(new Error('Voucher already used'), { statusCode: 400 });

      if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
        throw Object.assign(new Error('Voucher has expired'), { statusCode: 400 });
      }
    }

    const orders = [];
    for (const [businessId, group] of Object.entries(groups)) {
      const items = group.items;
      const subtotal = items.reduce((s, i) => s + (i.product_id.final_price || i.product_id.price) * i.quantity, 0);

      if (businessId === '6' && subtotal < 500) {
        throw Object.assign(new Error('Minimum order amount is 500'), { statusCode: 400 });
      }
      if (businessId !== '6' && subtotal < 1000) {
        throw Object.assign(new Error('Minimum order amount is 1000'), { statusCode: 400 });
      }

      let voucherDiscount = 0;
      if (voucher && voucher.business_id.toString() === businessId) {
        voucherDiscount = voucher.discount_amount;
        await VoucherUsage.create({ voucher_id: voucher._id, user_id: userId });
      }

      let pointsDiscount = 0;
      if (data.userPoints && businessId === '6' && user.points >= 250) {
        pointsDiscount = Math.min(user.points, subtotal);
        user.points -= pointsDiscount;
        await user.save();
      }

      const total = Math.max(0, subtotal - voucherDiscount - pointsDiscount) + (businessId === '6' ? deliveryCharge : 0);

      const order = await Order.create({
        user_id: userId,
        total_price: total,
        voucher_id: voucher?._id,
      });

      await OrderItem.insertMany(items.map(i => ({
        order_id: order._id,
        product_id: i.product_id._id || i.product_id,
        price: i.product_id.final_price || i.product_id.price,
        quantity: i.quantity,
      })));

      // Link prescription
      const presc = await Perscription.findOne({ user_id: userId, order_id: { $exists: false }, status: 'pending' });
      if (presc) { presc.order_id = order._id; await presc.save(); }

      orders.push(order);
    }

    await Cart.deleteMany({ user_id: userId });

    // Notify user — one notification for the batch
    notifyUser(userId, {
      type: 'order',
      title: 'Order Confirmed! 🎉',
      body: `Your order${orders.length > 1 ? 's have' : ' has'} been placed and is being prepared.`,
    });

    return orders;
  }

  async viewOrders(userId) {
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
    // Attach first vendor name per order for the card display
    const orderIds = orders.map(o => o._id);
    const allItems = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate({ path: 'product_id', select: 'title business_id', populate: { path: 'business_id', select: 'name' } })
      .lean();

    const itemsByOrder = {};
    for (const item of allItems) {
      const oid = item.order_id.toString();
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push(item);
    }

    return orders.map(order => {
      const items = itemsByOrder[order._id.toString()] || [];
      const vendors = [...new Set(items.map(i => i.product_id?.business_id?.name).filter(Boolean))];
      return { ...order, vendors, item_count: items.reduce((s, i) => s + i.quantity, 0) };
    });
  }

  async show(orderId) {
    const order = await Order.findById(orderId)
      .populate({ path: 'items', populate: { path: 'product_id', populate: { path: 'business_id' } } })
      .populate('user_id');
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
  }

  async viewRestaurantOrders(businessId, query) {
    const { page, perPage, skip } = getPaginationParams(query);
    const products = await Product.find({ business_id: businessId, deleted_at: null }).select('_id');
    const orderItems = await OrderItem.find({ product_id: { $in: products.map(p => p._id) } }).select('order_id');
    const orderIds = [...new Set(orderItems.map(oi => oi.order_id.toString()))];
    const filter = { _id: { $in: orderIds } };
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).skip(skip).limit(perPage).populate('user_id').sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);
    return paginateResponse(orders, total, page, perPage);
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' });

    if (order) {
      const messages = {
        processing:  { title: 'Order Being Prepared 👨‍🍳', body: `Your order #${orderId.toString().slice(-6).toUpperCase()} is now being prepared.` },
        shipped:     { title: 'Out for Delivery 🚚',      body: `Your order #${orderId.toString().slice(-6).toUpperCase()} is on its way!` },
        delivered:   { title: 'Order Delivered ✅',        body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been delivered. Enjoy!` },
        cancelled:   { title: 'Order Cancelled',           body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been cancelled.` },
      };
      const msg = messages[status];
      if (msg) notifyUser(order.user_id.toString(), { type: status === 'delivered' ? 'order' : 'delivery', ...msg });
    }

    return order;
  }

  async reorder(userId, orderId) {
    const items = await OrderItem.find({ order_id: orderId });
    for (const item of items) {
      const existing = await Cart.findOne({ user_id: userId, product_id: item.product_id });
      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({ user_id: userId, product_id: item.product_id, quantity: item.quantity });
      }
    }
  }

  async deleteAllOrders() {
    await OrderItem.deleteMany({});
    await Order.deleteMany({});
  }
}

module.exports = new OrderService();
