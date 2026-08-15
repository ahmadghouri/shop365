const AuthService = require("./auth.service");
const Town = require("../towns/town.model");
const Address = require("../addresses/address.model");
const User = require("../users/user.model");

const authService = new AuthService();

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    // Match Laravel: { message, token, data }
    res.json({ message: "Registered Successfull", token, data: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    // Match Laravel: returns user with notifications
    res.json({ message: "Login Successfull", token, data: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function addDetails(req, res, next) {
  try {
    const { name, town, address } = req.body;
    const user = req.user;

    const townDoc = await Town.findOne({ town_name: town });
    if (!townDoc) {
      return res.status(404).json({ message: "Town not found" });
    }

    // create address record for user and set as active
    const addr = await Address.create({
      user_id: user._id,
      label: "Primary",
      address,
      city: town,
      is_active: true,
    });

    user.name = name;
    user.city = town;
    user.town_id = townDoc._id;
    user.address_id = addr._id;
    await user.save();

    res.json({ message: "Details updated successfully", data: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = req.user;
    const response = { user: user.toJSON() };

    if (user.household_id) {
      // keep legacy household handling removed — prefer Address model
      const Address = require("../addresses/address.model");
      const addr = await Address.findOne({
        user_id: user._id,
        is_active: true,
      });
      if (addr) response.household = addr.toJSON();
    }
    if (user.town_id) {
      const town = await Town.findById(user.town_id);
      if (town) response.town = town.toJSON();
    }

    res.json({ message: "User Profile", data: response });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, addDetails, profile };
