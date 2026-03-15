const express = require('express');
const Order   = require('../models/Order');
const Cart    = require('../models/Cart');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const { auth, adminOnly } = require('../middleware/auth');
const router  = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { addressId, deliveryMode, paymentMode } = req.body;
    if (!addressId) return res.status(400).json({ success: false, message: 'addressId required.' });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty.' });

    const order = await Order.create({
      userId: req.user.id, addressId,
      items: cart.items, totalAmount: cart.totalAmount,
      deliveryMode: deliveryMode || 'delivery'
    });

    
    await Payment.create({
      orderId: order._id, userId: req.user.id,
      paymentMode: paymentMode || 'cash',
      paidAmount: cart.totalAmount
    });

   
    await Message.create({
      userId: req.user.id, orderId: order._id,
      message: 'Your order has been placed successfully. Please wait for confirmation.'
    });

    
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], totalAmount: 0 });

    res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('addressId').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').populate('addressId').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email').populate('addressId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { orderStatus, messageText } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

   
    const msg = messageText || `Your order has been ${orderStatus}.`;
    await Message.create({ userId: order.userId, orderId: order._id, message: msg });

    res.json({ success: true, message: 'Order status updated.', data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.orderStatus !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });

    order.orderStatus = 'cancelled';
    await order.save();
    await Message.create({ userId: req.user.id, orderId: order._id, message: 'Your order has been cancelled.' });

    res.json({ success: true, message: 'Order cancelled.', data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.get('/admin/revenue', auth, adminOnly, async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { orderStatus: { $in: ['accepted', 'delivered'] } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    res.json({ success: true, data: revenue });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
