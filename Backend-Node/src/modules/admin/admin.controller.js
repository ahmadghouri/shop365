const User = require('../users/user.model');
const Business = require('../businesses/business.model');
const Order = require('../orders/order.model');
const Voucher = require('../vouchers/voucher.model');
const Internship = require('../internship-applications/internship-application.model');
const { successResponse } = require('../../utils/api-response');

async function createVoucher(req, res, next) {
  try {
    const voucher = await Voucher.create(req.body);
    successResponse(res, voucher, 'Voucher created successfully', 201);
  } catch (error) { next(error); }
}

async function getVoucher(req, res, next) {
  try {
    const vouchers = await Voucher.find().populate('business_id', 'name').sort({ createdAt: -1 });
    successResponse(res, vouchers, 'Vouchers retrieved successfully');
  } catch (error) { next(error); }
}

async function deleteVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) { next(error); }
}

async function superAdminOrders(req, res, next) {
  try {
    const orderController = require('../orders/order.controller');
    req.params.businessId = req.params.id;
    await orderController.superAdminOrders(req, res, next);
  } catch (error) { next(error); }
}

async function getGroceryOrders(req, res, next) {
  try {
    const orders = await Order.find().populate('user_id').sort({ createdAt: -1 });
    successResponse(res, { orders }, 'Grocery orders retrieved successfully');
  } catch (error) { next(error); }
}

async function getBusinessStats(req, res, next) {
  try {
    const businesses = await Business.find();
    successResponse(res, { stats: { totalBusinesses: businesses.length } }, 'Stats retrieved successfully');
  } catch (error) { next(error); }
}

async function createTownAdmin(req, res, next) {
  try {
    const adminCtrl = require('../users/admin.controller');
    await adminCtrl.createTownAdmin(req, res, next);
  } catch (error) { next(error); }
}

async function internshipApplications(req, res, next) {
  try {
    const applications = await Internship.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) { next(error); }
}

async function usersPreviousTwoDays(req, res, next) {
  try {
    const userController = require('../users/user.controller');
    await userController.usersRegisteredToday(req, res, next);
  } catch (error) { next(error); }
}

async function usersIndex(req, res, next) {
  try {
    const userController = require('../users/user.controller');
    await userController.index(req, res, next);
  } catch (error) { next(error); }
}

async function usersShow(req, res, next) {
  try {
    const userController = require('../users/user.controller');
    await userController.show(req, res, next);
  } catch (error) { next(error); }
}

async function usersDestroy(req, res, next) {
  try {
    const userController = require('../users/user.controller');
    await userController.destroy(req, res, next);
  } catch (error) { next(error); }
}

async function getVendors(req, res, next) {
  try {
    const adminCtrl = require('../users/admin.controller');
    await adminCtrl.getAdmins(req, res, next);
  } catch (error) { next(error); }
}

async function updateAdmin(req, res, next) {
  try {
    const adminCtrl = require('../users/admin.controller');
    await adminCtrl.updateAdmin(req, res, next);
  } catch (error) { next(error); }
}

module.exports = {
  createVoucher, getVoucher, deleteVoucher, superAdminOrders, getGroceryOrders,
  getBusinessStats, createTownAdmin, internshipApplications, usersPreviousTwoDays,
  usersIndex, usersShow, usersDestroy, getVendors, updateAdmin,
};
