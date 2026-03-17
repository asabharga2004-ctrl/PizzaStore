const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');
const router  = express.Router();

// GET my messages
router.get('/', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: msgs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
