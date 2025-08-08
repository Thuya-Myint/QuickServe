const mongoose = require("mongoose");

const FlightOrderSchema = new mongoose.Schema({
    flightNo: {
        type: String,
        required: [true, "Flight number is required"],
        trim: true,
        match: [/^[A-Z]{2}\d{3,4}$/, "Invalid flight number format (e.g., AB1234)"]
    },
    from: {
        type: String,
        required: [true, "Departure airport code is required"],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, "Invalid IATA airport code (3 uppercase letters)"]
    },
    to: {
        type: String,
        required: [true, "Destination airport code is required"],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, "Invalid IATA airport code (3 uppercase letters)"]
    },
    passengerName: {
        type: String,
        required: [true, "Passenger name is required"],
        trim: true,
        match: [/^[A-Za-z\s\-]+$/, "Passenger name can only contain letters, spaces, and hyphens"]
    },
    seats: {
        type: Number,
        required: [true, "Number of seats is required"],
        min: [1, "At least one seat must be booked"],
        validate: {
            validator: Number.isInteger,
            message: "Seats must be an integer"
        }
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code"]
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, "Message cannot exceed 500 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Auto-delete after 24 hours
    }
});
// Function to safely return/reuse the model for dynamic collections
module.exports = (collectionName) => {
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName];
    }
    return mongoose.model(collectionName, FlightOrderSchema);
};
