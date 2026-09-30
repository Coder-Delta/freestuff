const Product = require('../models/productModel');
const { ensureDatabase } = require('../config/db.mongo');

const getAllProducts = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { page = 1, limit = 10, category, inStock, minPrice, maxPrice, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      const minimum = Number(minPrice);
      const maximum = Number(maxPrice);
      if (minPrice !== undefined && Number.isFinite(minimum)) filter.price.$gte = minimum;
      if (maxPrice !== undefined && Number.isFinite(maximum)) filter.price.$lte = maximum;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'category'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const products = await Product.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Product.countDocuments(filter);
    return res.json({ success: true, data: products, pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalRecords: total, limit: limitNum } });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { name, description, price, category, inStock, quantity } = req.body;
    const product = await Product.create({ name, description, price, category, inStock, quantity, createdBy: req.user._id });
    return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email role');
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const allowed = ['name', 'description', 'price', 'category', 'inStock', 'quantity'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true }).populate('createdBy', 'name email role');
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct };
