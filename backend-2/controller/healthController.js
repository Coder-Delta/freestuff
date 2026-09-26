const mongoose = require('mongoose');

const getHealth = (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: states[mongoose.connection.readyState] || 'unknown',
    uptime: process.uptime(),
  });
};

const getVersion = (req, res) => res.json({
  success: true,
  version: process.env.APP_VERSION || '1.0.0',
  nodeVersion: process.version,
  platform: process.platform,
});

module.exports = { getHealth, getVersion };
