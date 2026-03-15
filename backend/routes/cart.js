const express = require('express');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');
const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = { userId: req.user.id, items: [], totalAmount: 0 };
    res.json({ success: true, data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.post('/add', auth, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) return res.status(404).json({ success: false, message: 'Item not found.' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [], totalAmount: 0 });

    const existing = cart.items.find(i => i.itemId.toString() === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ itemId, name: menuItem.name, price: menuItem.price, quantity });
    }
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json({ success: true, message: 'Item added to cart.', data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.put('/update', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.find(i => i.itemId.toString() === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json({ success: true, message: 'Cart updated.', data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], totalAmount: 0 });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
