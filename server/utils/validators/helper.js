const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const validatorHelper = (schema, message = "Validation error") => {
  return async (req, _, next) => {
    try {
      await schema.run(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next({
          message: message,
          code: StatusCodes.FORBIDDEN,
          status: "VALIDATION_ERROR",
          details: errors.array(),
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validatorHelper;
