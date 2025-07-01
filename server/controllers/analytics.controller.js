const { StatusCodes } = require("http-status-codes");
const { successResponse } = require("../utils/response");
const AnalyticsServices = require("../services/analytics.services");

exports.getDashboardMetrics = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const metrics = await AnalyticsServices.getDashboardMetrics({
      startDate,
      endDate,
    });

    successResponse(
      res,
      "Dashboard metrics retrieved successfully",
      metrics,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getDailyAnalytics = async (req, res, next) => {
  const { date } = req.params;

  try {
    const analytics = await AnalyticsServices.getDailyAnalytics(date);

    successResponse(
      res,
      "Daily analytics retrieved successfully",
      analytics,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAgentPerformance = async (req, res, next) => {
  const { startDate, endDate, agentId } = req.query;

  try {
    const performance = await AnalyticsServices.getAgentPerformance({
      startDate,
      endDate,
      agentId,
    });

    successResponse(
      res,
      "Agent performance retrieved successfully",
      performance,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.generateReport = async (req, res, next) => {
  const { reportType, startDate, endDate, format = "json" } = req.query;

  try {
    const report = await AnalyticsServices.generateReport({
      reportType,
      startDate,
      endDate,
      format,
    });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${reportType}_report.csv`
      );
      return res.send(report);
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${reportType}_report.pdf`
      );
      return res.send(report);
    }

    successResponse(
      res,
      "Report generated successfully",
      report,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  const { startDate, endDate, groupBy = "daily" } = req.query;

  try {
    const revenue = await AnalyticsServices.getRevenueAnalytics({
      startDate,
      endDate,
      groupBy,
    });

    successResponse(
      res,
      "Revenue analytics retrieved successfully",
      revenue,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getDeliveryAnalytics = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const analytics = await AnalyticsServices.getDeliveryAnalytics({
      startDate,
      endDate,
    });

    successResponse(
      res,
      "Delivery analytics retrieved successfully",
      analytics,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAgentDashboard = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const agentId = req.user._id;

  try {
    const metrics = await AnalyticsServices.getAgentDashboardMetrics({
      startDate,
      endDate,
      agentId,
    });

    successResponse(
      res,
      "Agent dashboard metrics retrieved successfully",
      metrics,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAgentDailyAnalytics = async (req, res, next) => {
  const { date } = req.params;
  const agentId = req.user._id;

  try {
    const analytics = await AnalyticsServices.getAgentDailyAnalytics(
      date,
      agentId
    );

    successResponse(
      res,
      "Agent daily analytics retrieved successfully",
      analytics,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAgentOwnPerformance = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const agentId = req.user._id;

  try {
    const performance = await AnalyticsServices.getAgentPerformance({
      startDate,
      endDate,
      agentId,
    });

    successResponse(
      res,
      "Agent performance retrieved successfully",
      performance,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};
