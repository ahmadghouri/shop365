const mongoose = require('mongoose');
const { ComplaintStatus } = require('../../common/enums');

const complaintSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  household_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
  town_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Town', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.PENDING },
}, { timestamps: true });

complaintSchema.index({ town_id: 1 });
complaintSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Complaint', complaintSchema);
