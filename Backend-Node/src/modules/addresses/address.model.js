const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label:     { type: String, required: true, trim: true },
    address:   { type: String, required: true, trim: true },
    street:    { type: String, trim: true, default: '' },
    area:      { type: String, trim: true, default: '' },
    city:      { type: String, trim: true, default: '' },
    latitude:  { type: Number },
    longitude: { type: Number },
    is_active: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
