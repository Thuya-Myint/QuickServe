const { ValidationError } = require("express-validation");

const validateRequest = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        const mes = err.details.params || err.details.query || err.details.body;
        return res.status(err.statusCode).json({
            success: false,
            message: "VALIDATION_FAILED",
            error: mes[0].context.message ? mes[0].context.message : mes[0].message,
        });
    }

    return res.status(400).json(err);
};

module.exports = { validateRequest };
