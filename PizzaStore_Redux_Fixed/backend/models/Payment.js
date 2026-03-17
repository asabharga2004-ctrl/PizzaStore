const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMode:   { type: String, enum: ['cash', 'card', 'upi'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paidAmount:    { type: Number, required: true },
  transactionId: { type: String, default: '' },
  paidAt:        { type: Date, default: null }
});

module.exports = mongoose.model('Payment', paymentSchema);
