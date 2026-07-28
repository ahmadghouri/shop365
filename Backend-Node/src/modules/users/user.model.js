const mongoose = require('mongoose');
const { UserRole } = require('../../common/enums');

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone_no: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.END_USER },
  household_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
  town_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Town' },
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  points: { type: Number, default: 0 },
  email_verified_at: { type: Date },
  deleted_at: { type: Date },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
