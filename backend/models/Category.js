const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true, unique: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Category', categorySchema);
