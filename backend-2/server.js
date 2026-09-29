const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB } = require('./config/db.mongo');

const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('./middlewares/rateLimiter');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const healthRoutes = require('./routes/healthRoutes');


const app = express();
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4200',
    'http://127.0.0.1:4200'
].filter(Boolean);

app.use(helmet());
app.use(morgan('combined'));
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'), false);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    }),
);

app.use(express.json());
app.use(rateLimit(200, 15 * 60 * 1000));
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Use the routes
app.use('/api', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


app.use((req,res) => {
    res.status(404).json({ 
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
})
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
