const mongoose = require('mongoose');
const { UserRole } = require('../../common/enums');

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone_no: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.END_USER },
  image: { type: String, default: '' },
  household_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
  town_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Town' },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  address: { type: String, trim: true },
  street: { type: String, trim: true },
  area: { type: String, trim: true },
  city: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  points: { type: Number, default: 0 },
  expo_push_token: { type: String, default: null, index: true },
  push_platform: { type: String, enum: ['android', 'ios', null], default: null },
  email_verified_at: { type: Date },
  deleted_at: { type: Date },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    delete ret.expo_push_token;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
