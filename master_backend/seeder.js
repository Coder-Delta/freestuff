require('dotenv').config();
const mongoose = require('mongoose');
const { isMongoConfigured } = require('./config/db.mongo');
const User = require('./models/userModel');
const Product = require('./models/productModel');

const users = [
  { name: 'System Administrator', email: 'admin@example.com', password: 'AdminPassword123!', role: 'admin', isActive: true },
  { name: 'Content Moderator', email: 'moderator@example.com', password: 'ModPassword123!', role: 'moderator', isActive: true },
  { name: 'Regular Customer', email: 'user@example.com', password: 'UserPassword123!', role: 'user', isActive: true },
  { name: 'Deactivated User', email: 'inactive@example.com', password: 'InactivePassword123!', role: 'user', isActive: false },
];

const products = [
  { name: 'MacBook Pro 16" M3 Max', description: 'Apple M3 Max chip, 64GB RAM, 1TB SSD', price: 3499.99, category: 'electronics', inStock: true, quantity: 18 },
  { name: 'Sony WH-1000XM5 Wireless Headphones', description: 'Industry-leading noise canceling', price: 398, category: 'electronics', inStock: true, quantity: 45 },
  { name: 'Clean Code Book', description: 'Handbook of Agile Software Craftsmanship', price: 44.95, category: 'books', inStock: true, quantity: 80 },
];

const run = async () => {
  const command = process.argv[2];
  if (!['-i', '-d'].includes(command)) {
    throw new Error('Choose an explicit operation: npm run seed:import or npm run seed:destroy');
  }
  if (!isMongoConfigured()) throw new Error('MONGODB_URI is not configured. Seeder did not connect.');

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    if (command === '-d') {
      await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
      console.log('All user and product data destroyed.');
      return;
    }

    // Import intentionally replaces the demo collections. Run only against a disposable database.
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
    const createdUsers = await User.create(users);
    const admin = createdUsers.find((user) => user.role === 'admin');
    await Product.insertMany(products.map((product) => ({ ...product, createdBy: admin._id })));
    console.log('Demo users and products imported.');
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(async (error) => {
  console.error(`Seeder failed: ${error.message}`);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  process.exitCode = 1;
});
