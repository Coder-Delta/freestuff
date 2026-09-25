const mongoose = require('mongoose');
const { APP_VERSION, DEPLOYED_AT } = require('../utils');

// GET /api/health
const getHealth = (req, res) => {
    const dbState = mongoose.connection.readyState;

    const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };

    res.json({
        status: 'OK',
        message: 'Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: dbStatusMap[dbState] || 'unknown',
        uptime: process.uptime(),
        memoryUsage: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
    });
};