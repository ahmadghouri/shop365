const mongoose = require('mongoose');

const townSchema = new mongoose.Schema({
  town_name: { type: String, required: true },
}, { timestamps: true });

townSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Town', townSchema);
