const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("./config");
const UserModel = require("../models/user.model");

let io;

function setupSocket(server) {
  io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication error"));
      const payload = jwt.verify(token, config.secrets.jwt);
      const user = await UserModel.findById(payload._id);
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    socket.join(`user_${user._id}`);
    socket.join(`role_${user.role}`);
    if (user.role === "admin") socket.join("admins");

    socket.on("joinParcelRoom", (trackingId) => {
      socket.join(`parcel_${trackingId}`);
    });

    socket.on("disconnect", () => {});
  });
}

function emitBookingHistoryUpdate({
  trackingId,
  history,
  customerId,
  agentId,
}) {
  if (!io) return;
  io.to(`parcel_${trackingId}`).emit("bookingHistoryUpdate", {
    trackingId,
    history,
  });
  if (customerId)
    io.to(`user_${customerId}`).emit("bookingHistoryUpdate", {
      trackingId,
      history,
    });
  if (agentId)
    io.to(`user_${agentId}`).emit("bookingHistoryUpdate", {
      trackingId,
      history,
    });
  io.to("admins").emit("bookingHistoryUpdate", { trackingId, history });
}

module.exports = { setupSocket, emitBookingHistoryUpdate };
