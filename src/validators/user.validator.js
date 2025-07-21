const { Joi, validate } = require('express-validation');

// --- User Registration Schema ---
const registerUserSchema = validate({
    body: Joi.object({
        name: Joi.string().min(3).max(30).required().messages({
            "string.empty": "Name is required.",
            "string.min": "Name must be at least 3 characters.",
            "string.max": "Name must be at most 30 characters.",
        }),
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required.",
            "string.email": "Email format is invalid.",
        }),
        password: Joi.string().min(6).required().messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 6 characters long.",
        }),
        role: Joi.string().valid("user", "admin").optional(),
    }),
})

// --- User Login Schema ---
const loginUserSchema = validate({
    body: Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "name is required.",
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required.",
        }),
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required.",
            "string.email": "Email format is invalid.",
        }),
    }),
})

// --- User Update Schema ---
const updateUserSchema = validate({
    body: Joi.object({
        name: Joi.string().min(3).max(30).optional().messages({
            "string.min": "name must be at least 3 characters.",
            "string.max": "name must be at most 30 characters.",
        }),
        email: Joi.string().email().optional().messages({
            "string.email": "Email format is invalid.",
        }),
        password: Joi.string().min(6).optional().messages({
            "string.min": "Password must be at least 6 characters long.",
        }),
        role: Joi.string().valid("user", "admin").optional(),
    }).min(1).messages({
        "object.min": "At least one field must be provided for update.",
    }),
}
)

module.exports = {
    registerUserSchema: registerUserSchema,
    loginUserSchema: loginUserSchema,
    updateUserSchema: updateUserSchema,
};
