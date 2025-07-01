const { StatusCodes } = require("http-status-codes");
const { successResponse } = require("../utils/response");
const AdminServices = require("../services/admin.services");

exports.assignAgentToParcel = async (req, res, next) => {
  const { trackingId } = req.params;
  const { agentId } = req.body;
  const assignedBy = req.user._id;

  try {
    const parcel = await AdminServices.assignAgentToParcel({
      trackingId,
      agentId,
      assignedBy,
    });

    successResponse(
      res,
      "Agent assigned successfully",
      { parcel },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  const { page = 1, limit = 10, role, search } = req.query;

  try {
    const users = await AdminServices.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search,
    });

    successResponse(
      res,
      "Users retrieved successfully",
      {
        users: users.users,
        pagination: users.pagination,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await AdminServices.getUserById(userId);

    successResponse(
      res,
      "User retrieved successfully",
      { user },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;
  const updatedBy = req.user._id;

  try {
    const user = await AdminServices.updateUserRole({
      userId,
      role,
      updatedBy,
    });

    successResponse(
      res,
      "User role updated successfully",
      { user },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllAgents = async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;

  try {
    const agents = await AdminServices.getAllAgents({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });

    successResponse(
      res,
      "Agents retrieved successfully",
      {
        agents: agents.agents,
        pagination: agents.pagination,
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getUnassignedParcels = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const parcels = await AdminServices.getUnassignedParcels({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    successResponse(
      res,
      "Unassigned parcels retrieved successfully",
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

exports.bulkAssignAgents = async (req, res, next) => {
  const { assignments } = req.body;
  const assignedBy = req.user._id;

  try {
    const results = await AdminServices.bulkAssignAgents({
      assignments,
      assignedBy,
    });

    successResponse(
      res,
      "Bulk assignment completed",
      { results },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    const stats = await AdminServices.getSystemStats();

    successResponse(
      res,
      "System statistics retrieved successfully",
      stats,
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
};

exports.exportUsers = async (req, res, next) => {
  const { format = "json", role } = req.query;

  try {
    const data = await AdminServices.exportUsers({ format, role });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      return res.send(data);
    }

    successResponse(res, "Users exported successfully", data, StatusCodes.OK);
  } catch (err) {
    next(err);
  }
};
