const { StatusCodes } = require("http-status-codes");
const passport = require("passport");

const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      // Handle expired or invalid token here
      if (info && info.name === "TokenExpiredError") {
        return next({
          message: "Your session has expired. Please log in again.",
          code: StatusCodes.UNAUTHORIZED,
          status: "TOKEN_EXPIRED",
        });
      }

      return next({
        message: "Authentication failed. Invalid token.",
        code: StatusCodes.UNAUTHORIZED,
        status: "INVALID_TOKEN",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

const hasAdminPriviledges = (req, _, next) => {
  const { user } = req;
  if (user?.role === "admin") {
    return next();
  }

  next({
    message: "You need to be an admin to access this resource.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

const hasAgentPrivileges = (req, _, next) => {
  const { user } = req;
  if (user?.role === "agent" || user?.role === "admin") {
    return next();
  }

  next({
    message: "You need to be an agent or admin to access this resource.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

const isCustomerOrAdmin = (req, _, next) => {
  const { user } = req;
  if (user?.role === "customer" || user?.role === "admin") {
    return next();
  }

  next({
    message: "You need to be a customer or admin to access this resource.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

const isOwnerOrAdmin = (req, _, next) => {
  const { user } = req;
  const resourceUserId =
    req.params.userId || req.body.userId || req.query.userId;

  if (user?.role === "admin" || user?._id.toString() === resourceUserId) {
    return next();
  }

  next({
    message: "You can only access your own resources or need admin privileges.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

const isAssignedAgentOrAdmin = (req, _, next) => {
  const { user } = req;
  const { trackingId } = req.params;

  // This middleware should be used after the parcel is loaded
  // The parcel should be attached to req.parcel by a previous middleware
  const parcel = req.parcel;

  if (!parcel) {
    return next({
      message: "Parcel not found.",
      code: StatusCodes.NOT_FOUND,
      status: "NOT_FOUND",
    });
  }
  console.log(user.role, parcel);
  if (
    user?.role === "admin" ||
    (user?.role === "agent" &&
      parcel.agent &&
      parcel.agent._id.toString() === user._id.toString())
  ) {
    return next();
  }

  next({
    message:
      "You can only perform operations on parcels assigned to you or need admin privileges.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

const isParcelOwnerOrAssignedAgentOrAdmin = (req, _, next) => {
  const { user } = req;
  const parcel = req.parcel;

  if (!parcel) {
    return next({
      message: "Parcel not found.",
      code: StatusCodes.NOT_FOUND,
      status: "NOT_FOUND",
    });
  }

  if (
    user?.role === "admin" ||
    (user?.role === "customer" &&
      parcel.customer._id.toString() === user._id.toString()) ||
    (user?.role === "agent" &&
      parcel.agent &&
      parcel.agent._id.toString() === user._id.toString())
  ) {
    return next();
  }

  next({
    message:
      "You can only access parcels you own, are assigned to, or need admin privileges.",
    code: StatusCodes.FORBIDDEN,
    status: "NOT_AUTHORIZED",
  });
};

module.exports = {
  isAuthenticated,

  hasAdminPriviledges,
  hasAgentPrivileges,
  isCustomerOrAdmin,
  isOwnerOrAdmin,
  isAssignedAgentOrAdmin,
  isParcelOwnerOrAssignedAgentOrAdmin,
};
