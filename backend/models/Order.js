const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addressId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  items:       [orderItemSchema],
  totalAmount: { type: Number, required: true },
  orderStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'delivered', 'cancelled'], default: 'pending' },
  deliveryMode:{ type: String, enum: ['delivery', 'pickup'], default: 'delivery' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
