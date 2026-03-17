const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  houseNumber: { type: String, required: true },
  street:      { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  pincode:     { type: String, required: true },
  landmark:    { type: String, default: '' },
  isDefault:   { type: Boolean, default: false }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Address', addressSchema);
