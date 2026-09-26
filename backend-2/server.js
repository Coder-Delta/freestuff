const express = require('express');
const { connectDB } = require('./config/db.mongo');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const healthRoutes = require('./routes/healthRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

app.use(express.json());

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/health', healthRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});