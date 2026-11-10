const mongoose = require('mongoose');

const riderApplicationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // Set when a restaurant requested this rider from its dashboard. On approval
    // the rider becomes that restaurant's own rider.
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    // Login password chosen by the restaurant (bcrypt hash). Public applicants
    // have none — their initial password is their CNIC.
    password: { type: String, select: false },
    license_no: { type: String, default: '', trim: true },
    name: { type: String, required: true, trim: true },
    phone_no: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    vehicle_type: { type: String, required: true, trim: true },
    vehicle_no: { type: String, default: '', trim: true },
    // Cloudinary image URLs
    cnic_front_image: { type: String, default: '' },
    cnic_back_image: { type: String, default: '' },
    photo_image: { type: String, default: '' },
    vehicle_image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Per-document verification. Each key maps to one uploaded image and lets
    // the admin approve/reject that specific document with an optional note.
    // status `resend` means the admin asked the rider to upload it again.
    documents: {
      cnic_front_image: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'resend'],
          default: 'pending',
        },
        note: { type: String, default: '' },
      },
      cnic_back_image: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'resend'],
          default: 'pending',
        },
        note: { type: String, default: '' },
      },
      photo_image: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'resend'],
          default: 'pending',
        },
        note: { type: String, default: '' },
      },
      vehicle_image: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'resend'],
          default: 'pending',
        },
        note: { type: String, default: '' },
      },
    },
    // A free-form message from the admin to the applicant.
    admin_message: { type: String, default: '' },
  },
  { timestamps: true }
);

riderApplicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('RiderApplication', riderApplicationSchema);
