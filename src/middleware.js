const { ValidationError } = require("express-validation");

const validateRequest = (err, req, res, next) => {
    console.log("errrr -----")
    if (err instanceof ValidationError) {
        // Combine all error details (body, query, params, etc.)
        const allErrors = Object.values(err.details).flat();

        const errorMessages = allErrors.map((detail) => detail.message);

        console.log("err---> ", errorMessages)
        return res.status(err.statusCode || 400).json({
            success: false,
            message: "VALIDATION_FAILED",
            errors: errorMessages, // <-- this is now an array of actual messages
        });
    }

    console.error("Global error handler:", err);

    return res.status(500).json({
        success: false,
        message: "INTERNAL_SERVER_ERROR",
        error: err.message || "Unexpected error occurred",
    });
};


module.exports = { validateRequest };
