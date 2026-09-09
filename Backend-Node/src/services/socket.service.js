const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../config/logger');

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
 * Emit a notification to a specific user.
 * @param {string} userId
 * @param {{ title: string, body: string, type: string }} payload
 */
function notifyUser(userId, payload) {
  if (!io) return;
  io.to(`user:${String(userId)}`).emit('notification', {
    id: Date.now().toString(),
    ...payload,
    time: 'Just now',
    read: false,
  });
}

module.exports = { initSocket, notifyUser };
