const RiderApplication = require('./rider-application.model');
const cloudinary = require('../../config/cloudinary');
const { CLOUDINARY_ROOT_FOLDER } = require('../../config/env');
const { successResponse } = require('../../utils/api-response');

// Upload a single in-memory file buffer to Cloudinary and resolve its URL.
function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', unique_filename: true },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

// Multipart fields carrying the images (see routes .fields config).
const IMAGE_FIELDS = [
  { field: 'cnic_front_image', key: 'cnic_front_image' },
  { field: 'cnic_back_image', key: 'cnic_back_image' },
  { field: 'photo_image', key: 'photo_image' },
  { field: 'vehicle_image', key: 'vehicle_image' },
];

const ALLOWED_VEHICLES = ['Bike', 'Bicycle', 'Scooter'];

// Validate the text fields of a rider application. Returns an errors object
// (empty when everything is valid).
function validateRiderFields({ name, phone_no, cnic, address, vehicle_type }) {
  const errors = {};

  const trimmedName = String(name || '').trim();
  if (!trimmedName) errors.name = 'Name is required';
  else if (trimmedName.length < 3) errors.name = 'Name must be at least 3 characters';
  else if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) errors.name = 'Name can only contain letters';

  // Accept +92XXXXXXXXXX / 03XXXXXXXXX / 3XXXXXXXXX — normalise to 10 digits.
  const phoneDigits = String(phone_no || '').replace(/\D/g, '');
  const normalisedPhone = phoneDigits
    .replace(/^0092/, '')
    .replace(/^92/, '')
    .replace(/^0/, '');
  if (!phone_no) errors.phone_no = 'Phone number is required';
  else if (!/^3\d{9}$/.test(normalisedPhone))
    errors.phone_no = 'Enter a valid Pakistani mobile number';

  const cnicDigits = String(cnic || '').replace(/\D/g, '');
  if (!cnic) errors.cnic = 'CNIC is required';
  else if (cnicDigits.length !== 13) errors.cnic = 'CNIC must be 13 digits';

  const trimmedAddress = String(address || '').trim();
  if (!trimmedAddress) errors.address = 'Address is required';
  else if (trimmedAddress.length < 10) errors.address = 'Enter a more complete address';

  if (!vehicle_type) errors.vehicle_type = 'Vehicle type is required';
  else if (!ALLOWED_VEHICLES.includes(String(vehicle_type)))
    errors.vehicle_type = 'Invalid vehicle type';

  return errors;
}

async function store(req, res, next) {
  try {
    const { name, phone_no, cnic, address, vehicle_type } = req.body;

    const errors = validateRiderFields({ name, phone_no, cnic, address, vehicle_type });

    // All four documents are required on the initial application.
    const files = req.files || {};
    IMAGE_FIELDS.forEach(({ field }) => {
      if (!files[field]?.[0]) errors[field] = 'This document is required';
    });

    if (Object.keys(errors).length) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    // Prevent duplicate applications while one is still pending or approved.
    if (req.user?._id) {
      const existing = await RiderApplication.findOne({
        user_id: req.user._id,
        status: { $in: ['pending', 'approved'] },
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: 'You already have an active rider application', data: existing });
      }
    }

    // Upload the images to Cloudinary and collect their URLs.
    const folder = `${CLOUDINARY_ROOT_FOLDER}/riders`;
    const imageUrls = {};
    await Promise.all(
      IMAGE_FIELDS.map(async ({ field, key }) => {
        const file = files[field]?.[0];
        if (file) {
          const result = await uploadBuffer(file, folder);
          imageUrls[key] = result.secure_url;
        }
      })
    );

    const application = await RiderApplication.create({
      user_id: req.user?._id,
      name,
      phone_no,
      cnic,
      address,
      vehicle_type,
      ...imageUrls,
    });

    successResponse(res, application, 'Rider application submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function index(req, res, next) {
  try {
    const applications = await RiderApplication.find().sort({ createdAt: -1 });
    successResponse(res, applications, 'Rider applications');
  } catch (error) {
    next(error);
  }
}

// The current user's latest rider application (null if they haven't applied).
async function myApplication(req, res, next) {
  try {
    const application = await RiderApplication.findOne({ user_id: req.user?._id }).sort({
      createdAt: -1,
    });
    successResponse(res, application, 'My rider application');
  } catch (error) {
    next(error);
  }
}

// Rider re-uploads the documents the admin asked for. Each provided image
// replaces the old one and that document goes back to `pending` for review.
async function reupload(req, res, next) {
  try {
    const application = await RiderApplication.findOne({ user_id: req.user?._id }).sort({
      createdAt: -1,
    });
    if (!application) return res.status(404).json({ message: 'No application found' });

    const files = req.files || {};
    const providedFields = IMAGE_FIELDS.filter(({ field }) => files[field]?.[0]);
    if (providedFields.length === 0) {
      return res.status(422).json({ message: 'No documents provided' });
    }

    const folder = `${CLOUDINARY_ROOT_FOLDER}/riders`;
    await Promise.all(
      providedFields.map(async ({ field, key }) => {
        const result = await uploadBuffer(files[field][0], folder);
        application[key] = result.secure_url;
        if (!application.documents) application.documents = {};
        application.documents[key] = { status: 'pending', note: '' };
      })
    );

    // Any freshly-submitted docs move the whole application back to pending.
    application.status = 'pending';
    await application.save();

    successResponse(res, application, 'Documents re-uploaded successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = { store, index, myApplication, reupload };
