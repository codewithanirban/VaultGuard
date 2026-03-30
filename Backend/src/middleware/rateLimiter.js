const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints.
 * 10 requests per 15-minute window per IP.
 * Applied to POST /api/auth/login and POST /api/auth/register.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

/**
 * General-purpose API rate limiter.
 * 100 requests per 15-minute window per IP.
 * Applied globally in server.js.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { authLimiter, apiLimiter };
