const Product = require('../models/productModel');
const { ensureDatabase } = require('../config/db.mongo');

const getAllProducts = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try { res.json(await Product.find()); } catch (error) { next(error); }
};
const createProduct = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try { res.status(201).json(await Product.create(req.body)); } catch (error) { next(error); }
};
const getProductById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
};
const updateProductById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
};
const deleteProductById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) { next(error); }
};

module.exports = { getAllProducts, createProduct, getProductById, updateProductById, deleteProductById };
