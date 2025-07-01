const express = require("express");
const router = express.Router();

// Controllers
const AnalyticsController = require("../controllers/analytics.controller");

// Middleware
const {
  isAuthenticated,
  hasAdminPriviledges,
  hasAgentPrivileges,
} = require("../utils/middlewares/auth");

// Admin analytics endpoints
router.get(
  "/dashboard",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.getDashboardMetrics
);

router.get(
  "/daily/:date",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.getDailyAnalytics
);

router.get(
  "/agent-performance",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.getAgentPerformance
);

router.get(
  "/reports",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.generateReport
);

router.get(
  "/revenue",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.getRevenueAnalytics
);

router.get(
  "/delivery",
  isAuthenticated,
  hasAdminPriviledges,
  AnalyticsController.getDeliveryAnalytics
);

// Agent analytics endpoints
router.get(
  "/agent/dashboard",
  isAuthenticated,
  hasAgentPrivileges,
  AnalyticsController.getAgentDashboard
);

router.get(
  "/agent/daily/:date",
  isAuthenticated,
  hasAgentPrivileges,
  AnalyticsController.getAgentDailyAnalytics
);

router.get(
  "/agent/performance",
  isAuthenticated,
  hasAgentPrivileges,
  AnalyticsController.getAgentOwnPerformance
);

module.exports = router;
