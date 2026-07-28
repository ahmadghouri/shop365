const pino = require('pino');
const { NODE_ENV, LOG_LEVEL } = require('./env');

const logger = pino({
  level: LOG_LEVEL,
  transport: NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

module.exports = logger;
