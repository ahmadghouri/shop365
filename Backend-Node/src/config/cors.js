const { CORS_ORIGINS } = require('./env');

const corsOptions = {
  origin: CORS_ORIGINS === '*' ? '*' : CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

module.exports = { corsOptions };
