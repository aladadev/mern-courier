const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickupAddress: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: {
          type: Number,
          trim: true,
          default: null,
        },
        lng: {
          type: Number,
          trim: true,
          default: null,
        },
      },
    },
    deliveryAddress: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: {
          type: Number,
          trim: true,
          default: null,
        },
        lng: {
          type: Number,
          trim: true,
          default: null,
        },
      },
    },

    parcelType: {
      type: String,
      enum: ["document", "box", "fragile", "other"],
      default: "box",
    },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },

    isCOD: { type: Boolean, default: false },
    codAmount: { type: Number, default: 0 },
    platformCharge: { type: Number, required: true },

    trackingId: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: [
        "booked",
        "assigned",
        "picked-up",
        "in-transit",
        "out-for-delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "booked",
    },

    currentLocation: {
      coordinates: {
        lat: {
          type: Number,
          trim: true,
          default: null,
        },
        lng: {
          type: Number,
          trim: true,
          default: null,
        },
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },

    // Cancellation fields
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Delivery fields
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deliveryNotes: {
      type: String,
      default: null,
    },

    // QR Code and Barcode
    qrCode: {
      type: String,
      default: null,
    },
    barcode: {
      type: String,
      default: null,
    },

    // Estimated delivery time
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },

    // Route optimization
    optimizedRoute: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for better query performance
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ customer: 1 });
parcelSchema.index({ agent: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Parcel", parcelSchema);
