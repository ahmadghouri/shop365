const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');
const logger = require('./logger');

// Global plugin: add created_at/updated_at aliases + id field for Laravel compatibility
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString?.() || ret._id;
      if (ret.createdAt) ret.created_at = ret.createdAt;
      if (ret.updatedAt) ret.updated_at = ret.updatedAt;
      delete ret.__v;
      delete ret.password;
      return ret;
    },
  });
});

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

module.exports = { connectDatabase };
