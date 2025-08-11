// controllers/menuController.js
const MenuItem = require('../models/menu.model');
const telegramBot = require('../helper/telegramBot.service')
// Create Menu Item
exports.createMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.create(req.body);

        // Trigger Telegram update (async, don't block response)
        await telegramBot.notifyMenuChange();

        res.status(201).json({ success: true, data: menuItem });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get All Menu Items
exports.getMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ isDeleted: false, available: true }).sort({ title: 1 });
        res.status(200).json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Single Item
exports.getMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update
exports.updateMenuItem = async (req, res) => {
    try {
        const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

        await telegramBot.notifyMenuChange();

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete (soft delete)
exports.deleteMenuItem = async (req, res) => {
    try {
        const deleted = await MenuItem.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

        telegramBot.notifyMenuChange();

        res.status(200).json({ success: true, message: 'Item soft deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
