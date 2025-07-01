const express = require("express");
const router = express.Router();

// Controllers
const ParcelController = require("../controllers/parcel.controller");

// Validators
const ParcelValidators = require("../utils/validators/parcel.validator");

// Middleware
const {
  isAuthenticated,
  hasAgentPrivileges,
  isCustomerOrAdmin,
  isAssignedAgentOrAdmin,
  isParcelOwnerOrAssignedAgentOrAdmin,
} = require("../utils/middlewares/auth");
const { loadParcel } = require("../utils/middlewares/parcel");

// Book a new parcel (only customers and admins)
router.post(
  "/pickup",
  isAuthenticated,
  isCustomerOrAdmin,
  ParcelValidators.bookPickup,
  ParcelController.bookPickup
);

// Update parcel status (only assigned agents and admins)
router.patch(
  "/:trackingId/status",
  isAuthenticated,
  loadParcel,
  isAssignedAgentOrAdmin,
  ParcelValidators.updateStatus,
  ParcelController.updateParcelStatus
);

// Get parcel by tracking ID (public access for tracking)
router.get("/track/:trackingId", ParcelController.getParcelByTrackingId);

// Get all parcels (role-based filtering)
router.get("/", isAuthenticated, ParcelController.getAllParcels);

// Get parcel history (only parcel owner, assigned agent, or admin)
router.get(
  "/:trackingId/history",
  loadParcel,
  isParcelOwnerOrAssignedAgentOrAdmin,
  ParcelController.getParcelHistory
);

// Update parcel location (only assigned agents and admins)
router.patch(
  "/:trackingId/location",
  isAuthenticated,
  loadParcel,
  isAssignedAgentOrAdmin,
  ParcelValidators.updateLocation,
  ParcelController.updateParcelLocation
);

// Cancel parcel (only parcel owner and admins)
router.patch(
  "/:trackingId/cancel",
  isAuthenticated,
  loadParcel,
  isParcelOwnerOrAssignedAgentOrAdmin,
  ParcelValidators.cancelParcel,
  ParcelController.cancelParcel
);

// Get parcels by user (role-based access)
router.get(
  "/user/:userId?",
  isAuthenticated,
  ParcelController.getParcelsByUser
);

// Public endpoint: Get parcel tracking history
router.get("/track/:trackingId/history", ParcelController.getParcelHistory);

module.exports = router;
