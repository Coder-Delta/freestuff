// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db.mongo');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Security Headers & Logging
app.use(helmet());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// CORS Configuration
app.use(cors());

// Parsers & Rate Limiter
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter(200, 15 * 60 * 1000));

// Root Discovery
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the REST API with Authentication & RBAC Authorization',
    endpoints: {
      health: '/api/health',
      version: '/api/version',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      users: { getAll: 'GET /api/users (Admin only)' },
      products: { getAll: 'GET /api/products' },
    },
  });
});

// Mount Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB();

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;