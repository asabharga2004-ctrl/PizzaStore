const express = require('express');
const Address = require('../models/Address');
const { auth } = require('../middleware/auth');
const router  = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const addrs = await Address.find({ userId: req.user.id });
    res.json({ success: true, data: addrs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.post('/', auth, async (req, res) => {
  try {
    const { houseNumber, street, city, state, pincode, landmark, isDefault } = req.body;
    if (!houseNumber || !street || !city || !state || !pincode)
      return res.status(400).json({ success: false, message: 'All address fields required.' });
    if (isDefault) await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    const addr = await Address.create({ userId: req.user.id, houseNumber, street, city, state, pincode, landmark, isDefault });
    res.status(201).json({ success: true, data: addr });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
