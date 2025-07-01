const { StatusCodes } = require("http-status-codes");
const ParcelModel = require("../models/parcel.model");
const UserModel = require("../models/user.model");
const BookingHistoryModel = require("../models/bookingHistory.model");

exports.assignAgentToParcel = async ({ trackingId, agentId, assignedBy }) => {
  try {
    const parcel = await ParcelModel.findOne({ trackingId });

    if (!parcel) {
      let error = new Error("Parcel not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    const agent = await UserModel.findById(agentId);
    if (!agent || agent.role !== "agent") {
      let error = new Error("Invalid agent ID or user is not an agent");
      error.name = "BadRequestError";
      error.status = "BAD_REQUEST";
      error.code = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      parcel._id,
      { agent: agentId, status: "assigned" },
      { new: true }
    )
      .populate("customer", "firstName lastName email")
      .populate("agent", "firstName lastName email");

    // Create history entry for agent assignment
    await BookingHistoryModel.create({
      parcel: parcel._id,
      status: parcel.status,
      updatedBy: assignedBy,
      notes: `Agent ${agent.firstName} ${agent.lastName} assigned to parcel`,
    });

    return updatedParcel;
  } catch (err) {
    throw err;
  }
};

exports.getAllUsers = async ({ page, limit, role, search }) => {
  try {
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await UserModel.find(query)
      .select("-hash -salt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { users, pagination };
  } catch (err) {
    throw err;
  }
};

exports.getUserById = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select("-hash -salt");

    if (!user) {
      let error = new Error("User not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    return user;
  } catch (err) {
    throw err;
  }
};

exports.updateUserRole = async ({ userId, role, updatedBy }) => {
  try {
    const validRoles = ["admin", "agent", "customer"];

    if (!validRoles.includes(role)) {
      let error = new Error("Invalid role");
      error.name = "BadRequestError";
      error.status = "BAD_REQUEST";
      error.code = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-hash -salt");

    if (!user) {
      let error = new Error("User not found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    return user;
  } catch (err) {
    throw err;
  }
};

exports.getAllAgents = async ({ page, limit, search }) => {
  try {
    const query = { role: "agent" };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const agents = await UserModel.find(query)
      .select("-hash -salt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { agents, pagination };
  } catch (err) {
    throw err;
  }
};

exports.getUnassignedParcels = async ({ page, limit }) => {
  try {
    const query = {
      agent: { $exists: false },
      status: { $in: ["booked", "picked-up"] },
    };

    const skip = (page - 1) * limit;

    const parcels = await ParcelModel.find(query)
      .populate("customer", "firstName lastName email")
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

exports.bulkAssignAgents = async ({ assignments, assignedBy }) => {
  try {
    const results = [];

    for (const assignment of assignments) {
      try {
        const result = await this.assignAgentToParcel({
          trackingId: assignment.trackingId,
          agentId: assignment.agentId,
          assignedBy,
        });
        results.push({
          trackingId: assignment.trackingId,
          success: true,
          parcel: result,
        });
      } catch (error) {
        results.push({
          trackingId: assignment.trackingId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (err) {
    throw err;
  }
};

exports.getSystemStats = async () => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalAgents,
      totalAdmins,
      totalParcels,
      totalDelivered,
      totalFailed,
      totalCancelled,
      unassignedParcels,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: "customer" }),
      UserModel.countDocuments({ role: "agent" }),
      UserModel.countDocuments({ role: "admin" }),
      ParcelModel.countDocuments(),
      ParcelModel.countDocuments({ status: "delivered" }),
      ParcelModel.countDocuments({ status: "failed" }),
      ParcelModel.countDocuments({ status: "cancelled" }),
      ParcelModel.countDocuments({ agent: { $exists: false } }),
    ]);

    const revenueData = await ParcelModel.aggregate([
      {
        $group: {
          _id: null,
          totalCODAmount: { $sum: { $cond: ["$isCOD", "$codAmount", 0] } },
          totalPlatformCharges: { $sum: "$platformCharge" },
        },
      },
    ]);

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        agents: totalAgents,
        admins: totalAdmins,
      },
      parcels: {
        total: totalParcels,
        delivered: totalDelivered,
        failed: totalFailed,
        cancelled: totalCancelled,
        unassigned: unassignedParcels,
        successRate:
          totalParcels > 0 ? (totalDelivered / totalParcels) * 100 : 0,
      },
      revenue: {
        totalCOD: revenueData[0]?.totalCODAmount || 0,
        totalPlatformCharges: revenueData[0]?.totalPlatformCharges || 0,
        totalRevenue:
          (revenueData[0]?.totalCODAmount || 0) +
          (revenueData[0]?.totalPlatformCharges || 0),
      },
    };
  } catch (err) {
    throw err;
  }
};

exports.exportUsers = async ({ format, role }) => {
  try {
    const query = {};
    if (role) query.role = role;

    const users = await UserModel.find(query)
      .select("-hash -salt")
      .sort({ createdAt: -1 });

    const data = users.map((user) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    if (format === "csv") {
      return this.convertToCSV(data);
    }

    return data;
  } catch (err) {
    throw err;
  }
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
