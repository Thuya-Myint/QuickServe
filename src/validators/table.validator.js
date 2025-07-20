const Joi = require("joi");

const createTableOrderSchema = Joi.object({
    tableNo: Joi.string().trim().min(1).required(),
    message: Joi.string().trim().min(1).required(),
});

module.exports = createTableOrderSchema