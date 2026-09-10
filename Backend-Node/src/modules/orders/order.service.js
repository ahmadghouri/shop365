const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const Voucher = require('../vouchers/voucher.model');
const VoucherUsage = require('../vouchers/voucher-usage.model');
const Perscription = require('../perscriptions/perscription.model');
const User = require('../users/user.model');
const Rider = require('../riders/rider.model');
const { getPaginationParams } = require('../../utils/pagination');
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
    const excludedIds = new Set((data.excluded_business_ids || []).map(id => String(id)));

    // Group by business (skip vendors the user chose to exclude for THIS order)
    const groups = {};
    const usedCartIds = [];
    for (const item of cartItems) {
      const p = item.product_id;
      const bid = (p.business_id?._id || p.business_id).toString();
      if (excludedIds.has(bid)) continue;
      usedCartIds.push(item._id);
      if (!groups[bid]) groups[bid] = { items: [], business: p.business_id };
      groups[bid].items.push(item);
    }

    if (!Object.keys(groups).length) {
      const err = new Error('Nothing to place an order for');
      err.statusCode = 400;
      throw err;
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
    // Pass 1: validate all groups before creating anything
    for (const [businessId, group] of Object.entries(groups)) {
      const items = group.items;
      const subtotal = items.reduce((s, i) => s + (i.product_id.final_price || i.product_id.price) * i.quantity, 0);
      const minimumOrder = Number(group.business?.minimum_order) || 0;
      if (minimumOrder > 0 && subtotal < minimumOrder) {
        throw Object.assign(new Error(`Minimum order amount is ${minimumOrder}`), { statusCode: 400 });
      }
    }

    // Pass 2: all validations passed — now create orders
    for (const [businessId, group] of Object.entries(groups)) {
      const items = group.items;
      const subtotal = items.reduce((s, i) => s + (i.product_id.final_price || i.product_id.price) * i.quantity, 0);
      const deliveryFee = Number(group.business?.delivery_fee) || 0;

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

      const total = Math.max(0, subtotal - voucherDiscount - pointsDiscount) + deliveryFee;

      const order = await Order.create({
        user_id: userId,
        total_price: total,
        delivery_fee: deliveryFee,
        voucher_id: voucher?._id,
        status_history: [{ status: 'pending', at: new Date() }],
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

    // Only the placed items leave the cart; excluded vendors stay for next time
    await Cart.deleteMany({ user_id: userId, _id: { $in: usedCartIds } });

    // Notify user — one notification for the batch
    notifyUser(userId, {
      type: 'order',
      title: 'Order Confirmed! 🎉',
      body: `Your order${orders.length > 1 ? 's have' : ' has'} been placed and is being prepared.`,
    });

    return orders;
  }

  async viewOrders(userId) {
    const orders = await Order.find({ user_id: userId })
      .populate({ path: 'rider_id', select: 'name phone_no image' })
      .sort({ createdAt: -1 }).lean();
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
      const r = order.rider_id && typeof order.rider_id === 'object' ? order.rider_id : null;
      return {
        ...order,
        vendors,
        item_count: items.reduce((s, i) => s + i.quantity, 0),
        rider: r ? { _id: r._id?.toString(), name: r.name, phone_no: r.phone_no, image: r.image || '' } : null,
        rider_id: r ? r._id?.toString() : null,
      };
    });
  }

  async show(orderId) {
    const order = await Order.findById(orderId)
      .populate({ path: 'items', populate: { path: 'product_id', populate: { path: 'business_id' } } })
      .populate('user_id')
      .populate({ path: 'rider_id', select: 'name phone_no image' });
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
      Order.find(filter).skip(skip).limit(perPage)
        .populate({ path: 'user_id', populate: { path: 'household_id', populate: { path: 'town_id' } } })
        .populate({ path: 'rider_id', select: 'name phone_no image' })
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    // Laravel-shaped payload the Vue vendor/admin dashboards expect
    const allItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } })
      .populate({ path: 'product_id', select: 'title price image_url description business_id' });
    const itemsByOrder = {};
    for (const item of allItems) {
      const oid = item.order_id.toString();
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push(item);
    }

    const serialized = orders.map(o => {
      const u = o.user_id || {};
      const h = u.household_id || {};
      const r = o.rider_id || {};
      return {
        id: o._id.toString(),
        created_at: o.createdAt,
        status: o.status,
        total_price: o.total_price,
        rider_id: o.rider_id ? o.rider_id._id.toString() : null,
        rider: o.rider_id
          ? { id: r._id.toString(), name: r.name, phone_no: r.phone_no, image: r.image || '' }
          : null,
        user: {
          id: (u._id || '').toString(),
          name: u.name,
          phone_no: u.phone_no,
          household: {
            address: h.address,
            town: { town_name: h.town_id?.town_name || h.town_id }, 
          },
        },
        items: (itemsByOrder[o._id.toString()] || []).map(i => ({
          id: i._id.toString(),
          product: i.product_id || null,
          price: i.price,
          quantity: i.quantity,
        })),
      };
    });

    return { orders: serialized, business_id: businessId.toString(), total, current_page: page, per_page: perPage, last_page: Math.ceil(total / perPage) };
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: { status_history: { status, at: new Date() } },
      },
      { returnDocument: 'after' }
    );

    if (order) {
      const messages = {
        confirmed:        { title: 'Order Confirmed ✅',        body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been confirmed.` },
        preparing:        { title: 'Order Being Prepared 👨‍🍳', body: `Your order #${orderId.toString().slice(-6).toUpperCase()} is now being prepared.` },
        picked_up:        { title: 'Picked Up by Rider 🛵',    body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been picked up by the rider.` },
        out_for_delivery: { title: 'Out for Delivery 🚚',      body: `Your order #${orderId.toString().slice(-6).toUpperCase()} is on its way!` },
        delivered:        { title: 'Order Delivered ✅',        body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been delivered. Enjoy!` },
        cancelled:        { title: 'Order Cancelled',           body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been cancelled.` },
      };
      const msg = messages[status];
      if (msg) {
        const type = status === 'delivered' ? 'order' : status === 'cancelled' ? 'general' : 'delivery';
        notifyUser(order.user_id.toString(), { type, ...msg });
      }
    }

    return order;
  }

  async assignRider(orderId, riderId, businessId) {
    const order = await Order.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    // The rider flow starts once the provider marks the order "preparing"
    if (!['preparing', 'picked_up', 'out_for_delivery'].includes(order.status)) {
      throw Object.assign(new Error('Assign a rider only after the order is preparing'), { statusCode: 400 });
    }

    const items = await OrderItem.find({ order_id: order._id }).populate({ path: 'product_id', select: 'business_id' });
    const businessIds = [...new Set(items.map(i => i.product_id?.business_id?.toString()).filter(Boolean))];
    if (!businessIds.includes(String(businessId))) {
      throw Object.assign(new Error('Not authorized for this order'), { statusCode: 403 });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.business_id.toString() !== String(businessId)) {
      throw Object.assign(new Error('Rider not found for your business'), { statusCode: 400 });
    }
    if (rider.status !== 'active') {
      throw Object.assign(new Error('This rider is inactive'), { statusCode: 400 });
    }

    order.rider_id = rider.user_id;
    await order.save();
    // Assign hone ke saath hi order picked up ho jata hai — same notification path as the dashboard button
    const updated = await this.updateOrderStatus(orderId, 'picked_up');
    return { order: updated, rider };
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
