// subscriber.model.js
const mongoose = require('mongoose');
const SubscriberSchema = new mongoose.Schema({
    chatId: { type: String, unique: true }
});
module.exports = mongoose.model('Subscriber', SubscriberSchema);
