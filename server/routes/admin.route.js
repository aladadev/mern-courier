const express = require("express");
const router = express.Router();

// Controllers
const AdminController = require("../controllers/admin.controller");

// Middleware
const {
  isAuthenticated,
  hasAdminPriviledges,
} = require("../utils/middlewares/auth");

// Apply admin authentication to all routes
router.use(isAuthenticated);
router.use(hasAdminPriviledges);

// Parcel Management
router.patch(
  "/parcels/:trackingId/assign-agent",
  AdminController.assignAgentToParcel
);

router.post("/parcels/bulk-assign", AdminController.bulkAssignAgents);

router.get("/parcels/unassigned", AdminController.getUnassignedParcels);

// User Management
router.get("/users", AdminController.getAllUsers);

router.get("/users/:userId", AdminController.getUserById);

router.patch("/users/:userId/role", AdminController.updateUserRole);

// Agent Management
router.get("/agents", AdminController.getAllAgents);

// System Management
router.get("/stats", AdminController.getSystemStats);

// Export users
router.get("/export/users", AdminController.exportUsers);

module.exports = router;
