const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, CORS_ORIGINS, NODE_ENV } = require("../config/env");
const logger = require("../config/logger");
const Notification = require("../modules/notifications/notification.model");
const User = require("../modules/users/user.model");
const { sendExpoPush } = require("./expo-push.service");

/** @type {Server} */
let io;

function isOriginAllowed(origin) {
  if (CORS_ORIGINS === "*") return true;
  const allowed = CORS_ORIGINS.split(",").map((s) => s.trim());
  if (!origin) return allowed.includes("null") || allowed.length === 0;
  return allowed.some((o) => {
    if (o === "*") return true;
    try {
      const u = new URL(o);
      return u.origin === origin || new URL(origin).origin === u.origin;
    } catch {
      return o === origin;
    }
  });
}

/**
 * Initialise Socket.io on the HTTP server.
 * Call once from server.js after creating the http.Server.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (NODE_ENV === "development" || isOriginAllowed(origin)) {
          callback(null, origin || true);
        } else {
          logger.warn(`Socket.io CORS blocked origin: ${origin}`);
          callback(null, "*");
        }
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
    path: "/socket.io",
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Auth middleware — expect token in handshake.auth.token OR query.token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      logger.warn("Socket rejected: missing auth token");
      return next(new Error("Authentication error"));
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = String(payload.id || payload._id || payload.sub);
      next();
    } catch (err) {
      logger.warn(`Socket rejected: invalid token (${err.message})`);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.info(
      `Socket connected: user ${socket.userId} [id=${socket.id}, transport=${socket.conn.transport.name}]`,
    );

    socket.on("disconnect", (reason) => {
      logger.info(
        `Socket disconnected: user ${socket.userId} [reason=${reason}]`,
      );
    });
  });

  logger.info("Socket.io initialised");
  return io;
}

/**
 * Emit a notification to a specific user, and persist it so it survives a
 * refresh. The live socket emit uses the saved _id so the client can dedupe.
 * @param {string} userId
 * @param {{ title: string, body: string, type: string, reference_id?: string|ObjectId, reference_type?: string, metadata?: any }} payload
 */
function notifyUser(userId, payload) {
  Notification.create({
    user_id: userId,
    type: payload.type || "general",
    title: payload.title || "",
    body: payload.body || "",
    reference_id: payload.reference_id || undefined,
    reference_type: payload.reference_type || "",
    metadata: payload.metadata || undefined,
  })
    .then((notif) => {
      User.findById(userId)
        .then((user) => sendExpoPush(user, payload))
        .catch((err) => {
          logger.warn(
            { userId, error: err.message },
            "Could not load user for Expo push",
          );
        });
      if (!io) return;
      io.to(`user:${String(userId)}`).emit("notification", {
        id: String(notif._id),
        type: notif.type,
        title: notif.title,
        body: notif.body,
        time: "Just now",
        read: false,
        reference_id: notif.reference_id
          ? String(notif.reference_id)
          : undefined,
        reference_type: notif.reference_type || undefined,
        metadata: notif.metadata || undefined,
      });
    })
    .catch((err) => {
      logger.error("Failed to save notification: %s", err.message);
    });
}

module.exports = { initSocket, notifyUser };
