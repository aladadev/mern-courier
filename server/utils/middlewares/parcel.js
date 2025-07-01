const { StatusCodes } = require("http-status-codes");
const ParcelModel = require("../../models/parcel.model");

const loadParcel = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      return next({
        message: "Tracking ID is required",
        code: StatusCodes.BAD_REQUEST,
        status: "BAD_REQUEST",
      });
    }

    const parcel = await ParcelModel.findOne({ trackingId })
      .populate("customer", "firstName lastName email")
      .populate("agent", "firstName lastName email");

    if (!parcel) {
      return next({
        message: "Parcel not found",
        code: StatusCodes.NOT_FOUND,
        status: "NOT_FOUND",
      });
    }

    req.parcel = parcel;
    next();
  } catch (err) {
    next(err);
  }
};

const loadParcelById = async (req, res, next) => {
  try {
    const { parcelId } = req.params;

    if (!parcelId) {
      return next({
        message: "Parcel ID is required",
        code: StatusCodes.BAD_REQUEST,
        status: "BAD_REQUEST",
      });
    }

    const parcel = await ParcelModel.findById(parcelId)
      .populate("customer", "firstName lastName email")
      .populate("agent", "firstName lastName email");

    if (!parcel) {
      return next({
        message: "Parcel not found",
        code: StatusCodes.NOT_FOUND,
        status: "NOT_FOUND",
      });
    }

    req.parcel = parcel;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loadParcel,
  loadParcelById,
};
