const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    failedDeliveries: {
      type: Number,
      default: 0,
    },
    cancelledDeliveries: {
      type: Number,
      default: 0,
    },
    totalCODAmount: {
      type: Number,
      default: 0,
    },
    totalPlatformCharges: {
      type: Number,
      default: 0,
    },
    averageDeliveryTime: {
      type: Number, // in hours
      default: 0,
    },
    statusBreakdown: {
      booked: { type: Number, default: 0 },
      "picked-up": { type: Number, default: 0 },
      "in-transit": { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
    },
    agentPerformance: [
      {
        agentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        totalAssigned: { type: Number, default: 0 },
        totalDelivered: { type: Number, default: 0 },
        totalFailed: { type: Number, default: 0 },
        averageDeliveryTime: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for date-based queries
analyticsSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
