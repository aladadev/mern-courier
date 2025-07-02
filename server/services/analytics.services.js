const { StatusCodes } = require("http-status-codes");
const ParcelModel = require("../models/parcel.model");
const UserModel = require("../models/user.model");
const AnalyticsModel = require("../models/analytics.model");
const BookingHistoryModel = require("../models/bookingHistory.model");

exports.getDashboardMetrics = async ({ startDate, endDate }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Get total bookings
    const totalBookings = await ParcelModel.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    // Get delivered parcels
    const totalDeliveries = await ParcelModel.countDocuments({
      status: "delivered",
      deliveredAt: { $gte: start, $lte: end },
    });

    // Get failed deliveries
    const failedDeliveries = await ParcelModel.countDocuments({
      status: "failed",
      updatedAt: { $gte: start, $lte: end },
    });

    // Get cancelled deliveries
    const cancelledDeliveries = await ParcelModel.countDocuments({
      status: "cancelled",
      cancelledAt: { $gte: start, $lte: end },
    });

    // Get COD amounts
    const codData = await ParcelModel.aggregate([
      {
        $match: {
          isCOD: true,
          // status: "delivered",
          // deliveredAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalCODAmount: { $sum: "$codAmount" },
          totalPlatformCharges: { $sum: "$platformCharge" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCODAmount: 1,
          totalPlatformCharges: 1,
        },
      },
    ]);

    // Get status breakdown
    const statusBreakdown = await ParcelModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get agent performance
    const agentPerformance = await ParcelModel.aggregate([
      {
        $match: {
          agent: { $exists: true, $ne: null },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$agent",
          totalAssigned: { $sum: 1 },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agentInfo",
        },
      },
      {
        $unwind: "$agentInfo",
      },
      {
        $project: {
          agentId: "$_id",
          agentName: {
            $concat: ["$agentInfo.firstName", " ", "$agentInfo.lastName"],
          },
          totalAssigned: 1,
          totalDelivered: 1,
          totalFailed: 1,
          successRate: {
            $multiply: [
              { $divide: ["$totalDelivered", { $max: ["$totalAssigned", 1] }] },
              100,
            ],
          },
        },
      },
    ]);

    return {
      period: { start, end },
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      totalCODAmount: codData[0]?.totalCODAmount || 0,
      totalPlatformCharges: codData[0]?.totalPlatformCharges || 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      agentPerformance,
      successRate:
        totalBookings > 0 ? (totalDeliveries / totalBookings) * 100 : 0,
    };
  } catch (err) {
    throw err;
  }
};

exports.getDailyAnalytics = async (date) => {
  try {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    let analytics = await AnalyticsModel.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!analytics) {
      // Generate analytics for the day if not exists
      analytics = await this.generateDailyAnalytics(startOfDay);
    }

    return analytics;
  } catch (err) {
    throw err;
  }
};

exports.generateDailyAnalytics = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      codData,
      statusBreakdown,
    ] = await Promise.all([
      ParcelModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        status: "delivered",
        deliveredAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        status: "failed",
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        status: "cancelled",
        cancelledAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.aggregate([
        {
          $match: {
            isCOD: true,
            status: "delivered",
            deliveredAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalCODAmount: { $sum: "$codAmount" },
            totalPlatformCharges: { $sum: "$platformCharge" },
          },
        },
      ]),
      ParcelModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const analyticsData = {
      date: startOfDay,
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      totalCODAmount: codData[0]?.totalCODAmount || 0,
      totalPlatformCharges: codData[0]?.totalPlatformCharges || 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    // Save or update analytics
    await AnalyticsModel.findOneAndUpdate({ date: startOfDay }, analyticsData, {
      upsert: true,
      new: true,
    });

    return analyticsData;
  } catch (err) {
    throw err;
  }
};

exports.getAgentPerformance = async ({ startDate, endDate, agentId }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const matchStage = {
      agent: { $exists: true, $ne: null },
      createdAt: { $gte: start, $lte: end },
    };

    if (agentId) {
      matchStage.agent = agentId;
    }

    const performance = await ParcelModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$agent",
          totalAssigned: { $sum: 1 },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalCancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          averageDeliveryTime: {
            $avg: {
              $cond: [
                { $eq: ["$status", "delivered"] },
                { $subtract: ["$deliveredAt", "$createdAt"] },
                null,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agentInfo",
        },
      },
      {
        $unwind: "$agentInfo",
      },
      {
        $project: {
          agentId: "$_id",
          agentName: {
            $concat: ["$agentInfo.firstName", " ", "$agentInfo.lastName"],
          },
          agentEmail: "$agentInfo.email",
          totalAssigned: 1,
          totalDelivered: 1,
          totalFailed: 1,
          totalCancelled: 1,
          successRate: {
            $multiply: [
              { $divide: ["$totalDelivered", { $max: ["$totalAssigned", 1] }] },
              100,
            ],
          },
          averageDeliveryTimeHours: {
            $divide: ["$averageDeliveryTime", 1000 * 60 * 60],
          },
        },
      },
    ]);

    return performance;
  } catch (err) {
    throw err;
  }
};

exports.generateReport = async ({ reportType, startDate, endDate, format }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    let reportData;

    switch (reportType) {
      case "delivery":
        reportData = await this.generateDeliveryReport(start, end);
        break;
      case "revenue":
        reportData = await this.generateRevenueReport(start, end);
        break;
      case "agent":
        reportData = await this.generateAgentReport(start, end);
        break;
      default:
        let error = new Error("Invalid report type");
        error.name = "BadRequestError";
        error.status = "BAD_REQUEST";
        error.code = StatusCodes.BAD_REQUEST;
        throw error;
    }

    if (format === "csv") {
      return this.convertToCSV(reportData);
    }

    if (format === "pdf") {
      return this.convertToPDF(reportData, reportType);
    }

    return reportData;
  } catch (err) {
    throw err;
  }
};

exports.generateDeliveryReport = async (start, end) => {
  const parcels = await ParcelModel.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("customer", "firstName lastName email")
    .populate("agent", "firstName lastName email")
    .sort({ createdAt: -1 });

  return parcels.map((parcel) => ({
    trackingId: parcel.trackingId,
    customerName: `${parcel.customer.firstName} ${parcel.customer.lastName}`,
    customerEmail: parcel.customer.email,
    agentName: parcel.agent
      ? `${parcel.agent.firstName} ${parcel.agent.lastName}`
      : "Unassigned",
    status: parcel.status,
    createdAt: parcel.createdAt,
    deliveredAt: parcel.deliveredAt,
    pickupAddress: parcel.pickupAddress.address,
    deliveryAddress: parcel.deliveryAddress.address,
    isCOD: parcel.isCOD,
    codAmount: parcel.codAmount,
    platformCharge: parcel.platformCharge,
  }));
};

exports.generateRevenueReport = async (start, end) => {
  const revenueData = await ParcelModel.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalRevenue: { $sum: "$platformCharge" },
        totalCOD: { $sum: { $cond: ["$isCOD", "$codAmount", 0] } },
        totalBookings: { $sum: 1 },
        totalDeliveries: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return revenueData;
};

exports.generateAgentReport = async (start, end) => {
  return await this.getAgentPerformance({ startDate: start, endDate: end });
};

exports.convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === "string" ? `"${value}"` : value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

exports.convertToPDF = (data, reportType) => {
  // For now, return a simple text representation
  return JSON.stringify(data, null, 2);
};

exports.getRevenueAnalytics = async ({ startDate, endDate, groupBy }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    let dateFormat;
    switch (groupBy) {
      case "daily":
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        dateFormat = "%Y-%U";
        break;
      case "monthly":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const revenue = await ParcelModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" },
          },
          totalRevenue: { $sum: "$platformCharge" },
          totalCOD: { $sum: { $cond: ["$isCOD", "$codAmount", 0] } },
          totalBookings: { $sum: 1 },
          totalDeliveries: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenue;
  } catch (err) {
    throw err;
  }
};

exports.getDeliveryAnalytics = async ({ startDate, endDate }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await ParcelModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalBookings: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          inTransit: {
            $sum: { $cond: [{ $eq: ["$status", "in-transit"] }, 1, 0] },
          },
          pickedUp: {
            $sum: { $cond: [{ $eq: ["$status", "picked-up"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return analytics;
  } catch (err) {
    throw err;
  }
};

exports.getAgentDashboardMetrics = async ({ startDate, endDate, agentId }) => {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Get total bookings assigned to agent
    const totalBookings = await ParcelModel.countDocuments({
      agent: agentId,
      createdAt: { $gte: start, $lte: end },
    });

    // Get delivered parcels
    const totalDeliveries = await ParcelModel.countDocuments({
      agent: agentId,
      status: "delivered",
      deliveredAt: { $gte: start, $lte: end },
    });

    // Get failed deliveries
    const failedDeliveries = await ParcelModel.countDocuments({
      agent: agentId,
      status: "failed",
      updatedAt: { $gte: start, $lte: end },
    });

    // Get cancelled deliveries
    const cancelledDeliveries = await ParcelModel.countDocuments({
      agent: agentId,
      status: "cancelled",
      cancelledAt: { $gte: start, $lte: end },
    });

    // Get COD amounts
    const codData = await ParcelModel.aggregate([
      {
        $match: {
          agent: agentId,
          isCOD: true,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalCODAmount: { $sum: "$codAmount" },
          totalPlatformCharges: { $sum: "$platformCharge" },
        },
      },
    ]);

    // Get status breakdown
    const statusBreakdown = await ParcelModel.aggregate([
      {
        $match: {
          agent: agentId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      period: { start, end },
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      totalCODAmount: codData[0]?.totalCODAmount || 0,
      totalPlatformCharges: codData[0]?.totalPlatformCharges || 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      successRate:
        totalBookings > 0 ? (totalDeliveries / totalBookings) * 100 : 0,
    };
  } catch (err) {
    throw err;
  }
};

exports.getAgentDailyAnalytics = async (date, agentId) => {
  try {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      codData,
      statusBreakdown,
    ] = await Promise.all([
      ParcelModel.countDocuments({
        agent: agentId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        agent: agentId,
        status: "delivered",
        deliveredAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        agent: agentId,
        status: "failed",
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.countDocuments({
        agent: agentId,
        status: "cancelled",
        cancelledAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      ParcelModel.aggregate([
        {
          $match: {
            agent: agentId,
            isCOD: true,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalCODAmount: { $sum: "$codAmount" },
            totalPlatformCharges: { $sum: "$platformCharge" },
          },
        },
      ]),
      ParcelModel.aggregate([
        {
          $match: {
            agent: agentId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      date: startOfDay,
      totalBookings,
      totalDeliveries,
      failedDeliveries,
      cancelledDeliveries,
      totalCODAmount: codData[0]?.totalCODAmount || 0,
      totalPlatformCharges: codData[0]?.totalPlatformCharges || 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  } catch (err) {
    throw err;
  }
};
