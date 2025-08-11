// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 }, // store price as cents (integer)
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },
    tags: [String], // e.g. ["vegan","spicy"]
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuItemSchema);
