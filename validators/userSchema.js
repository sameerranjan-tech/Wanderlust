const Joi = require("joi");

module.exports = Joi.object({
  email: Joi.string().required().email().messages({
    "string.email": "Please enter a valid email",
  }),
  username: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.string().required().min(10).min(10),
});