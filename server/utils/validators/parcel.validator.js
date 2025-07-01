// modules
const { checkSchema } = require("express-validator");
const validatorHelper = require("./helper");

// validators
module.exports = {
  bookPickup: validatorHelper(
    checkSchema({
      pickupAddress: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Pickup address is required",
        },
        custom: {
          options: (value) => {
            if (!value.address) {
              throw new Error("Pickup address is required");
            }
            return true;
          },
        },
      },
      deliveryAddress: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Delivery address is required",
        },
        custom: {
          options: (value) => {
            if (!value.address) {
              throw new Error("Delivery address is required");
            }
            return true;
          },
        },
      },
      parcelType: {
        in: ["body"],
        isIn: {
          options: [["document", "box", "fragile", "other"]],
          errorMessage: "Invalid parcel type",
        },
      },
      size: {
        in: ["body"],
        isIn: {
          options: [["small", "medium", "large"]],
          errorMessage: "Invalid parcel size",
        },
      },
      isCOD: {
        in: ["body"],
        optional: { options: { nullable: true, values: "falsy" } },
        isBoolean: true,
      },
      codAmount: {
        in: ["body"],
        optional: { options: { nullable: true, values: "falsy" } },
        isNumeric: true,
        toFloat: true,
        custom: {
          options: (value, { req }) => {
            if (req.body.isCOD && (!value || value <= 0)) {
              throw new Error(
                "COD amount must be greater than 0 when COD is enabled"
              );
            }
            return true;
          },
        },
      },
    }),
    "Parcel pickup request validation error"
  ),

  updateStatus: validatorHelper(
    checkSchema({
      status: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Status is required",
        },
        isIn: {
          options: [
            [
              "booked",
              "assigned",
              "picked-up",
              "in-transit",
              "out-for-delivery",
              "delivered",
              "failed",
              "cancelled",
            ],
          ],
          errorMessage: "Invalid status",
        },
      },
      location: {
        in: ["body"],
        optional: { options: { nullable: true, values: "falsy" } },
        custom: {
          options: (value) => {
            if (
              value &&
              (typeof value.lat !== "number" || typeof value.lng !== "number")
            ) {
              throw new Error(
                "Location must have valid lat and lng coordinates"
              );
            }
            return true;
          },
        },
      },
    }),
    "Parcel status update validation error"
  ),

  updateLocation: validatorHelper(
    checkSchema({
      lat: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Latitude is required",
        },
        isFloat: {
          options: { min: -90, max: 90 },
          errorMessage: "Latitude must be between -90 and 90",
        },
        toFloat: true,
      },
      lng: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Longitude is required",
        },
        isFloat: {
          options: { min: -180, max: 180 },
          errorMessage: "Longitude must be between -180 and 180",
        },
        toFloat: true,
      },
    }),
    "Parcel location update validation error"
  ),

  cancelParcel: validatorHelper(
    checkSchema({
      reason: {
        in: ["body"],
        isEmpty: {
          negated: true,
          errorMessage: "Cancellation reason is required",
        },
        isLength: {
          options: { min: 10, max: 500 },
          errorMessage:
            "Cancellation reason must be between 10 and 500 characters",
        },
      },
    }),
    "Parcel cancellation validation error"
  ),
};
