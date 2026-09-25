const mongoose = require('mongoose');
require('dotenv').config();

const isMongoConfigured = () => {
    return(
        typeof process.env.MONGO_URI !== 'undefined' &&
        process.env.MONGO_URI !== null &&
        process.env.MONGO_URI !== ''
    );
};