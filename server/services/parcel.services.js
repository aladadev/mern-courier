const { StatusCodes } = require("http-status-codes");
const { emitBookingHistoryUpdate } = require("../utils/socket");

// models
const ParcelModel = require("../models/parcel.model");
const BookingHistoryModel = require("../models/bookingHistory.model");

exports.bookPickup = async (data) => {
  try {
    // Map isCod (from controller) to isCOD (model)
    if (typeof data.isCod !== "undefined") {
      data.isCOD = data.isCod;
      delete data.isCod;
    }

    console.log("Pickup data", data);

    const parcel = await ParcelModel.create(data);

    // Create initial booking history
    await BookingHistoryModel.create({
      parcel: parcel._id,
      status: "booked",
      updatedBy: data.customer,
    });

    const fullHistory = await BookingHistoryModel.find({ parcel: parcel._id })
      .populate("updatedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
    emitBookingHistoryUpdate({
      trackingId: parcel.trackingId,
      history: fullHistory,
      customerId: parcel.customer,
      agentId: parcel?.agent,
    });

    return parcel;
  } catch (err) {
    throw err;
  }
};

exports.updateStatus = async ({ trackingId, status, location, updatedBy }) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId });

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    // Update parcel status
    const updateData = { status };

    // Update current location if provided
    if (location && location.lat && location.lng) {
      updateData.currentLocation = {
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        updatedAt: new Date(),
      };
    }

    // Set specific timestamps based on status
    if (status === "picked-up") {
      updateData.pickedUpAt = new Date();
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      parcel._id,
      updateData,
      { new: true }
    )
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone");

    // Create booking history entry
    await BookingHistoryModel.create({
      parcel: parcel._id,
      status,
      location: location || null,
      updatedBy,
    });

    const fullHistory = await BookingHistoryModel.find({ parcel: parcel._id })
      .populate("updatedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
    emitBookingHistoryUpdate({
      trackingId: parcel.trackingId,
      history: fullHistory,
      customerId: parcel.customer,
      agentId: parcel.agent,
    });

    return updatedParcel;
  } catch (err) {
    throw err;
  }
};

exports.getParcelByTrackingId = async (trackingId) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId })
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone");

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    return parcel;
  } catch (err) {
    throw err;
  }
};

exports.getAllParcels = async ({ page, limit, query }) => {
  try {
    const skip = (page - 1) * limit;

    const parcels = await ParcelModel.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ParcelModel.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { parcels, pagination };
  } catch (err) {
    throw err;
  }
};

exports.getParcelHistory = async (trackingId) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId });

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    const history = await BookingHistoryModel.find({ parcel: parcel._id })
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return history;
  } catch (err) {
    throw err;
  }
};

exports.updateLocation = async ({ trackingId, lat, lng, updatedBy }) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId });

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      parcel._id,
      {
        currentLocation: {
          coordinates: { lat, lng },
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone");

    // Create history entry for location update
    await BookingHistoryModel.create({
      parcel: parcel._id,
      status: parcel.status,
      location: { lat, lng },
      updatedBy,
    });

    const fullHistory = await BookingHistoryModel.find({ parcel: parcel._id })
      .populate("updatedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
    emitBookingHistoryUpdate({
      trackingId: parcel.trackingId,
      history: fullHistory,
      customerId: parcel.customer,
      agentId: parcel.agent,
    });

    return updatedParcel;
  } catch (err) {
    throw err;
  }
};

exports.cancelParcel = async ({ trackingId, reason, cancelledBy }) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId });

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    if (parcel.status === "delivered" || parcel.status === "failed") {
      let error = new Error("Cannot cancel parcel with current status");
      error.name = "BadRequestError";
      error.status = "BAD_REQUEST";
      error.code = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      parcel._id,
      {
        status: "cancelled",
        cancellationReason: reason,
        cancelledBy,
        cancelledAt: new Date(),
      },
      { new: true }
    )
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone");

    // Create history entry for cancellation
    await BookingHistoryModel.create({
      parcel: parcel._id,
      status: "cancelled",
      updatedBy: cancelledBy,
    });

    const fullHistory = await BookingHistoryModel.find({ parcel: parcel._id })
      .populate("updatedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
    emitBookingHistoryUpdate({
      trackingId: parcel.trackingId,
      history: fullHistory,
      customerId: parcel.customer,
      agentId: parcel.agent,
    });

    return updatedParcel;
  } catch (err) {
    throw err;
  }
};

exports.getParcelsByUser = async ({ userId, role, page, limit, status }) => {
  try {
    const query = {};

    if (role === "customer") {
      query.customer = userId;
    } else if (role === "agent") {
      query.agent = userId;
    }

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const parcels = await ParcelModel.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("agent", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ParcelModel.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { parcels, pagination };
  } catch (err) {
    throw err;
  }
};
