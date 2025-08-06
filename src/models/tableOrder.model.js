const mongoose = require("mongoose");

const TableOrderSchema = new mongoose.Schema({
    tableNo: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
});

// Export a function that returns the model based on collection name
module.exports = (collectionName) => {
    return mongoose.model(collectionName, TableOrderSchema);
};
