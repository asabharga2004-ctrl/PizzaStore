const express = require('express');
const Payment = require('../models/Payment');
const { auth, adminOnly } = require('../middleware/auth');
const router  = express.Router();

// GET payment by orderId
router.get('/:orderId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.json({ success: true, data: payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT mark payment done
router.put('/:orderId/pay', auth, async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { orderId: req.params.orderId },
      { paymentStatus: 'paid', transactionId: req.body.transactionId || 'TXN' + Date.now(), paidAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'Payment recorded.', data: payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
