const orderService = require('./order.service');
const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const Product = require('../products/product.model');
const User = require('../users/user.model');
const { successResponse } = require('../../utils/api-response');
const { OrderStatus } = require('../../common/enums');

async function placeOrder(req, res, next) {
  try {
    const result = await orderService.placeOrder(req.user._id, req.body);
    res.json(result);
  } catch (error) { next(error); }
}

async function viewOrders(req, res, next) {
  try {
    const orders = await orderService.viewOrders(req.user._id);
    successResponse(res, orders, 'Orders');
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        populate: [
          { path: 'household_id', populate: { path: 'town_id' } }
        ]
      })
      // The tracking screen needs the courier's name, phone, photo and last location
      .populate({ path: 'rider_id', select: 'name phone_no image location' });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = await OrderItem.find({ order_id: order._id }).populate('product_id');
    const orderObj = order.toJSON();
    orderObj.items = items;

    // delivery_fee is snapshotted on the order at placement time, so history
    // shows the fee charged then, not the provider's current setting
    orderObj.delivery_charge = order.delivery_fee || 0;
    orderObj.total_amount = order.total_price;

    // Flatten the populated rider into the same `rider` block the list endpoint
    // returns, so clients read courier details from one consistent shape.
    const r = order.rider_id && typeof order.rider_id === 'object' ? order.rider_id : null;
    orderObj.rider = r
      ? {
          _id: r._id?.toString(),
          name: r.name,
          phone_no: r.phone_no,
          image: r.image || '',
          location: r.location || null,
        }
      : null;
    orderObj.rider_id = r ? r._id?.toString() : null;

    res.json(orderObj);
  } catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const allowed = Object.values(OrderStatus);
    if (!allowed.includes(req.body.status)) {
      return res.status(422).json({ message: `Status must be one of ${allowed.join(', ')}` });
    }
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    if (!order) return res.status(404).json({ message: 'Order not found or update failed' });
    successResponse(res, order, 'Order status updated successfully');
  } catch (error) { next(error); }
}

async function reorder(req, res, next) {
  try {
    const order = await Order.findById(req.params.order);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to reorder this order' });
    }

    const Cart = require('../cart/cart.model');
    const items = await OrderItem.find({ order_id: order._id });
    let totalAdded = 0;

    for (const item of items) {
      const existing = await Cart.findOne({ user_id: req.user._id, product_id: item.product_id });
      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({ user_id: req.user._id, product_id: item.product_id, quantity: item.quantity });
      }
      totalAdded += item.quantity;
    }

    res.json({ message: 'Order items added to the cart successfully', count: totalAdded });
  } catch (error) { next(error); }
}

async function viewRestaurantOrders(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const page = parseInt(req.query.page) || 1;
    const result = await orderService.viewRestaurantOrders(businessId, { page });
    successResponse(res, result, 'Restaurant Orders');
  } catch (error) { next(error); }
}

async function assignRider(req, res, next) {
  try {
    const rider_id = req.body.rider_id;
    if (!rider_id) return res.status(400).json({ message: 'rider_id is required' });
    const result = await orderService.assignRider(req.params.id, rider_id, req.user.business_id);
    successResponse(res, result, 'Rider assigned to order successfully');
  } catch (error) { next(error); }
}

async function superAdminOrders(req, res, next) {
  try {
    const businessId = req.params.id;
    const result = await orderService.viewRestaurantOrders(businessId, req.query);
    successResponse(res, result, 'Orders retrieved successfully');
  } catch (error) { next(error); }
}

async function getGroceryOrders(req, res, next) {
  try {
    const businessId = req.params.id;
    // Get user IDs who placed orders for this business
    const products = await Product.find({ business_id: businessId }).select('_id');
    const productIds = products.map(p => p._id);
    const orderItems = await OrderItem.find({ product_id: { $in: productIds } }).select('order_id');
    const orderIds = [...new Set(orderItems.map(oi => oi.order_id.toString()))];
    const orders = await Order.find({ _id: { $in: orderIds } }).select('user_id');
    const userIds = [...new Set(orders.map(o => o.user_id.toString()))];

    const users = await User.find({ _id: { $in: userIds } })
      .select('name phone_no points household_id')
      .populate({ path: 'household_id', select: 'address town_id', populate: { path: 'town_id', select: 'town_name' } });

    res.json(users);
  } catch (error) { next(error); }
}

async function deleteAllOrders(req, res, next) {
  try {
    await OrderItem.deleteMany({});
    await Order.deleteMany({});
    res.json({ success: true, message: 'All orders and order items have been deleted successfully.' });
  } catch (error) { next(error); }
}

module.exports = { placeOrder, viewOrders, show, updateStatus, reorder, viewRestaurantOrders, assignRider, superAdminOrders, getGroceryOrders, deleteAllOrders };
