const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  // Custom errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    return res.status(422).json({ message: messages.join(', ') || 'Validation failed' });
  }

  // Multer file errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }

  logger.error({ message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
}

module.exports = { errorHandler };
