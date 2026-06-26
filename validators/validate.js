const ExpressError = require("../utils/ExpressError.js");

function validate(Schema) {
  return (req, res, next) => {
    const { error } = Schema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, "");

      throw new ExpressError(400, message);
    }

    next();
  };
}

module.exports = { validate };