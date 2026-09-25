const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  // Optional: vendor-managed riders belong to a business; platform riders
  // (approved via a rider application) may not have one yet.
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  // Links a rider created from a public rider application back to it.
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RiderApplication', index: true },
  // parcel = delivery person, ride = InDrive-style driver
  kind: { type: String, enum: ['parcel', 'ride'], default: 'parcel' },
  name: { type: String, required: true, trim: true },
  // Login identity — riders authenticate against this collection directly, they
  // are NOT linked to the User model.
  phone_no: { type: String, required: true, trim: true, index: true },
  password: { type: String },
  image: { type: String, default: '' },
  cnic: { type: String, trim: true },
  license_no: { type: String, trim: true },
  vehicle_type: { type: String, enum: ['bike', 'car'], default: 'bike' },
  vehicle_no: { type: String, trim: true },
  // active = can log in and receive deliveries; inactive = access revoked.
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  // Set when a rider is removed; a soft-deleted rider can no longer log in.
  deleted_at: { type: Date, default: null },
  // Last known GPS position, updated live while the rider is on a delivery.
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    updated_at: { type: Date, default: null },
  },
}, { timestamps: true });

riderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('Rider', riderSchema);
