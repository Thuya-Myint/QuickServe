const mongoose = require("mongoose");

const TableOrderSchema = new mongoose.Schema({
    tableNo: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Export a function that returns the model based on collection name
module.exports = (collectionName) => {
    return mongoose.model(collectionName, TableOrderSchema);
};
