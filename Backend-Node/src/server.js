const app = require('./app');
const { connectDatabase } = require('./config/database');
const logger = require('./config/logger');
const { PORT: port, NODE_ENV: nodeEnv } = require('./config/env');

async function start() {
  try {
    await connectDatabase();
    logger.info('Connected to MongoDB');

    app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
