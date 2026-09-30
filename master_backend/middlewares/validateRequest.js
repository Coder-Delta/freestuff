const validateRequest = (requiredFields = []) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, error: 'Invalid request body' });
  }

  const missingFields = requiredFields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missingFields.length) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    });
  }

  if (requiredFields.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(req.body.email).trim())) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address format' });
  }
  for (const field of ['password', 'newPassword']) {
    if (requiredFields.includes(field) && String(req.body[field]).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }
  }
  return next();
};

module.exports = validateRequest;
