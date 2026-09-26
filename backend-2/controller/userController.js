const User = require('../models/userModel');
const { ensureDatabase } = require('../config/db.mongo');

const getAllUsers = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) { next(error); }
};

const getUserById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

const updateUserById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

const deleteUserById = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) { next(error); }
};

module.exports = { getAllUsers, createUser, getUserById, updateUserById, deleteUserById };
