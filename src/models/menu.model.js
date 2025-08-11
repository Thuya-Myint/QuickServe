const mongoose = require('mongoose');

const VariantPriceSchema = new mongoose.Schema({
    variant: { type: String, required: true }, // e.g., "Chicken", "Pork", "Prawn", or "Hot", "Cold"
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

const MenuItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },   // e.g. "ကုန်းဘောင်"
    category: { type: String, required: true, trim: true }, // e.g. "Main Dishes Menu"
    description: { type: String, default: '', trim: true }, // Optional description
    variants: { type: [VariantPriceSchema], default: [] },  // List of prices by variant
    available: { type: Boolean, default: true },
    tags: [String],                                         // Optional tags
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
