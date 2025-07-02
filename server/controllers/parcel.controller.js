const { StatusCodes } = require("http-status-codes");
const { successResponse } = require("../utils/response");
const { determineParcelCharge } = require("../utils/function");
const { v4: uuidv4 } = require("uuid");

// Services
const ParcelServices = require("../services/parcel.services");

exports.bookPickup = async (req, res, next) => {
  const {
    pickupAddress,
    deliveryAddress,
    parcelType,
    size,
    isCOD = false,
    codAmount = 0,
  } = req.body;

  // Use authenticated user as customer
  const customer = req.user._id;

  console.log("pickup", req.body);

  try {
    const platformCharge = determineParcelCharge(size);
    const trackingId = uuidv4();

    const parcel = await ParcelServices.bookPickup({
      customer,
      pickupAddress,
      deliveryAddress,
      parcelType,
      size,
      isCOD,
      codAmount,
      platformCharge,
      trackingId,
    });

    successResponse(
      res,
      "Parcel pickup request successfully",
      {
        parcel,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.updateParcelStatus = async (req, res, next) => {
  const { status, location } = req.body;
  const updatedBy = req.user._id; // Use authenticated user ID

  try {
    const parcel = await ParcelServices.updateStatus({
      trackingId: req.parcel.trackingId,
      status,
      location,
      updatedBy,
    });

    successResponse(
      res,
      "Parcel status updated successfully",
      {
        parcel,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getParcelByTrackingId = async (req, res, next) => {
  const { trackingId } = req.params;

  try {
    const parcel = await ParcelServices.getParcelByTrackingId(trackingId);

    successResponse(
      res,
      "Parcel details retrieved successfully",
      {
        parcel,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllParcels = async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const user = req.user;

  try {
    let query = {};

    // Apply role-based filtering
    if (user.role === "customer") {
      query.customer = user._id;
    } else if (user.role === "agent") {
      query.agent = user._id;
    }
    // Admin can see all parcels, so no additional filtering needed

    if (status) query.status = status;

    const parcels = await ParcelServices.getAllParcels({
      page: parseInt(page),
      limit: parseInt(limit),
      query,
    });

    successResponse(
      res,
      "Parcels retrieved successfully",
      {
        parcels: parcels.parcels,
        pagination: parcels.pagination,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getParcelHistory = async (req, res, next) => {
  const { trackingId } = req.params;

  try {
    const history = await ParcelServices.getParcelHistory(trackingId);

    successResponse(
      res,
      "Parcel history retrieved successfully",
      {
        history,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.updateParcelLocation = async (req, res, next) => {
  const { lat, lng } = req.body;
  const updatedBy = req.user._id; // Use authenticated user ID

  try {
    const parcel = await ParcelServices.updateLocation({
      trackingId: req.parcel.trackingId,
      lat,
      lng,
      updatedBy,
    });

    successResponse(
      res,
      "Parcel location updated successfully",
      {
        parcel,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.cancelParcel = async (req, res, next) => {
  const { reason } = req.body;
  const cancelledBy = req.user._id; // Use authenticated user ID

  try {
    const parcel = await ParcelServices.cancelParcel({
      trackingId: req.parcel.trackingId,
      reason,
      cancelledBy,
    });

    successResponse(
      res,
      "Parcel cancelled successfully",
      {
        parcel,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getParcelsByUser = async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const user = req.user;

  try {
    // Users can only get their own parcels, admins can get any user's parcels
    let targetUserId = user._id;

    if (user.role === "admin" && req.params.userId) {
      targetUserId = req.params.userId;
    }

    const parcels = await ParcelServices.getParcelsByUser({
      userId: targetUserId,
      role: user.role,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    successResponse(
      res,
      "User parcels retrieved successfully",
      {
        parcels: parcels.parcels,
        pagination: parcels.pagination,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};
