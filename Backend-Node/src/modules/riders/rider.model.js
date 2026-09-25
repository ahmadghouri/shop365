const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  // Optional: vendor-managed riders belong to a business; platform riders
  // (approved via a rider application) may not have one yet.
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  // Links a rider created from a public rider application back to it.
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RiderApplication', index: true },
  // parcel = delivery person, ride = InDrive-style driver
  kind: { type: String, enum: ['parcel', 'ride'], default: 'parcel' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  phone_no: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  cnic: { type: String, trim: true },
  license_no: { type: String, trim: true },
  vehicle_type: { type: String, enum: ['bike', 'car'], default: 'bike' },
  vehicle_no: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

riderSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Rider', riderSchema);