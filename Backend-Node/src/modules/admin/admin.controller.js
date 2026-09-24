const mongoose = require('mongoose');
const User = require('../users/user.model');
const Business = require('../businesses/business.model');
const Category = require('../categories/category.model');
const Order = require('../orders/order.model');
const Voucher = require('../vouchers/voucher.model');
const Internship = require('../internship-applications/internship-application.model');
const RiderApplication = require('../rider-applications/rider-application.model');
const Rider = require('../riders/rider.model');
const { UserRole } = require('../../common/enums');
const { successResponse } = require('../../utils/api-response');
const { hashPassword } = require('../../utils/password');

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

async function createProvider(req, res, next) {
  let business;
  try {
    const name = String(req.body.name || '').trim();
    const phoneNo = String(req.body.phone_no || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const categoryId = req.body.category_id;
    const parentId = req.body.parent_id;

    if (!name || !phoneNo || !email || !password || !categoryId) {
      return res.status(422).json({ status: false, message: 'Name, provider type, phone number, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(422).json({ status: false, message: 'Password must be at least 6 characters' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(422).json({ status: false, message: 'Please enter a valid email address' });
    }
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(422).json({ status: false, message: 'Please select a valid provider type' });
    }

    const category = await Category.findOne({ _id: categoryId, status: 'active' });
    if (!category) {
      return res.status(422).json({ status: false, message: 'Selected provider type is not available' });
    }

    if (parentId) {
      if (!mongoose.isValidObjectId(parentId) || !(await Business.exists({ _id: parentId }))) {
        return res.status(422).json({ status: false, message: 'Selected parent business is not valid' });
      }
    }

    const existingPhone = await User.exists({ phone_no: phoneNo });
    if (existingPhone) {
      return res.status(409).json({ status: false, message: 'This phone number is already registered' });
    }
    const existingEmail = await User.exists({ email });
    if (existingEmail) {
      return res.status(409).json({ status: false, message: 'This email is already registered' });
    }

    business = await Business.create({
      name,
      type: category.name,
      category_id: category._id,
      ...(typeof req.body.image === 'string' && req.body.image ? { image: req.body.image } : {}),
      ...(parentId ? { parent_id: parentId } : {}),
    });

    await User.create({
      name,
      phone_no: phoneNo,
      email,
      password: await hashPassword(password),
      role: UserRole.RESTAURANT_ADMIN,
      business_id: business._id,
    });

    successResponse(res, business, 'Provider and login account created successfully', 201);
  } catch (error) {
    if (business) await Business.findByIdAndDelete(business._id).catch(() => {});
    if (error.code === 11000) {
      return res.status(409).json({ status: false, message: 'Phone number or email is already registered' });
    }
    next(error);
  }
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

async function riderApplications(req, res, next) {
  try {
    const applications = await RiderApplication.find()
      .populate('user_id', 'name email phone_no')
      .sort({ createdAt: -1 });
    successResponse(res, applications, 'Rider applications');
  } catch (error) { next(error); }
}

async function riderApplicationShow(req, res, next) {
  try {
    const application = await RiderApplication.findById(req.params.id).populate(
      'user_id',
      'name email phone_no'
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    successResponse(res, application, 'Rider application');
  } catch (error) { next(error); }
}

async function updateRiderApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(422).json({ message: 'Invalid status' });
    }
    const application = await RiderApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Option A: on approval the applicant's own account becomes a RIDER (no
    // separate business/login) and a Rider record is created/linked from the
    // application. Reversing the decision downgrades the user and deactivates
    // the linked rider.
    if (status === 'approved') {
      if (application.user_id) {
        await User.updateOne({ _id: application.user_id }, { role: UserRole.RIDER });
      }

      // Map the application's vehicle to the Rider model's enum.
      const vehicleType = /car/i.test(application.vehicle_type || '') ? 'car' : 'bike';

      // Create the Rider record once, or reactivate/refresh it if it exists.
      await Rider.findOneAndUpdate(
        { application_id: application._id },
        {
          application_id: application._id,
          user_id: application.user_id,
          kind: 'parcel',
          name: application.name,
          phone_no: application.phone_no,
          image: application.photo_image || '',
          cnic: application.cnic,
          vehicle_type: vehicleType,
          status: 'active',
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      // Only downgrade if they were made a rider by this flow.
      if (application.user_id) {
        await User.updateOne(
          { _id: application.user_id, role: UserRole.RIDER },
          { role: UserRole.END_USER }
        );
      }
      // Deactivate the linked rider record (keep it for history).
      await Rider.updateOne({ application_id: application._id }, { status: 'inactive' });
    }

    successResponse(res, application, 'Rider application updated');
  } catch (error) { next(error); }
}

const DOCUMENT_KEYS = ['cnic_front_image', 'cnic_back_image', 'photo_image', 'vehicle_image'];

// Approve / reject a single uploaded document (with an optional note).
async function updateRiderDocumentStatus(req, res, next) {
  try {
    const { doc, status, note } = req.body;
    if (!DOCUMENT_KEYS.includes(doc)) {
      return res.status(422).json({ message: 'Invalid document key' });
    }
    if (!['pending', 'approved', 'rejected', 'resend'].includes(status)) {
      return res.status(422).json({ message: 'Invalid status' });
    }
    const update = {
      [`documents.${doc}.status`]: status,
      [`documents.${doc}.note`]: note || '',
    };
    const application = await RiderApplication.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    successResponse(res, application, 'Document status updated');
  } catch (error) { next(error); }
}

// Save the admin's free-form message to the applicant.
async function updateRiderApplicationMessage(req, res, next) {
  try {
    const { admin_message } = req.body;
    const application = await RiderApplication.findByIdAndUpdate(
      req.params.id,
      { admin_message: admin_message || '' },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    successResponse(res, application, 'Message saved');
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
  getBusinessStats, createProvider, createTownAdmin, internshipApplications, usersPreviousTwoDays,
  usersIndex, usersShow, usersDestroy, getVendors, updateAdmin,
  riderApplications, riderApplicationShow, updateRiderApplicationStatus,
  updateRiderDocumentStatus, updateRiderApplicationMessage,
};
