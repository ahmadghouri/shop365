const orderService = require("./order.service");
const Order = require("./order.model");
const OrderItem = require("./order-item.model");
const Product = require("../products/product.model");
const User = require("../users/user.model");
const { successResponse } = require("../../utils/api-response");

async function placeOrder(req, res, next) {
  try {
    // normalize address fields so clients can send `address_id`, `addressId`, or full `address` object
    const payload = { ...req.body };
    console.log(
      "placeOrder.controller incoming body:",
      JSON.stringify(req.body),
    );
    if (!payload.address_id) {
      if (payload.addressId) payload.address_id = payload.addressId;
      else if (payload.address && (payload.address._id || payload.address.id))
        payload.address_id = payload.address._id || payload.address.id;
      else if (payload.address && typeof payload.address === "string")
        payload.address_id = payload.address;
    }

    const result = await orderService.placeOrder(req.user._id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function viewOrders(req, res, next) {
  try {
    const orders = await orderService.viewOrders(req.user._id);
    successResponse(res, orders, "Orders");
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
    );
    const orderObj = order.toJSON();
    orderObj.items = items;
    orderObj.delivery_charge = 50;
    orderObj.total_amount = order.total_price;
    orderObj.id = String(orderObj._id);
    orderObj.display_id = String(orderObj._id).slice(0, 6);
    if (order.address_id) {
      try {
        const Address = require("../addresses/address.model");
        const addr = await Address.findById(order.address_id);
        if (addr) orderObj.address = addr.toJSON ? addr.toJSON() : addr;
        orderObj.address_id = String(order.address_id);
      } catch (e) {}
    }

    res.json(orderObj);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after" },
    );
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found or update failed" });

    // Emit real-time update via Socket.IO to the user who owns the order
    try {
      const { getIO } = require("../../socket");
      const io = getIO();
      // Emit to a room named with the user's id so mobile clients can join their own room
      const room = `user_${order.user_id}`;
      io.to(room).emit("order:statusUpdated", {
        order_id: order._id,
        status: order.status,
      });
    } catch (e) {
      // non-fatal if socket not initialized
      console.warn("Socket emit failed", e.message || e);
    }

    successResponse(res, order, "Order status updated successfully");
  } catch (error) {
    next(error);
  }
}

async function reorder(req, res, next) {
  try {
    const order = await Order.findById(req.params.order);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reorder this order" });
    }

    const Cart = require("../cart/cart.model");
    const items = await OrderItem.find({ order_id: order._id });
    let totalAdded = 0;

    for (const item of items) {
      const existing = await Cart.findOne({
        user_id: req.user._id,
        product_id: item.product_id,
      });
      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({
          user_id: req.user._id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
      totalAdded += item.quantity;
    }

    res.json({
      message: "Order items added to the cart successfully",
      count: totalAdded,
    });
  } catch (error) {
    next(error);
  }
}

async function viewRestaurantOrders(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const page = parseInt(req.query.page) || 1;
    const result = await orderService.viewRestaurantOrders(businessId, {
      page,
    });
    successResponse(res, result, "Restaurant Orders");
  } catch (error) {
    next(error);
  }
}

async function assignRider(req, res, next) {
  try {
    const orderId = req.params.id;
    const { rider_id } = req.body;
    if (!rider_id)
      return res.status(400).json({ message: "rider_id is required" });

    const Order = require("./order.model");
    const OrderItem = require("./order-item.model");
    const Product = require("../products/product.model");
    const User = require("../users/user.model");

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure this order belongs to this restaurant (by checking the products' business)
    const items = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
    );
    const businessId = req.user.business_id && String(req.user.business_id);
    const belongs = items.some((i) => {
      const bid = i.product_id?.business_id?._id || i.product_id?.business_id;
      return String(bid) === businessId;
    });
    if (!belongs)
      return res
        .status(403)
        .json({ message: "Order does not belong to your business" });

    // Verify rider exists and belongs to this business
    const rider = await User.findOne({
      _id: rider_id,
      role: "rider",
      business_id: businessId,
      deleted_at: null,
    });
    if (!rider)
      return res
        .status(404)
        .json({ message: "Rider not found for this business" });

    order.delivery_rider_id = rider._id;
    // set order status to on_way when a rider is assigned (use enum)
    const { OrderStatus } = require("../../common/enums");
    order.status = OrderStatus.ON_WAY || "on_way";
    await order.save();

    // re-fetch saved order to return fresh document
    const savedOrder = await Order.findById(order._id);

    // Emit socket events: notify rider user room and update user who placed the order
    try {
      const { getIO } = require("../../socket");
      const io = getIO();
      // notify the rider specifically
      io.to(`user_${rider._id}`).emit("order:riderAssigned", {
        order_id: savedOrder._id,
        rider: { _id: rider._id, name: rider.name, phone_no: rider.phone_no },
      });
      // notify the order owner about status update
      io.to(`user_${savedOrder.user_id}`).emit("order:statusUpdated", {
        order_id: savedOrder._id,
        status: savedOrder.status,
      });
    } catch (e) {}

    const { successResponse } = require("../../utils/api-response");
    successResponse(res, savedOrder, "Rider assigned to order");
  } catch (error) {
    next(error);
  }
}

async function superAdminOrders(req, res, next) {
  try {
    const businessId = req.params.id;
    const result = await orderService.viewRestaurantOrders(
      businessId,
      req.query,
    );
    successResponse(res, result, "Orders retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getGroceryOrders(req, res, next) {
  try {
    const businessId = req.params.id;
    // Get user IDs who placed orders for this business
    const products = await Product.find({ business_id: businessId }).select(
      "_id",
    );
    const productIds = products.map((p) => p._id);
    const orderItems = await OrderItem.find({
      product_id: { $in: productIds },
    }).select("order_id");
    const orderIds = [
      ...new Set(orderItems.map((oi) => oi.order_id.toString())),
    ];
    const orders = await Order.find({ _id: { $in: orderIds } }).select(
      "user_id",
    );
    const userIds = [...new Set(orders.map((o) => o.user_id.toString()))];

    let users = await User.find({ _id: { $in: userIds } }).select(
      "name phone_no points",
    );
    const Address = require("../addresses/address.model");
    users = await Promise.all(
      users.map(async (u) => {
        const obj = u.toJSON ? u.toJSON() : u;
        try {
          const addr = await Address.findOne({
            user_id: u._id,
            is_active: true,
          });
          if (addr)
            obj.household = {
              address: addr.address,
              town: { town_name: addr.city || "" },
            };
          else obj.household = null;
        } catch (e) {
          obj.household = null;
        }
        return obj;
      }),
    );

    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function deleteAllOrders(req, res, next) {
  try {
    await OrderItem.deleteMany({});
    await Order.deleteMany({});
    res.json({
      success: true,
      message: "All orders and order items have been deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  placeOrder,
  viewOrders,
  show,
  updateStatus,
  reorder,
  viewRestaurantOrders,
  assignRider,
  superAdminOrders,
  getGroceryOrders,
  deleteAllOrders,
};
