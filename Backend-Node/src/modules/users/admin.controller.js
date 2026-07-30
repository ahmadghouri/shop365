const mongoose = require('mongoose');
const User = require('./user.model');
const Business = require('../businesses/business.model');
const { successResponse } = require('../../utils/api-response');
const { hashPassword } = require('../../utils/password');
const { UserRole } = require('../../common/enums');

async function createTownAdmin(req, res, next) {
  try {
    const { name, phone_no, email, password, business, business_id } = req.body;
    let businessDoc;

    if (business_id && mongoose.isValidObjectId(business_id)) {
      businessDoc = await Business.findById(business_id);
    }
    if (!businessDoc && business) {
      businessDoc = await Business.findOne({ name: business });
    }
    if (!businessDoc) {
      return res.status(404).json({ status: false, message: 'Business not found' });
    }

    const admin = await User.create({
      name,
      phone_no,
      email: email ? String(email).trim().toLowerCase() : undefined,
      password: await hashPassword(password),
      role: UserRole.RESTAURANT_ADMIN,
      business_id: businessDoc._id,
    });
    successResponse(res, { user: admin }, 'Admin created successfully', 201);
  } catch (error) { next(error); }
}

async function getAdmins(req, res, next) {
  try {
    const admins = await User.aggregate([
      { $match: { role: UserRole.RESTAURANT_ADMIN, deleted_at: null } },
      { $lookup: { from: 'businesses', localField: 'business_id', foreignField: '_id', as: 'business' } },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: 1, phone_no: 1, createdAt: 1, business_name: '$business.name' } },
    ]);
    successResponse(res, admins, 'success');
  } catch (error) { next(error); }
}

async function updateAdmin(req, res, next) {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (req.body.name) admin.name = req.body.name;
    if (req.body.phone_no) admin.phone_no = req.body.phone_no;
    await admin.save();
    res.json({ message: 'Admin updated successfully', admin: admin.toJSON() });
  } catch (error) { next(error); }
}

module.exports = { createTownAdmin, getAdmins, updateAdmin };
