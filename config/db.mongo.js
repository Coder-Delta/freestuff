const mongoose = require('mongoose');

require('dotenv').config();
const mongodbUri = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbUri);
        console.log('Success: MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('Error: MongoDB Atlas connection failed', error );
        process.exit(1);
    }
}

module.exports = connectDB;