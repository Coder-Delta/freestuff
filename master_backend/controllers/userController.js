const User = require('../models/userModel');
const { ensureDatabase } = require('../config/db.mongo');

const getAllUsers = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { email: { $regex: escaped, $options: 'i' } }];
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(filter),
    ]);
    return res.json({ success: true, data: users, pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalRecords: total, limit: limitNum } });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { name, email, password, role, isActive } = req.body;
    const user = await User.create({ name, email, password, role, isActive });
    return res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { name, email, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;
    await user.save();
    return res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAllUsers, createUser, getUserById, updateUser, deleteUser };
