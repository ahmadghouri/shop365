const User = require('../users/user.model');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { UserRole } = require('../../common/enums');

class AuthService {
  async register(data) {
    const existing = await User.findOne({ phone_no: data.phone_no });
    if (existing) {
      const error = new Error('Phone number already registered');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      phone_no: data.phone_no,
      password: await hashPassword(data.password),
      role: UserRole.END_USER,
    });

    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async login(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async adminLogin(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.RESTAURANT_ADMIN) {
      const error = new Error('Unauthorized access');
      error.statusCode = 403;
      throw error;
    }
    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async updatePassword(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.password = await hashPassword(data.password);
    await user.save();
    return user;
  }
}

module.exports = AuthService;
