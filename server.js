const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db.mongo.js');

require('dotenv').config();

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend API is running successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database:
            mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.use('/api/users', require('./routes/user.route.js'));

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });