const User = require("../users/user.model");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");
const { UserRole } = require("../../common/enums");

class AuthService {
  async register(data) {
    const existing = await User.findOne({ phone_no: data.phone_no });
    if (existing) {
      const error = new Error("Phone number already registered");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name: data.name || null,
      phone_no: data.phone_no,
      email: data.email || null,
      password: await hashPassword(data.password),
      role: UserRole.END_USER,
    });

    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async login(data) {
    let user = await User.findOne({ phone_no: data.phone_no });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // Attach active address (replacing legacy household flow)
    try {
      const Address = require("../addresses/address.model");
      const addr = await Address.findOne({
        user_id: user._id,
        is_active: true,
      });
      if (addr) {
        user.address_id = addr._id;
        user.household_id = addr.toJSON ? addr.toJSON() : addr; // keep response shape
      }
    } catch (_) {
      /* skip if lookup fails */
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async adminLogin(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.RESTAURANT_ADMIN
    ) {
      const error = new Error("Unauthorized access");
      error.statusCode = 403;
      throw error;
    }
    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async updatePassword(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.password = await hashPassword(data.password);
    await user.save();
    return user;
  }
}

module.exports = AuthService;
