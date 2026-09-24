const Rider = require("./rider.model");
const Order = require("../orders/order.model");
const OrderItem = require("../orders/order-item.model");
const Product = require("../products/product.model");
const Business = require("../businesses/business.model");
const User = require("../users/user.model");
const { UserRole, OrderStatus } = require("../../common/enums");
const { hashPassword } = require("../../utils/password");
const { uploadToCloudinary } = require("../../utils/cloudinary-upload");
const { notifyUser } = require("../../services/socket.service");
const orderService = require("../orders/order.service");

const RIDABLE = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
];
const RIDER_STATUSES = [
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

class RiderController {
  // ---- Vendor dashboard CRUD ----
  async index(req, res, next) {
    try {
      const filter = { business_id: req.user.business_id };
      if (req.query.kind) filter.kind = req.query.kind;
      if (req.query.status) filter.status = req.query.status;
      const riders = await Rider.find(filter).sort({ createdAt: -1 });
      res.json({ message: "Riders", data: riders });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const businessId = req.user.business_id;
      if (!businessId) {
        return res
          .status(400)
          .json({ message: "No business linked to this account" });
      }
      const {
        name,
        phone_no,
        password,
        kind,
        cnic,
        license_no,
        vehicle_type,
        vehicle_no,
      } = req.body;

      if (!name || !phone_no) {
        return res
          .status(400)
          .json({ message: "Name and phone number are required" });
      }
      if (!password) {
        return res
          .status(400)
          .json({
            message:
              "A login password is required so the rider can log into the mobile app",
          });
      }

      const existingUser = await User.findOne({ phone_no });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Phone number already registered" });
      }
      const existing = await Rider.findOne({
        business_id: businessId,
        phone_no,
      });
      if (existing) {
        return res
          .status(409)
          .json({
            message: "A rider with this phone already exists for your business",
          });
      }

      let image = typeof req.body.image === "string" ? req.body.image : "";
      if (req.file) {
        const result = await uploadToCloudinary(req.file, "riders");
        image = result.secure_url;
      }

      const user = await User.create({
        name,
        phone_no,
        image,
        password: await hashPassword(password),
        role: UserRole.RIDER,
        business_id: businessId,
      });

      const rider = await Rider.create({
        business_id: businessId,
        kind: kind || "parcel",
        user_id: user._id,
        name,
        phone_no,
        image,
        cnic: cnic || undefined,
        license_no: license_no || undefined,
        vehicle_type: vehicle_type || "bike",
        vehicle_no: vehicle_no || undefined,
      });

      res
        .status(201)
        .json({ message: "Rider added successfully", data: rider.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const rider = await Rider.findById(req.params.id);
      if (!rider) return res.status(404).json({ message: "Rider not found" });
      if (rider.business_id.toString() !== req.user.business_id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const {
        name,
        kind,
        cnic,
        license_no,
        vehicle_type,
        vehicle_no,
        phone_no,
        password,
      } = req.body;
      if (name) rider.name = name;
      if (kind) rider.kind = kind;
      if (cnic !== undefined) rider.cnic = cnic;
      if (license_no !== undefined) rider.license_no = license_no;
      if (vehicle_type) rider.vehicle_type = vehicle_type;
      if (vehicle_no !== undefined) rider.vehicle_no = vehicle_no;
      if (req.file) {
        const result = await uploadToCloudinary(req.file, "riders");
        rider.image = result.secure_url;
      } else if (typeof req.body.image === "string") {
        rider.image = req.body.image;
      }
      if (phone_no) {
        const clash = await Rider.findOne({
          business_id: rider.business_id,
          phone_no,
          _id: { $ne: rider._id },
        });
        if (clash)
          return res
            .status(409)
            .json({ message: "Another rider uses this phone" });
        rider.phone_no = phone_no;
      }
      await rider.save();

      if (rider.user_id) {
        const user = await User.findById(rider.user_id);
        if (user) {
          if (name) user.name = name;
          if (phone_no) user.phone_no = phone_no;
          if (req.file || req.body.image !== undefined)
            user.image = rider.image;
          if (password) user.password = await hashPassword(password);
          await user.save();
        }
      }

      res.json({ message: "Rider updated successfully", data: rider.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const rider = await Rider.findById(req.params.id);
      if (!rider) return res.status(404).json({ message: "Rider not found" });
      if (rider.business_id.toString() !== req.user.business_id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      rider.status = rider.status === "active" ? "inactive" : "active";
      await rider.save();
      res.json({ message: "Rider status updated", data: rider.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const rider = await Rider.findById(req.params.id);
      if (!rider) return res.status(404).json({ message: "Rider not found" });
      if (rider.business_id.toString() !== req.user.business_id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      await Rider.deleteOne({ _id: rider._id });
      // Soft-delete the linked login so the rider can no longer sign in, but their order history stays intact
      if (rider.user_id) {
        await User.updateOne(
          { _id: rider.user_id },
          { deleted_at: new Date() },
        );
      }
      res.json({ message: "Rider removed successfully" });
    } catch (error) {
      next(error);
    }
  }

  // ---- Rider mobile app ----
  async riderOrders(req, res, next) {
    try {
      const businessId = req.user.business_id;
      if (!businessId)
        return res
          .status(403)
          .json({ message: "No business linked to this rider" });

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
      const orders = await Order.find({
        _id: { $in: orderIds },
        status: { $in: RIDABLE },
      })
        .populate({ path: "user_id", select: "name phone_no address" })
        .sort({ createdAt: -1 })
        .limit(50);

      const allItems = await OrderItem.find({
        order_id: { $in: orders.map((o) => o._id) },
      }).populate({ path: "product_id", select: "title price image_url" });
      const itemsByOrder = {};
      for (const item of allItems) {
        if (!itemsByOrder[item.order_id.toString()])
          itemsByOrder[item.order_id.toString()] = [];
        itemsByOrder[item.order_id.toString()].push(item);
      }

      const serialized = orders.map((o) => {
        const u = o.user_id || {};
        return {
          _id: o._id,
          total_price: o.total_price,
          delivery_fee: o.delivery_fee || 0,
          status: o.status,
          createdAt: o.createdAt,
          status_history: o.status_history,
          user: {
            _id: u._id,
            name: u.name,
            phone_no: u.phone_no,
            address: u.address,
          },
          items: (itemsByOrder[o._id.toString()] || []).map((i) => ({
            product_id: i.product_id || null,
            quantity: i.quantity,
            price: i.price,
          })),
        };
      });

      res.json({ message: "Rider orders", data: serialized });
    } catch (error) {
      next(error);
    }
  }

  async riderUpdateStatus(req, res, next) {
    try {
      const status = req.body.status;
      if (!RIDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({
            message: `Status must be one of ${RIDER_STATUSES.join(", ")}`,
          });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const items = await OrderItem.find({ order_id: order._id }).populate({
        path: "product_id",
        select: "business_id",
      });
      const businessIds = [
        ...new Set(
          items
            .map((i) => i.product_id?.business_id?.toString())
            .filter(Boolean),
        ),
      ];
      const match = businessIds.includes(String(req.user.business_id));
      if (!match)
        return res
          .status(403)
          .json({ message: "Not authorized for this order" });

      if (!order.rider_id) order.rider_id = req.user._id;
      const changedAt = new Date();
      order.status = status;
      order.estimated_delivery_at = orderService.estimateDeliveryAt(
        status,
        changedAt,
      );
      if (status === "delivered") order.delivered_at = changedAt;
      order.status_history.push({ status, at: changedAt });
      await order.save();

      const messages = {
        picked_up: {
          title: "Picked Up by Rider 🛵",
          body: "Your order has been picked up by the rider.",
        },
        out_for_delivery: {
          title: "Out for Delivery 🚀",
          body: "Your order is on its way!",
        },
        delivered: {
          title: "Order Delivered ✅",
          body: "Your order has been delivered. Enjoy!",
        },
        cancelled: {
          title: "Order Cancelled",
          body: "Your order has been cancelled.",
        },
      };
      const msg = messages[status];
      if (msg) {
        let metadata = undefined;
        try {
          if (items.length) {
            const bizId = items[0].product_id?.business_id;
            if (bizId) {
              const biz = await Business.findById(bizId, "type name").lean();
              if (biz)
                metadata = { business_type: biz.type, business_name: biz.name };
            }
          }
        } catch {}
        notifyUser(order.user_id.toString(), {
          type: "delivery",
          ...msg,
          reference_id: order._id,
          reference_type: "order",
          metadata,
        });
      }

      res.json({ message: "Order status updated", data: order.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RiderController();
