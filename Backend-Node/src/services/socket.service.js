const { Server } = require("socket.io");
const { JWT_SECRET, CORS_ORIGINS, NODE_ENV } = require("../config/env");
const logger = require("../config/logger");
const { verifyToken } = require("../utils/jwt");
const Notification = require("../modules/notifications/notification.model");
const User = require("../modules/users/user.model");
const { sendExpoPush, sendExpoPushBulk } = require("./expo-push.service");

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
  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!rawToken) {
        logger.warn("Socket rejected: missing auth token");
        return next(new Error("Authentication error"));
      }
      // Strip accidental "Bearer " prefix if present (sometimes stored with prefix)
      const token = String(rawToken).startsWith("Bearer ")
        ? String(rawToken).slice(7).trim()
        : String(rawToken).trim();

      let payload;
      try {
        payload = verifyToken(token);
      } catch (err) {
        logger.warn(`Socket rejected: invalid token (${err.message})`);
        return next(new Error("Invalid token"));
      }
      const rawUid = payload.id || payload._id || payload.sub;
      if (!rawUid) {
        logger.warn("Socket rejected: no id in JWT payload");
        return next(new Error("Invalid token"));
      }
      const uid = String(rawUid);
      // Confirm user actually exists in DB (matches express auth middleware behaviour)
      try {
        const user = await User.findById(uid).select("_id").lean();
        if (!user) {
          logger.warn(`Socket rejected: user ${uid} not found in DB`);
          return next(new Error("User not found"));
        }
      } catch (dbErr) {
        logger.error(`Socket auth DB error for user ${uid}: ${dbErr.message}`);
        return next(new Error("Authentication error"));
      }
      socket.userId = uid;
      next();
    } catch (fatal) {
      logger.error(
        `Socket auth middleware crashed: ${fatal.message}`,
        fatal.stack,
      );
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    try {
      socket.join(`user:${socket.userId}`);
      logger.info(
        `Socket connected: user ${socket.userId} [id=${socket.id}, transport=${socket.conn.transport.name}]`,
      );
    } catch (err) {
      logger.error(`Socket on-connection error: ${err.message}`);
    }

    socket.on("disconnect", (reason) => {
      try {
        logger.info(
          `Socket disconnected: user ${socket.userId} [reason=${reason}]`,
        );
      } catch (_) {
        /* ignore */
      }
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

/**
 * Broadcast a notification to every customer (end user):
 *  - persist one Notification per user (so it shows on their notifications page),
 *  - emit a live socket event to anyone currently connected,
 *  - send a bulk Expo push to those with a registered device token.
 * Runs in the background; failures are logged, never thrown.
 * @param {{ title: string, body: string, type?: string, reference_id?: any, reference_type?: string, metadata?: any }} payload
 */
async function notifyCustomers(payload) {
  try {
    // Notify everyone — customers, admins, and business/restaurant admins.
    const users = await User.find({ deleted_at: null })
      .select("_id expo_push_token")
      .lean();

    logger.info(`notifyCustomers: found ${users.length} users to notify`);
    if (!users.length) return;

    const docs = users.map((u) => ({
      user_id: u._id,
      type: payload.type || "general",
      title: payload.title || "",
      body: payload.body || "",
      // reference_id is an ObjectId in the schema; only set it when we actually
      // have one, otherwise leave it out to avoid a cast error.
      ...(payload.reference_id ? { reference_id: payload.reference_id } : {}),
      reference_type: payload.reference_type || "",
      metadata: payload.metadata || undefined,
    }));

    // Persist all notifications in one round-trip. Let Mongoose set timestamps.
    const created = await Notification.insertMany(docs, { ordered: false });
    logger.info(`notifyCustomers: saved ${created.length} notifications`);

    // Live socket emit to connected users (match single-user emit shape).
    if (io) {
      created.forEach((notif) => {
        io.to(`user:${String(notif.user_id)}`).emit("notification", {
          id: String(notif._id),
          type: notif.type,
          title: notif.title,
          body: notif.body,
          time: "Just now",
          read: false,
          reference_id: notif.reference_id ? String(notif.reference_id) : undefined,
          reference_type: notif.reference_type || undefined,
          metadata: notif.metadata || undefined,
        });
      });
    }

    // Bulk push to devices that have a token.
    const tokens = users.map((u) => u.expo_push_token).filter(Boolean);
    logger.info(`notifyCustomers: sending push to ${tokens.length} devices`);
    await sendExpoPushBulk(tokens, payload);
  } catch (err) {
    logger.error(`notifyCustomers failed: ${err.message}`, err.stack);
  }
}

module.exports = { initSocket, notifyUser, notifyCustomers };
