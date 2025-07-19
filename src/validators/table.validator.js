const { Joi, validate } = require("express-validation");

const createTableOrder = validate({
    body: Joi.object({
        companyId: Joi.string().optional().messages({
            "string.base": "companyId must be a string"
        }),
        eventId: Joi.number().optional().messages({
            "number.base": "eventId must be a number"
        })
    }),
});

module.exports = {
    createTableOrder
}