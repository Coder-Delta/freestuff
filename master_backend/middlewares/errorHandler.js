const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error(`[API Error] ${err.name}: ${err.message}`);

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: `Resource not found. Invalid ID format: '${err.value}'` });
  }
  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    return res.status(409).json({ success: false, error: `Duplicate value entered for '${field}'. This value already exists.` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: 'Validation Error', details: Object.values(err.errors).map((item) => item.message) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON request body' });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode || 500);
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
