const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Message', messageSchema);
