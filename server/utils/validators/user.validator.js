// modules
const { checkSchema } = require("express-validator");
const validatorHelper = require("./helper");

// validators
module.exports = {
  login: validatorHelper(
    checkSchema({
      email: {
        in: ["body"],
        isEmail: {
          errorMessage: "Invalid email address",
        },
      },
      password: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Password is required",
        },
      },
    }),
    "Invalid email address or password"
  ),
  register: validatorHelper(
    checkSchema({
      firstName: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "First name is required",
        },
        isLength: {
          errorMessage: "First name should be at least 2 chars long",
          options: { min: 2 },
        },
      },
      lastName: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Last name is required",
        },
        isLength: {
          errorMessage: "Last name should be at least 2 chars long",
          options: { min: 2 },
        },
      },
      email: {
        in: ["body"],
        isEmail: {
          errorMessage: "Invalid email address",
        },
      },
      password: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Password is required",
        },
        isLength: {
          errorMessage: "Password should be at least 6 chars long",
          options: { min: 6 },
        },
      },
    })
  ),
  updateinfo: validatorHelper(
    checkSchema({
      firstName: {
        in: ["body"],
        isLength: {
          errorMessage: "First name should be at least 2 chars long",
          options: { min: 2 },
        },
        optional: { options: { nullable: true, values: "falsy" } },
        isString: true,
        trim: true,
      },
      lastName: {
        in: ["body"],
        isLength: {
          errorMessage: "Last name should be at least 2 chars long",
          options: { min: 2 },
        },
        optional: { options: { nullable: true, values: "falsy" } },
        isString: true,
        trim: true,
      },
      newPassword: {
        in: ["body"],
        optional: { options: { nullable: true, checkFalsy: true } },
        isLength: {
          errorMessage: "New password should be at least 6 characters long",
          options: { min: 6 },
        },
      },
      confirmPassword: {
        in: ["body"],
        optional: { options: { nullable: true, checkFalsy: true } },
        custom: {
          options: (confirmPassword, { req }) => {
            if (req.body.newPassword && !confirmPassword) {
              throw new Error(
                "Confirm password is required when new password is provided"
              );
            }
            if (confirmPassword && confirmPassword !== req.body.newPassword) {
              throw new Error("New password and confirm password must match");
            }
            return true;
          },
        },
      },
      customValidation: {
        custom: {
          options: (_, { req }) => {
            const { firstName, lastName, newPassword, confirmPassword } =
              req.body;
            if (!firstName && !lastName && !newPassword && !confirmPassword) {
              throw new Error(
                "At least one of firstName, lastName, or newPassword & confirmPassword is required"
              );
            }
            return true;
          },
        },
      },
    })
  ),
  changePassword: validatorHelper(
    checkSchema({
      oldPassword: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Old password is required",
        },
      },
      newPassword: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "New password is required",
        },
        custom: {
          options: (newPassword, { req }) => {
            if (newPassword === req.body.oldPassword) {
              throw new Error("New password must not match the old password");
            }
            return true;
          },
        },
      },
    }),
    "Password validation error"
  ),
  forgotPassword: validatorHelper(
    checkSchema({
      email: {
        in: ["body"],
        isEmail: {
          errorMessage: "Invalid email address",
        },
      },
    })
  ),
  resetPassword: validatorHelper(
    checkSchema({
      password: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Password is required",
        },
        isLength: {
          errorMessage: "Password should be at least 6 chars long",
          options: { min: 6 },
        },
      },
      confirmPassword: {
        in: ["body"],
        custom: {
          options: (confirmPassword, { req }) => {
            if (confirmPassword !== req.body.password) {
              throw new Error("Passwords do not match");
            }
            return true;
          },
        },
      },
    })
  ),
};
