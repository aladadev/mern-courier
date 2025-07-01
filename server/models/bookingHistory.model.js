const mongoose = require("mongoose");

const bookingHistorySchema = new mongoose.Schema(
  {
    parcel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
    },
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
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for better query performance
bookingHistorySchema.index({ parcel: 1 });
bookingHistorySchema.index({ status: 1 });
bookingHistorySchema.index({ updatedBy: 1 });
bookingHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("BookingHistory", bookingHistorySchema);
