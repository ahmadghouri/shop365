const { env } = require('./env');
const { connectDatabase } = require('./database');
const logger = require('./logger');
const { corsOptions } = require('./cors');

module.exports = { env, connectDatabase, logger, corsOptions };
