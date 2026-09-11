const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: 'general' },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  read: { type: Boolean, default: false },
  reference_id: { type: mongoose.Schema.Types.ObjectId },
  reference_type: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);