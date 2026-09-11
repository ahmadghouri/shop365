const User = require("../users/user.model");
const { hashPassword } = require("../../utils/password");
const { successResponse } = require("../../utils/api-response");

async function createRider(req, res, next) {
  try {
    const businessId = req.user.business_id;
    if (!businessId)
      return res
        .status(400)
        .json({ message: "Vendor has no business assigned" });

    const { name, phone_no, email, password } = req.body;
    if (!phone_no)
      return res.status(400).json({ message: "phone_no is required" });

    // ensure phone unique
    const exists = await User.findOne({ phone_no });
    if (exists)
      return res
        .status(400)
        .json({ message: "User with this phone already exists" });

    const pwd =
      password || Math.random().toString(36).slice(-8) || "password123";
    const hashed = await hashPassword(pwd);

    const user = await User.create({
      name,
      phone_no,
      email,
      password: hashed,
      role: "rider",
      business_id: businessId,
    });

    // Return user without password (toJSON hides password)
    successResponse(res, user, "Rider created");
  } catch (e) {
    next(e);
  }
}

async function listRiders(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const riders = await User.find({
      business_id: businessId,
      role: "rider",
      deleted_at: null,
    }).select("-password");
    successResponse(res, riders, "Riders");
  } catch (e) {
    next(e);
  }
}

async function getRider(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const riderId = req.params.id;
    const rider = await User.findOne({
      _id: riderId,
      business_id: businessId,
      role: "rider",
      deleted_at: null,
    }).select("-password");
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Orders assigned to this rider for this business
    const Order = require("../orders/order.model");
    const OrderItem = require("../orders/order-item.model");

    const orders = await Order.find({ delivery_rider_id: rider._id }).sort({
      createdAt: -1,
    });

    // Compute simple stats: total, delivered, pending, by period
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const pending = orders.filter((o) => o.status !== "delivered").length;

    // Recent orders with items
    const recent = await Promise.all(
      orders.slice(0, 20).map(async (o) => {
        const items = await OrderItem.find({ order_id: o._id }).populate(
          "product_id",
        );
        const obj = o.toJSON ? o.toJSON() : o;
        obj.items = items;
        obj.display_id = String(obj._id).slice(0, 6);
        return obj;
      }),
    );

    successResponse(
      res,
      { rider, stats: { total, delivered, pending }, recent },
      "Rider detail",
    );
  } catch (e) {
    next(e);
  }
}

async function deleteRider(req, res, next) {
  try {
    const businessId = req.user.business_id;
    const riderId = req.params.id;
    const rider = await User.findOne({
      _id: riderId,
      business_id: businessId,
      role: "rider",
      deleted_at: null,
    });
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    rider.deleted_at = new Date();
    await rider.save();
    successResponse(res, rider, "Rider deleted");
  } catch (e) {
    next(e);
  }
}

module.exports = { createRider, listRiders, getRider, deleteRider };
