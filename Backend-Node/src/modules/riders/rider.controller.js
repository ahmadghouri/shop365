const Rider = require("./rider.model");
const Order = require("../orders/order.model");
const OrderItem = require("../orders/order-item.model");
const Product = require("../products/product.model");
const Business = require("../businesses/business.model");
const { OrderStatus } = require("../../common/enums");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");
const { uploadToCloudinary } = require("../../utils/cloudinary-upload");
const { notifyUser, emitToUser } = require("../../services/socket.service");
const orderService = require("../orders/order.service");

// Accepts +92XXXXXXXXXX / 03XXXXXXXXX and matches the stored formats.
function phoneCandidates(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0092")) return [`0${digits.slice(4)}`, `+92${digits.slice(4)}`];
  if (digits.startsWith("92")) return [`0${digits.slice(2)}`, `+${digits}`];
  if (digits.startsWith("0")) return [digits, `+92${digits.slice(1)}`];
  return [digits, `+92${digits}`];
}

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
  // ---- Rider/driver app auth ----
  // Riders never self-register — they are created by an approved rider
  // application or by a vendor — so this only authenticates users that have an
  // active linked Rider record, and rejects everyone else.
  async riderLogin(req, res, next) {
    try {
      const { phone_no, password } = req.body;
      if (!phone_no || !password) {
        return res
          .status(422)
          .json({ message: "Phone number and password are required" });
      }

      // Riders are a self-contained collection — authenticate against Rider,
      // not User. Match the phone in any of the stored formats.
      const rider = await Rider.findOne({
        phone_no: { $in: phoneCandidates(phone_no) },
      });
      if (!rider || !rider.password || !(await comparePassword(password, rider.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (rider.status !== "active" || rider.deleted_at) {
        return res
          .status(403)
          .json({ message: "This rider account is no longer active" });
      }

      const token = generateToken({ rid: rider._id.toString() });

      res.json({ message: "Login Successful", token, data: rider.toJSON() });
    } catch (error) {
      next(error);
    }
  }

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

      // Phone is the rider's login identity, so it must be globally unique.
      const existing = await Rider.findOne({ phone_no });
      if (existing) {
        return res
          .status(409)
          .json({ message: "A rider with this phone already exists" });
      }

      let image = typeof req.body.image === "string" ? req.body.image : "";
      if (req.file) {
        const result = await uploadToCloudinary(req.file, "riders");
        image = result.secure_url;
      }

      const rider = await Rider.create({
        business_id: businessId,
        kind: kind || "parcel",
        name,
        phone_no,
        password: await hashPassword(password),
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
          phone_no,
          _id: { $ne: rider._id },
        });
        if (clash)
          return res
            .status(409)
            .json({ message: "Another rider uses this phone" });
        rider.phone_no = phone_no;
      }
      if (password) rider.password = await hashPassword(password);
      await rider.save();

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
      // Soft-delete so the rider can no longer sign in, but their order
      // history (Order.rider_id) stays intact.
      rider.status = "inactive";
      rider.deleted_at = new Date();
      await rider.save();
      res.json({ message: "Rider removed successfully" });
    } catch (error) {
      next(error);
    }
  }

  // ---- Rider mobile app ----
  async riderOrders(req, res, next) {
    try {
      const businessId = req.rider.business_id;
      const riderId = req.rider._id;

      let orderFilter;
      if (businessId) {
        // Business rider: only orders containing this business's products.
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
        orderFilter = { _id: { $in: orderIds }, status: { $in: RIDABLE } };
      } else {
        // Platform rider: the open pool — deliverable orders that are either
        // unassigned or already assigned to this rider.
        orderFilter = {
          status: { $in: RIDABLE },
          $or: [{ rider_id: null }, { rider_id: riderId }],
        };
      }

      const orders = await Order.find(orderFilter)
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

      if (req.rider.business_id) {
        // Business rider: the order must contain one of this business's products.
        const businessIds = [
          ...new Set(
            items
              .map((i) => i.product_id?.business_id?.toString())
              .filter(Boolean),
          ),
        ];
        if (!businessIds.includes(String(req.rider.business_id))) {
          return res
            .status(403)
            .json({ message: "Not authorized for this order" });
        }
      } else {
        // Platform rider: may act only on an unassigned order (claiming it) or
        // one already assigned to them.
        const assignedToSomeoneElse =
          order.rider_id && String(order.rider_id) !== String(req.rider._id);
        if (assignedToSomeoneElse) {
          return res
            .status(403)
            .json({ message: "This order is already assigned to another rider" });
        }
      }

      if (!order.rider_id) order.rider_id = req.rider._id;
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

  // Rider pushes its live GPS position. We store it on the rider and, for each
  // of the rider's in-flight orders, push it to that order's customer so their
  // tracking screen moves in real time.
  async riderUpdateLocation(req, res, next) {
    try {
      const latitude = Number(req.body.latitude);
      const longitude = Number(req.body.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res
          .status(422)
          .json({ message: "Valid latitude and longitude are required" });
      }

      const now = new Date();
      req.rider.location = { latitude, longitude, updated_at: now };
      await req.rider.save();

      // Orders this rider is currently delivering.
      const activeOrders = await Order.find({
        rider_id: req.rider._id,
        status: { $in: [OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY] },
      }).select("user_id");

      for (const order of activeOrders) {
        emitToUser(order.user_id.toString(), "rider_location", {
          order_id: order._id.toString(),
          latitude,
          longitude,
          updated_at: now.toISOString(),
        });
      }

      res.json({ message: "Location updated", data: { latitude, longitude } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RiderController();
