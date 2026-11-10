const Rider = require("./rider.model");
const RiderReview = require("./rider-review.model");
const Order = require("../orders/order.model");
const OrderItem = require("../orders/order-item.model");
const Business = require("../businesses/business.model");
const User = require("../users/user.model");
const { UserRole } = require("../../common/enums");
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

// A rider's initial password is their CNIC, stored as typed in the app
// ("35202-1234567-1"). Accept it with or without the dashes so riders don't get
// locked out over formatting.
async function passwordMatches(password, hash) {
  const given = String(password);
  if (await comparePassword(given, hash)) return true;
  const digits = given.replace(/\D/g, "");
  if (digits.length !== 13) return false;
  const variants = [digits, `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`];
  for (const v of variants) {
    if (v !== given && (await comparePassword(v, hash))) return true;
  }
  return false;
}

// Statuses in which a rider is busy delivering an order. A rider may carry only
// one such order at a time.
const IN_PROGRESS = [OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY];

/** The rider's current in-progress order (other than `exceptId`), if any. */
function findActiveDelivery(riderId, exceptId) {
  const filter = { rider_id: riderId, status: { $in: IN_PROGRESS } };
  if (exceptId) filter._id = { $ne: exceptId };
  return Order.findOne(filter).select("_id");
}

const RIDABLE = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
];
// A rider can't cancel the customer's order — they request a cancellation
// with a reason instead (see riderCancelDelivery).
const RIDER_STATUSES = [
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
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
      if (!rider || !rider.password || !(await passwordMatches(password, rider.password))) {
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

      // Validation for edited fields.
      if (name !== undefined && String(name).trim().length < 3) {
        return res.status(422).json({ message: "Name must be at least 3 characters" });
      }
      if (phone_no) {
        const d = String(phone_no).replace(/\D/g, "").replace(/^0092/, "").replace(/^92(?=3\d{9}$)/, "").replace(/^0/, "");
        if (!/^3\d{9}$/.test(d)) {
          return res.status(422).json({ message: "Enter a valid Pakistani mobile number (03XXXXXXXXX)" });
        }
        req.body.phone_no = `0${d}`;
      }
      if (cnic && String(cnic).replace(/\D/g, "").length !== 13) {
        return res.status(422).json({ message: "CNIC must be 13 digits" });
      }
      if (password && String(password).length < 6) {
        return res.status(422).json({ message: "Password must be at least 6 characters" });
      }

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
        const normalisedPhone = req.body.phone_no; // set by the validation above
        const clash = await Rider.findOne({
          phone_no: normalisedPhone,
          _id: { $ne: rider._id },
        });
        if (clash)
          return res
            .status(409)
            .json({ message: "Another rider uses this phone" });
        rider.phone_no = normalisedPhone;
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
  // ---- Rider's own profile ----

  // Profile + business + delivery count, rating and latest reviews.
  async riderMe(req, res, next) {
    try {
      const rider = req.rider;
      const [business, deliveries, rating, reviews] = await Promise.all([
        rider.business_id ? Business.findById(rider.business_id).select("name image") : null,
        Order.countDocuments({ rider_id: rider._id, status: OrderStatus.DELIVERED }),
        RiderReview.getAvgForRider(rider._id),
        RiderReview.find({ rider_id: rider._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate({ path: "user_id", select: "name" }),
      ]);

      res.json({
        message: "Rider profile",
        data: {
          ...rider.toJSON(),
          // platform = approved via rider application; restaurant = a business's own rider
          rider_type: rider.business_id ? "restaurant" : "platform",
          business: business ? { _id: business._id, name: business.name, image: business.image || "" } : null,
          stats: {
            deliveries,
            rating: Math.round((rating.average || 0) * 10) / 10,
            reviews: rating.count || 0,
            member_since: rider.createdAt,
          },
          recent_reviews: reviews.map((r) => ({
            _id: r._id,
            rating: r.rating,
            comments: r.comments || "",
            customer: r.user_id?.name || "Customer",
            createdAt: r.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async riderChangePassword(req, res, next) {
    try {
      const current = String(req.body.current_password || "");
      const next_ = String(req.body.new_password || "");
      if (!current || !next_) {
        return res.status(422).json({ message: "Current and new password are required" });
      }
      if (next_.length < 6) {
        return res.status(422).json({ message: "New password must be at least 6 characters" });
      }
      const rider = await Rider.findById(req.rider._id);
      if (!rider?.password || !(await passwordMatches(current, rider.password))) {
        return res.status(422).json({ message: "Current password is incorrect" });
      }
      if (await comparePassword(next_, rider.password)) {
        return res.status(422).json({ message: "New password must be different from the current one" });
      }
      rider.password = await hashPassword(next_);
      await rider.save();
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async riderUpdatePhoto(req, res, next) {
    try {
      if (!req.file) return res.status(422).json({ message: "Please choose a photo" });
      const result = await uploadToCloudinary(req.file, "riders");
      const rider = await Rider.findById(req.rider._id);
      rider.image = result.secure_url;
      await rider.save();
      res.json({ message: "Photo updated", data: { image: rider.image } });
    } catch (error) {
      next(error);
    }
  }

  // Rider wallet: earnings (delivery fees) and cash collected from customers
  // (order totals) for today / last 7 days / this month / all time, a 7-day
  // daily breakdown and the most recent earning entries.
  async riderWallet(req, res, next) {
    try {
      const riderId = req.rider._id;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days incl. today
      const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

      // Group days in the server's local time (same as startOfToday above).
      const offsetMin = -startOfToday.getTimezoneOffset();
      const tz = `${offsetMin >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0")}:${String(Math.abs(offsetMin) % 60).padStart(2, "0")}`;

      const fee = { $ifNull: ["$delivery_fee", 0] };
      const cash = { $ifNull: ["$total_price", 0] };
      const since = (d) => ({ $gte: ["$delivered_at", d] });
      const sumIf = (cond, value) => ({ $sum: { $cond: [cond, value, 0] } });

      const [agg] = await Order.aggregate([
        { $match: { rider_id: riderId, status: OrderStatus.DELIVERED } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  earn_today: sumIf(since(startOfToday), fee),
                  earn_week: sumIf(since(startOfWeek), fee),
                  earn_month: sumIf(since(startOfMonth), fee),
                  earn_total: { $sum: fee },
                  cash_today: sumIf(since(startOfToday), cash),
                  cash_week: sumIf(since(startOfWeek), cash),
                  cash_month: sumIf(since(startOfMonth), cash),
                  cash_total: { $sum: cash },
                  count_today: sumIf(since(startOfToday), 1),
                  count_week: sumIf(since(startOfWeek), 1),
                  count_month: sumIf(since(startOfMonth), 1),
                  count_total: { $sum: 1 },
                },
              },
            ],
            daily: [
              { $match: { delivered_at: { $gte: startOfWeek } } },
              {
                $group: {
                  _id: {
                    y: { $year: { date: "$delivered_at", timezone: tz } },
                    m: { $month: { date: "$delivered_at", timezone: tz } },
                    d: { $dayOfMonth: { date: "$delivered_at", timezone: tz } },
                  },
                  earnings: { $sum: fee },
                  count: { $sum: 1 },
                },
              },
            ],
            recent: [
              { $sort: { delivered_at: -1 } },
              { $limit: 20 },
              { $project: { delivered_at: 1, delivery_fee: 1, total_price: 1 } },
            ],
          },
        },
      ]);

      const t = agg?.totals?.[0] || {};

      // Fill all 7 days (oldest → today), even the ones without deliveries.
      const byDay = {};
      for (const d of agg?.daily || []) byDay[`${d._id.y}-${d._id.m}-${d._id.d}`] = d;
      const daily = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(startOfToday);
        day.setDate(day.getDate() - i);
        const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
        daily.push({
          date: day.toISOString(),
          earnings: byDay[key]?.earnings || 0,
          count: byDay[key]?.count || 0,
        });
      }

      // Business name for the recent entries
      const recentIds = (agg?.recent || []).map((o) => o._id);
      const items = await OrderItem.find({ order_id: { $in: recentIds } }).populate({
        path: "product_id",
        select: "business_id",
        populate: { path: "business_id", select: "name" },
      });
      const bizByOrder = {};
      for (const it of items) {
        const name = it.product_id?.business_id?.name;
        if (name && !bizByOrder[it.order_id.toString()]) bizByOrder[it.order_id.toString()] = name;
      }

      res.json({
        message: "Rider wallet",
        data: {
          earnings: { today: t.earn_today || 0, week: t.earn_week || 0, month: t.earn_month || 0, total: t.earn_total || 0 },
          cash_collected: { today: t.cash_today || 0, week: t.cash_week || 0, month: t.cash_month || 0, total: t.cash_total || 0 },
          deliveries: { today: t.count_today || 0, week: t.count_week || 0, month: t.count_month || 0, total: t.count_total || 0 },
          daily,
          recent: (agg?.recent || []).map((o) => ({
            order_id: o._id,
            delivered_at: o.delivered_at,
            amount: o.delivery_fee || 0,
            order_total: o.total_price || 0,
            business_name: bizByOrder[o._id.toString()] || "",
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Rider's past deliveries (delivered + ones they dropped), newest first, with
  // today's / all-time totals for the Orders screen.
  async riderOrderHistory(req, res, next) {
    try {
      const riderId = req.rider._id;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page, 10) || 20));

      const filter = {
        $or: [
          { rider_id: riderId, status: OrderStatus.DELIVERED },
          // Dropped by this rider (rider_id was cleared when they cancelled)
          { "rider_cancel.rider_id": riderId },
        ],
      };

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [orders, total, totals] = await Promise.all([
        Order.find(filter)
          .populate({ path: "user_id", select: "name phone_no address" })
          .populate({ path: "address_id" })
          .sort({ updatedAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage),
        Order.countDocuments(filter),
        Order.aggregate([
          { $match: { rider_id: riderId, status: OrderStatus.DELIVERED } },
          {
            $group: {
              _id: null,
              total_count: { $sum: 1 },
              total_earnings: { $sum: { $ifNull: ["$delivery_fee", 0] } },
              today_count: {
                $sum: { $cond: [{ $gte: ["$delivered_at", startOfToday] }, 1, 0] },
              },
              today_earnings: {
                $sum: {
                  $cond: [
                    { $gte: ["$delivered_at", startOfToday] },
                    { $ifNull: ["$delivery_fee", 0] },
                    0,
                  ],
                },
              },
            },
          },
        ]),
      ]);

      const items = await OrderItem.find({ order_id: { $in: orders.map((o) => o._id) } }).populate({
        path: "product_id",
        select: "title image_url business_id",
        populate: { path: "business_id", select: "name" },
      });
      const itemsByOrder = {};
      for (const it of items) {
        (itemsByOrder[it.order_id.toString()] ||= []).push(it);
      }

      const data = orders.map((o) => {
        const u = o.user_id || {};
        const a = o.address_id && typeof o.address_id === "object" ? o.address_id : null;
        const its = itemsByOrder[o._id.toString()] || [];
        const delivered = o.status === OrderStatus.DELIVERED && String(o.rider_id || "") === String(riderId);
        return {
          _id: o._id,
          // "delivered" by this rider, or "dropped" (this rider cancelled it)
          outcome: delivered ? "delivered" : "dropped",
          status: o.status,
          total_price: o.total_price,
          delivery_fee: o.delivery_fee || 0,
          createdAt: o.createdAt,
          delivered_at: delivered ? o.delivered_at : null,
          dropped_at: !delivered ? o.rider_cancel?.at || null : null,
          drop_reason: !delivered ? o.rider_cancel?.reason || "" : "",
          business_name: its.find((i) => i.product_id?.business_id)?.product_id?.business_id?.name || "",
          customer: { name: u.name || "", phone_no: u.phone_no || "" },
          address: a ? [a.address, a.area, a.city].filter(Boolean).join(", ") : u.address || "",
          address_label: a?.label || "",
          items: its.map((i) => ({
            title: i.product_id?.title || "Item",
            image_url: i.product_id?.image_url || "",
            quantity: i.quantity,
            price: i.price,
          })),
        };
      });

      const t = totals[0] || {};
      res.json({
        message: "Rider order history",
        data,
        summary: {
          today_count: t.today_count || 0,
          today_earnings: t.today_earnings || 0,
          total_count: t.total_count || 0,
          total_earnings: t.total_earnings || 0,
        },
        page,
        has_more: page * perPage < total,
      });
    } catch (error) {
      next(error);
    }
  }

  async riderOrders(req, res, next) {
    try {
      const businessId = req.rider.business_id;
      const riderId = req.rider._id;

      let orderFilter;
      if (businessId) {
        // Restaurant rider: only the orders their restaurant assigned to them.
        orderFilter = { rider_id: riderId, status: { $in: RIDABLE } };
      } else if (await findActiveDelivery(riderId)) {
        // Platform rider already on a delivery: one order at a time, so no
        // pool — only their own orders.
        orderFilter = { rider_id: riderId, status: { $in: RIDABLE } };
      } else {
        // Platform rider: orders already assigned to them, plus the open pool —
        // unassigned orders meant for platform riders. Orders a restaurant
        // keeps for its own riders (delivery_mode "restaurant") are excluded.
        orderFilter = {
          status: { $in: RIDABLE },
          $or: [
            { rider_id: riderId },
            { rider_id: null, delivery_mode: { $ne: "restaurant" } },
          ],
        };
      }

      const orders = await Order.find(orderFilter)
        .populate({ path: "user_id", select: "name phone_no address latitude longitude" })
        .populate({ path: "address_id" })
        .sort({ createdAt: -1 })
        .limit(50);

      const allItems = await OrderItem.find({
        order_id: { $in: orders.map((o) => o._id) },
      }).populate({
        path: "product_id",
        select: "title price image_url business_id",
        // Pickup point for the delivery map
        populate: { path: "business_id", select: "name location" },
      });
      const itemsByOrder = {};
      for (const item of allItems) {
        if (!itemsByOrder[item.order_id.toString()])
          itemsByOrder[item.order_id.toString()] = [];
        itemsByOrder[item.order_id.toString()].push(item);
      }

      const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

      const serialized = orders.map((o) => {
        const u = o.user_id || {};
        const items = itemsByOrder[o._id.toString()] || [];
        const biz = items.find((i) => i.product_id?.business_id)?.product_id?.business_id || null;
        const a = o.address_id && typeof o.address_id === "object" ? o.address_id : null;

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
          // Where to collect the order (the business)
          pickup: biz
            ? {
                name: biz.name || "",
                latitude: num(biz.location?.latitude),
                longitude: num(biz.location?.longitude),
              }
            : null,
          // Where to deliver: checkout address, else the customer's saved location
          dropoff: {
            label: a?.label || "",
            address: a
              ? [a.address, a.area, a.city].filter(Boolean).join(", ")
              : u.address || "",
            latitude: num(a?.latitude) ?? num(u.latitude),
            longitude: num(a?.longitude) ?? num(u.longitude),
          },
          items: items.map((i) => ({
            product_id: i.product_id
              ? {
                  _id: i.product_id._id,
                  title: i.product_id.title,
                  price: i.product_id.price,
                  image_url: i.product_id.image_url,
                }
              : null,
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

  // Rider drops a delivery with a reason. The order is NOT cancelled: it goes
  // back to the restaurant ("preparing", no rider) and the restaurant decides —
  // cancel it, assign another rider, or send it to platform riders. For a
  // platform rider the admin is notified as well.
  async riderCancelDelivery(req, res, next) {
    try {
      const reason = String(req.body.reason || "").trim();
      if (reason.length < 3) {
        return res.status(422).json({ message: "Please give a reason for cancelling" });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (String(order.rider_id || "") !== String(req.rider._id)) {
        return res.status(403).json({ message: "This order is not assigned to you" });
      }
      if (!IN_PROGRESS.includes(order.status)) {
        return res.status(400).json({ message: "Only an ongoing delivery can be cancelled" });
      }

      const isPlatform = !req.rider.business_id;
      const at = new Date();
      order.rider_cancel = {
        rider_id: req.rider._id,
        rider_name: req.rider.name,
        rider_kind: isPlatform ? "platform" : "restaurant",
        reason: reason.slice(0, 300),
        at,
        status: "pending",
        resolution: "",
      };
      order.rider_id = null;
      // Back to the restaurant; keep it out of the platform pool until it decides.
      order.delivery_mode = "restaurant";
      order.status = OrderStatus.PREPARING;
      order.estimated_delivery_at = orderService.estimateDeliveryAt(OrderStatus.PREPARING, at);
      order.status_history.push({ status: OrderStatus.PREPARING, at });
      await order.save();

      const shortId = order._id.toString().slice(-6).toUpperCase();

      // Who must decide: the business's admins, plus platform admins for a
      // platform rider.
      const items = await OrderItem.find({ order_id: order._id }).populate({
        path: "product_id",
        select: "business_id",
      });
      const businessIds = [
        ...new Set(items.map((i) => i.product_id?.business_id?.toString()).filter(Boolean)),
      ];
      const recipients = await User.find({
        deleted_at: null,
        $or: [
          { role: UserRole.RESTAURANT_ADMIN, business_id: { $in: businessIds } },
          ...(isPlatform ? [{ role: UserRole.ADMIN }] : []),
        ],
      }).select("_id");

      const staffNote = {
        type: "rider_cancel",
        title: `Rider cancelled order #${shortId}`,
        body: `${req.rider.name}: "${reason}". Cancel the order or assign another rider.`,
        reference_id: order._id,
        reference_type: "order",
        metadata: { reason, rider_name: req.rider.name, rider_kind: order.rider_cancel.rider_kind },
      };
      recipients.forEach((u) => notifyUser(u._id.toString(), staffNote));

      notifyUser(order.user_id.toString(), {
        type: "order",
        title: "Finding you a new rider 🛵",
        body: `Your rider couldn't complete order #${shortId}. We're arranging another rider.`,
        reference_id: order._id,
        reference_type: "order",
      });

      res.json({ message: "Delivery cancelled. The restaurant has been notified.", data: { order_id: order._id } });
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
        // Restaurant rider: may act only on orders assigned to them.
        if (String(order.rider_id || "") !== String(req.rider._id)) {
          return res
            .status(403)
            .json({ message: "This order is not assigned to you" });
        }
        // ...and the order must contain one of their business's products.
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
        // Unassigned orders the restaurant keeps for its own riders are off-limits.
        if (!order.rider_id && order.delivery_mode === "restaurant") {
          return res
            .status(403)
            .json({ message: "This order is delivered by the restaurant's own riders" });
        }
      }

      // Claiming a new order: only if the rider isn't already delivering one.
      if (!order.rider_id && (await findActiveDelivery(req.rider._id, order._id))) {
        return res.status(409).json({
          message: "Finish your current delivery before accepting a new order",
        });
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

      // Only orders the rider has STARTED delivering (tapped "Start Delivery")
      // are tracked live by the customer.
      const activeOrders = await Order.find({
        rider_id: req.rider._id,
        status: OrderStatus.OUT_FOR_DELIVERY,
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
