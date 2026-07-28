const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  portfolio_url: { type: String },
  academic_info: { type: String },
}, { timestamps: true });

internshipSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('InternshipApplication', internshipSchema);
