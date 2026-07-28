const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
  address: { type: String, required: true },
  town_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Town', required: true },
}, { timestamps: true });

householdSchema.index({ town_id: 1 });
householdSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Household', householdSchema);
