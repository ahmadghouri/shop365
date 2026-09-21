const userService = require('./user.service');
const User = require('./user.model');
const { successResponse } = require('../../utils/api-response');
const { uploadToCloudinary } = require('../../utils/cloudinary-upload');
const Order = require('../orders/order.model');

async function refreshUser(req, res, next) {
  try {
    const user = await userService.getById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function registerPushToken(req, res, next) {
  try {
    const { token, platform } = req.body;
    if (!token || typeof token !== 'string' || !['android', 'ios'].includes(platform)) {
      return res.status(422).json({ message: 'A valid token and platform are required' });
    }

    req.user.expo_push_token = token;
    req.user.push_platform = platform;
    await req.user.save();
    res.json({ message: 'Push token registered' });
  } catch (error) {
    next(error);
  }
}

async function index(req, res, next) {
  try {
    const totalUsers = await User.countDocuments({ role: 'end_user', deleted_at: null });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysUser = await User.countDocuments({
      role: 'end_user',
      deleted_at: null,
      createdAt: { $gte: todayStart },
    });
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const users = await User.find({ role: 'end_user', deleted_at: null })
      .populate({
        path: 'household_id',
        select: 'address town_id',
        populate: { path: 'town_id', select: 'town_name' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments({ role: 'end_user', deleted_at: null });
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
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const Cart = require('../cart/cart.model');
    await Cart.deleteMany({ user_id: user._id });
    await Order.deleteMany({ user_id: user._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function usersRegisteredToday(req, res, next) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysUserCount = await User.countDocuments({
      role: 'end_user',
      deleted_at: null,
      createdAt: { $gte: todayStart },
    });
    const usersRegisteredToday = await User.find({
      role: 'end_user',
      deleted_at: null,
      createdAt: { $gte: todayStart },
    })
      .populate({
        path: 'household_id',
        select: 'address town_id',
        populate: { path: 'town_id', select: 'town_name' },
      })
      .sort({ createdAt: -1 });
    res.json({ today_users_count: todaysUserCount, users: usersRegisteredToday });
  } catch (error) {
    next(error);
  }
}

async function deleteUsers(req, res, next) {
  try {
    const appLaunchDate = new Date('2024-09-30 15:26:29');
    await User.deleteMany({ role: 'end_user', createdAt: { $lt: appLaunchDate } });
    res.json({ message: 'End user accounts deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone_no) user.phone_no = req.body.phone_no;
    if (req.body.date_of_birth) user.date_of_birth = req.body.date_of_birth;

    const locationFields = ['street', 'area', 'city', 'latitude', 'longitude'];
    for (const field of locationFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    }

    if (req.body.address) {
      user.address = req.body.address;

      // Keep an existing legacy household address in sync, but never create
      // one with a numeric town ID. New mobile/web clients use user.address.
      if (user.household_id && /^[0-9a-fA-F]{24}$/.test(String(user.household_id))) {
        const Household = require('../households/household.model');
        const household = await Household.findById(user.household_id);
        if (household) {
          household.address = req.body.address;
          await household.save();
        }
      }
    } else if (req.body.street || req.body.area || req.body.city) {
      user.address = [
        ...new Set([req.body.street, req.body.area, req.body.city].filter(Boolean)),
      ].join(', ');
    }

    await user.save();
    res.json({ message: 'User and address updated successfully', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const result = await uploadToCloudinary(req.file, 'avatars');
    user.image = result.secure_url;
    await user.save();
    res.json({ message: 'Profile image updated successfully', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  refreshUser,
  registerPushToken,
  index,
  show,
  destroy,
  usersRegisteredToday,
  deleteUsers,
  updateUser,
  uploadAvatar,
};
