const express = require('express');
const MenuItem = require('../models/MenuItem');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all menu items - supports ?category=id&search=name
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.categoryId = req.query.category;
    if (req.query.search)   filter.name = { $regex: req.query.search, $options: 'i' };
    const items = await MenuItem.find(filter).populate('categoryId', 'categoryName').sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('categoryId', 'categoryName');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create menu item (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, categoryId, image, isAvailable } = req.body;
    if (!name || !price || !categoryId)
      return res.status(400).json({ success: false, message: 'name, price, categoryId required.' });
    const item = await MenuItem.create({ name, description, price, categoryId, image, isAvailable });
    res.status(201).json({ success: true, message: 'Menu item created.', data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update menu item (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Menu item updated.', data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE menu item (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
