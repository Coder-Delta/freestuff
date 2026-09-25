const express = require('express');
const {connectDB}= require('./config/db.mongo');

const app = express();

 const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT ,'0.0.0.0', () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});