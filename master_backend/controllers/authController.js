const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const { ensureDatabase } = require('../config/db.mongo');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const register = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists' });
    }
    // Public registration must not let callers grant themselves elevated roles.
    const user = await User.create({ name, email: normalizedEmail, password, role: 'user' });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id, user.role),
      data: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password credentials' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact support.' });
    return res.json({ success: true, message: 'Login successful', token: generateToken(user._id, user.role), data: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const getMe = (req, res) => res.json({ success: true, data: req.user });

const updateDetails = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email.toLowerCase().trim();
    if (updates.email && updates.email !== req.user.email && await User.findOne({ email: updates.email })) {
      return res.status(409).json({ success: false, error: 'Email is already in use by another account' });
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { returnDocument: 'after', runValidators: true });
    return res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  if (!ensureDatabase(res)) return;
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: 'Password updated successfully', token: generateToken(user._id, user.role) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, getMe, updateDetails, updatePassword };
