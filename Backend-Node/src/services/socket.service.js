const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../config/logger');
const Notification = require('../modules/notifications/notification.model');

/** @type {Server} */
let io;

/**
 * Initialise Socket.io on the HTTP server.
 * Call once from server.js after creating the http.Server.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  // Auth middleware — expect token in handshake.auth.token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = String(payload.id || payload._id || payload.sub);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join a private room for this user
    socket.join(`user:${socket.userId}`);
    logger.info(`Socket connected: user ${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId}`);
    });
  });

  logger.info('Socket.io initialised');
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
    type: payload.type || 'general',
    title: payload.title || '',
    body: payload.body || '',
    reference_id: payload.reference_id || undefined,
    reference_type: payload.reference_type || '',
    metadata: payload.metadata || undefined,
  })
    .then((notif) => {
      if (!io) return;
      io.to(`user:${String(userId)}`).emit('notification', {
        id: String(notif._id),
        type: notif.type,
        title: notif.title,
        body: notif.body,
        time: 'Just now',
        read: false,
        reference_id: notif.reference_id ? String(notif.reference_id) : undefined,
        reference_type: notif.reference_type || undefined,
        metadata: notif.metadata || undefined,
      });
    })
    .catch((err) => {
      logger.error('Failed to save notification: %s', err.message);
    });
}

module.exports = { initSocket, notifyUser };
