const Joi = require("joi");

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().allow("", null),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});