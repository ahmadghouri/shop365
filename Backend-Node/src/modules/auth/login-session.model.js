const mongoose = require('mongoose');

const geoSchema = new mongoose.Schema(
  {
    city:      { type: String, default: '' },
    latitude:  { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const loginSessionSchema = new mongoose.Schema(
  {
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform:   { type: String, enum: ['android', 'ios', 'web', 'unknown'], default: 'unknown' },
    device:     { type: String, default: 'Unknown device' },
    ip_address: { type: String, default: '' },
    user_agent: { type: String, default: '' },
    geo: { type: geoSchema, default: () => ({}) },   // { city, latitude, longitude }
    revoked_at:   { type: Date, default: null },
    logged_out_at: { type: Date, default: null },
    logged_in_at:  { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginSession', loginSessionSchema);
