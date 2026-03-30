const dotenv = require('dotenv');

// ──── Load environment variables FIRST ─────────────
// Must be called before any module reads process.env
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/authRoutes');
const passwordRoutes = require('./src/routes/passwordRoutes');

const app = express();

// ──── Security middleware ──────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Frontend served from a separate origin
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

/**
 * Global rate limiter — 100 requests per 15-minute window per IP.
 * Imported from the rateLimiter middleware module.
 */
app.use(apiLimiter);

// ──── Body parsers ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──── Passport initialisation ─────────────────────
app.use(passport.initialize());

// ──── Health-check route ───────────────────────────
/**
 * @route   GET /api/health
 * @desc    Returns server health status
 * @access  Public
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ──── API routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

// ──── Global error-handling middleware ──────────────
/**
 * Catch-all error handler. Logs the error stack in development
 * and returns a sanitised JSON response.
 * @param {Error}   err  - The error object
 * @param {Request} _req - Express request (unused)
 * @param {Response} res - Express response
 * @param {Function} _next - Express next (unused, but required by signature)
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled error:', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

// ──── Start server ─────────────────────────────────
const PORT = process.env.PORT || 5000;

/**
 * Connects to MongoDB and then starts the Express server.
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
