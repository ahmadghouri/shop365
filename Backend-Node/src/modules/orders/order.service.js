const Order = require("./order.model");
const mongoose = require("mongoose");
const OrderItem = require("./order-item.model");
const Cart = require("../cart/cart.model");
const Product = require("../products/product.model");
const Voucher = require("../vouchers/voucher.model");
const VoucherUsage = require("../vouchers/voucher-usage.model");
const Perscription = require("../perscriptions/perscription.model");
const User = require("../users/user.model");
const Address = require("../addresses/address.model");
const {
  getPaginationParams,
  paginateResponse,
} = require("../../utils/pagination");

class OrderService {
  async placeOrder(userId, data) {
    console.log("placeOrder.service received data:", JSON.stringify(data));
    // Validate required payload
    if (!data || !data.address_id) {
      const err = new Error("address_id is required");
      err.statusCode = 400;
      console.warn("placeOrder.service missing address_id");
      throw err;
    }

    // Idempotency: if client_order_id provided and orders already exist for this user, return them
    if (data && data.client_order_id) {
      const existing = await Order.find({
        user_id: userId,
        client_order_id: data.client_order_id,
      }).sort({ createdAt: -1 });
      if (existing && existing.length > 0) {
        // populate items for existing orders
        const detailed = await Promise.all(
          existing.map(async (order) => {
            const items = await OrderItem.find({
              order_id: order._id,
            }).populate("product_id");
            const orderObj = order.toJSON ? order.toJSON() : order;
            orderObj.items = items;
            orderObj.delivery_charge = 50;
            orderObj.total_amount = order.total_price;
            return orderObj;
          }),
        );
        return detailed;
      }
    }
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      populate: { path: "business_id" },
    });
    if (!cartItems.length) {
      const err = new Error("Cart is empty");
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
      voucher = await Voucher.findOne({
        code: data.voucher_code.toLowerCase(),
        deleted_at: null,
      });
      if (!voucher)
        throw Object.assign(new Error("Invalid voucher code"), {
          statusCode: 400,
        });

      const used = await VoucherUsage.findOne({
        voucher_id: voucher._id,
        user_id: userId,
      });
      if (used)
        throw Object.assign(new Error("Voucher already used"), {
          statusCode: 400,
        });

      if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
        throw Object.assign(new Error("Voucher has expired"), {
          statusCode: 400,
        });
      }
    }

    const orders = [];
    for (const [businessId, group] of Object.entries(groups)) {
      const items = group.items;
      const subtotal = items.reduce(
        (s, i) =>
          s + (i.product_id.final_price || i.product_id.price) * i.quantity,
        0,
      );

      // ponytail: removed minimum-order validation to allow smaller orders per product group
      // Previous checks threw a 400 error when subtotal < required min for a business.
      // If you want to re-enable min-order validation, add checks here.

      let voucherDiscount = 0;
      if (voucher && voucher.business_id.toString() === businessId) {
        voucherDiscount = voucher.discount_amount;
        await VoucherUsage.create({ voucher_id: voucher._id, user_id: userId });
      }

      let pointsDiscount = 0;
      if (data.userPoints && businessId === "6" && user.points >= 250) {
        pointsDiscount = Math.min(user.points, subtotal);
        user.points -= pointsDiscount;
        await user.save();
      }

      const total =
        Math.max(0, subtotal - voucherDiscount - pointsDiscount) +
        (businessId === "6" ? deliveryCharge : 0);

      // Create order using MongoDB _id; sequential `order_number` removed per request
      let orderPayload = {
        user_id: userId,
        total_price: total,
        voucher_id: voucher?._id,
        client_order_id: data && data.client_order_id,
      };
      if (data && data.address_id) {
        const aid = data.address_id;
        console.log(
          "placeOrder.service address_id raw:",
          aid,
          "isValid:",
          typeof mongoose.isValidObjectId === "function"
            ? mongoose.isValidObjectId(aid)
            : "unknown",
        );
        if (
          typeof mongoose.isValidObjectId === "function"
            ? mongoose.isValidObjectId(aid)
            : false
        ) {
          // assign raw id (string) and let mongoose cast to ObjectId on save
          orderPayload.address_id = aid;
        } else {
          console.warn("Invalid address_id provided to placeOrder:", aid);
        }
      }

      // Log payload with address_id as string for clarity
      const debugPayload = {
        ...orderPayload,
        address_id: orderPayload.address_id
          ? String(orderPayload.address_id)
          : null,
      };
      console.log(
        "placeOrder.service creating order with payload (debug):",
        JSON.stringify(debugPayload),
      );
      let order;
      try {
        order = await Order.create(orderPayload);
      } catch (err) {
        console.error("Order.create failed:", err && err.message);
        if (err && err.errors) {
          console.error(
            "Validation errors:",
            Object.keys(err.errors).map((k) => ({
              [k]: err.errors[k].message,
            })),
          );
        }
        throw err;
      }

      await OrderItem.insertMany(
        items.map((i) => ({
          order_id: order._id,
          product_id: i.product_id._id || i.product_id,
          price: i.product_id.final_price || i.product_id.price,
          quantity: i.quantity,
        })),
      );

      // Link prescription
      const presc = await Perscription.findOne({
        user_id: userId,
        order_id: { $exists: false },
        status: "pending",
      });
      if (presc) {
        presc.order_id = order._id;
        await presc.save();
      }

      orders.push(order);
    }

    await Cart.deleteMany({ user_id: userId });
    return orders;
  }

  async viewOrders(userId) {
    // Return orders with their items populated so clients can show order items in lists
    const orders = await Order.find({ user_id: userId }).sort({
      createdAt: -1,
    });
    const detailed = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).populate(
          "product_id",
        );
        const orderObj = order.toJSON ? order.toJSON() : order;
        orderObj.items = items;
        orderObj.delivery_charge = 50;
        orderObj.total_amount = order.total_price;
        if (order.address_id) {
          try {
            const addr = await Address.findById(order.address_id);
            if (addr) orderObj.address = addr.toJSON ? addr.toJSON() : addr;
            orderObj.address_id = String(order.address_id);
          } catch (e) {}
        }
        // ensure clients have a stable `id` and a short `display_id`
        orderObj.id = String(orderObj._id);
        orderObj.display_id = String(orderObj._id).slice(0, 6);
        return orderObj;
      }),
    );
    return detailed;
  }

  async show(orderId) {
    const order = await Order.findById(orderId)
      .populate({
        path: "items",
        populate: { path: "product_id", populate: { path: "business_id" } },
      })
      .populate("user_id");
    if (!order)
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    return order;
  }

  async viewRestaurantOrders(businessId, query) {
    const { page, perPage, skip } = getPaginationParams(query);
    const products = await Product.find({
      business_id: businessId,
      deleted_at: null,
    }).select("_id");
    const orderItems = await OrderItem.find({
      product_id: { $in: products.map((p) => p._id) },
    }).select("order_id");
    const orderIds = [
      ...new Set(orderItems.map((oi) => oi.order_id.toString())),
    ];
    const filter = { _id: { $in: orderIds } };
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .skip(skip)
        .limit(perPage)
        .populate("user_id")
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);
    // map orders to plain objects with stable id/display_id for frontend
    const mapped = await Promise.all(
      orders.map(async (o) => {
        const obj = o.toJSON ? o.toJSON() : o;
        obj.id = String(obj._id);
        obj.display_id = String(obj._id).slice(0, 6);
        obj.created_at = obj.createdAt;

        // Normalize populated user -> frontend expects `user` with `household` and `town`
        if (obj.user_id) {
          const u = obj.user_id;
          // Prefer household record; if missing, fallback to user's address fields
          let household = null;
          if (u.household_id) {
            household = { ...u.household_id };
            if (household && household.town_id) {
              household.town = { ...household.town_id };
            }
          } else {
            const addr =
              u.address ||
              [u.street, u.area, u.city].filter(Boolean).join(", ");
            household = addr ? { address: addr } : null;
          }

          obj.user = {
            _id: u._id,
            name: u.name,
            phone_no: u.phone_no,
            household,
          };
        }
        // ensure created_at is an ISO string for frontend formatting
        if (obj.createdAt)
          obj.created_at = new Date(obj.createdAt).toISOString();
        delete obj.user_id;

        // populate address details when address_id present
        if (obj.address_id) {
          try {
            const addr = await Address.findById(obj.address_id);
            if (addr) obj.address = addr.toJSON ? addr.toJSON() : addr;
            obj.address_id = String(obj.address_id);
          } catch (e) {}
        }

        return obj;
      }),
    );

    return {
      orders: mapped,
      business_id: businessId,
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.ceil(total / perPage),
    };
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { returnDocument: "after" },
    );
    return order;
  }

  async reorder(userId, orderId) {
    const items = await OrderItem.find({ order_id: orderId });
    for (const item of items) {
      const existing = await Cart.findOne({
        user_id: userId,
        product_id: item.product_id,
      });
      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }
  }

  async deleteAllOrders() {
    await OrderItem.deleteMany({});
    await Order.deleteMany({});
  }
}

module.exports = new OrderService();
