const { Joi, validate } = require("express-validation");

// --- Create Flight Order Schema ---
const createFlightOrderSchema = validate({
    body: Joi.object({
        flightNumber: Joi.string().trim().min(2).max(20).required().messages({
            "string.empty": "Flight number is required.",
            "string.min": "Flight number must be at least 2 characters.",
            "string.max": "Flight number must be at most 20 characters."
        }),
        departure: Joi.string().trim().min(3).max(50).required().messages({
            "string.empty": "Departure location is required.",
            "string.min": "Departure location must be at least 3 characters.",
            "string.max": "Departure location must be at most 50 characters."
        }),
        destination: Joi.string().trim().min(3).max(50).required().messages({
            "string.empty": "Destination is required.",
            "string.min": "Destination must be at least 3 characters.",
            "string.max": "Destination must be at most 50 characters."
        }),
        departureDate: Joi.date().iso().required().messages({
            "date.base": "Departure date must be a valid date.",
            "any.required": "Departure date is required."
        }),
        passengerCount: Joi.number().integer().min(1).max(20).required().messages({
            "number.base": "Passenger count must be a number.",
            "number.min": "At least one passenger is required.",
            "number.max": "Maximum 20 passengers allowed."
        }),
        price: Joi.number().positive().precision(2).required().messages({
            "number.base": "Price must be a number.",
            "number.positive": "Price must be greater than zero.",
            "any.required": "Price is required."
        }),
        customerName: Joi.string().trim().min(3).max(50).required().messages({
            "string.empty": "Customer name is required.",
            "string.min": "Customer name must be at least 3 characters.",
            "string.max": "Customer name must be at most 50 characters."
        }),
        contactNumber: Joi.string()
            .pattern(/^\+?[0-9]{7,15}$/)
            .required()
            .messages({
                "string.pattern.base": "Contact number must be valid (7–15 digits, optional +).",
                "string.empty": "Contact number is required."
            }),
        specialRequests: Joi.string().max(200).optional().messages({
            "string.max": "Special requests must be at most 200 characters."
        })
    })
});

// --- Update Flight Order Schema ---
const updateFlightOrderSchema = validate({
    body: Joi.object({
        passengerCount: Joi.number().integer().min(1).max(20).optional(),
        price: Joi.number().positive().precision(2).optional(),
        customerName: Joi.string().trim().min(3).max(50).optional(),
        contactNumber: Joi.string().pattern(/^\+?[0-9]{7,15}$/).optional(),
        specialRequests: Joi.string().max(200).optional()
    }).min(1).messages({
        "object.min": "At least one field must be provided for update."
    })
});

module.exports = {
    createFlightOrderSchema,
    updateFlightOrderSchema
};
