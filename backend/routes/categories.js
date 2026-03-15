const express = require('express');
const Category = require('../models/Category');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ categoryName: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName) return res.status(400).json({ success: false, message: 'categoryName is required.' });
    const cat = await Category.create({ categoryName });
    res.status(201).json({ success: true, message: 'Category created.', data: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { categoryName: req.body.categoryName }, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category updated.', data: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
