const rateLimitStore = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => (req, res, next) => {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let clientData = rateLimitStore.get(clientIP);

  if (!clientData || now - clientData.startTime >= windowMs) {
    clientData = { count: 0, startTime: now };
    rateLimitStore.set(clientIP, clientData);
  }
  clientData.count += 1;

  if (clientData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfterMs: windowMs - (now - clientData.startTime),
    });
  }
  return next();
};

module.exports = rateLimiter;
