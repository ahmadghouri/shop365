const userService = require("./user.service");
const User = require("./user.model");
const { successResponse } = require("../../utils/api-response");
const Order = require("../orders/order.model");

async function refreshUser(req, res, next) {
  try {
    const user = await userService.getById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function index(req, res, next) {
  try {
    const totalUsers = await User.countDocuments({
      role: "end_user",
      deleted_at: null,
    });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysUser = await User.countDocuments({
      role: "end_user",
      deleted_at: null,
      createdAt: { $gte: todayStart },
    });
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const users = await User.find({ role: "end_user", deleted_at: null })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    // attach active address from Address model instead of legacy household
    const Address = require("../addresses/address.model");
    await Promise.all(
      users.map(async (u) => {
        try {
          const addr = await Address.findOne({
            user_id: u._id,
            is_active: true,
          });
          if (addr) {
            u.household_id = {
              address: addr.address,
              town_id: addr.city || null,
            };
          } else {
            u.household_id = null;
          }
        } catch (e) {
          u.household_id = null;
        }
      }),
    );
    const total = await User.countDocuments({
      role: "end_user",
      deleted_at: null,
    });
    res.json({
      total_users_count: totalUsers,
      today_users_count: todaysUser,
      users: {
        current_page: page,
        data: users,
        from: skip + 1,
        last_page: Math.ceil(total / limit),
        per_page: limit,
        to: Math.min(skip + limit, total),
        total: total,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const Cart = require("../cart/cart.model");
    await Cart.deleteMany({ user_id: user._id });
    await Order.deleteMany({ user_id: user._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

async function usersRegisteredToday(req, res, next) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysUserCount = await User.countDocuments({
      role: "end_user",
      deleted_at: null,
      createdAt: { $gte: todayStart },
    });
    const usersRegisteredToday = await User.find({
      role: "end_user",
      deleted_at: null,
      createdAt: { $gte: todayStart },
    }).sort({ createdAt: -1 });
    const Address2 = require("../addresses/address.model");
    await Promise.all(
      usersRegisteredToday.map(async (u) => {
        try {
          const addr = await Address2.findOne({
            user_id: u._id,
            is_active: true,
          });
          if (addr)
            u.household_id = {
              address: addr.address,
              town_id: addr.city || null,
            };
          else u.household_id = null;
        } catch (e) {
          u.household_id = null;
        }
      }),
    );
    res.json({
      today_users_count: todaysUserCount,
      users: usersRegisteredToday,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUsers(req, res, next) {
  try {
    const appLaunchDate = new Date("2024-09-30 15:26:29");
    await User.deleteMany({
      role: "end_user",
      createdAt: { $lt: appLaunchDate },
    });
    res.json({ message: "End user accounts deleted successfully." });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone_no) user.phone_no = req.body.phone_no;

    // If address fields provided, persist into Address model and link via address_id
    const Address = require("../addresses/address.model");
    if (req.body.address || req.body.street || req.body.area || req.body.city) {
      const addrText =
        req.body.address ||
        [
          ...new Set(
            [req.body.street, req.body.area, req.body.city].filter(Boolean),
          ),
        ].join(", ");
      // create or update active address for user
      let addr = await Address.findOne({ user_id: user._id, is_active: true });
      if (addr) {
        addr.address = addrText;
        addr.street = req.body.street || addr.street || "";
        addr.area = req.body.area || addr.area || "";
        addr.city = req.body.city || addr.city || "";
        addr.latitude = Object.prototype.hasOwnProperty.call(
          req.body,
          "latitude",
        )
          ? req.body.latitude
          : addr.latitude;
        addr.longitude = Object.prototype.hasOwnProperty.call(
          req.body,
          "longitude",
        )
          ? req.body.longitude
          : addr.longitude;
        await addr.save();
      } else {
        addr = await Address.create({
          user_id: user._id,
          label: "Primary",
          address: addrText,
          street: req.body.street || "",
          area: req.body.area || "",
          city: req.body.city || "",
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
          is_active: true,
        });
      }
      user.address_id = addr._id;
    }

    await user.save();
    res.json({
      message: "User and address updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  refreshUser,
  index,
  show,
  destroy,
  usersRegisteredToday,
  deleteUsers,
  updateUser,
};
