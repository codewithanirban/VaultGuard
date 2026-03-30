const express = require('express');
const Joi = require('joi');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ──── Validation schemas ───────────────────────────

/**
 * Joi schema for the registration payload.
 * Password must be ≥ 8 chars with at least 1 uppercase, 1 number, and 1 special character.
 */
const registerSchema = Joi.object({
  name: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Name is required',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[0-9]/, 'digit')
    .pattern(/[^A-Za-z0-9]/, 'special')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least one {#name} character',
      'string.empty': 'Password is required',
    }),
});

/**
 * Joi schema for the login payload.
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

// ──── Local auth routes ────────────────────────────

/**
 * @route  POST /api/auth/register
 * @desc   Create a new user account
 * @access Public
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate user and return JWT
 * @access Public
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @route  GET /api/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Private
 */
router.get('/me', protect, getMe);

// ──── Google OAuth routes ──────────────────────────

/**
 * @route  GET /api/auth/google
 * @desc   Redirect to Google consent screen
 * @access Public
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * Signs a JWT for the given user.
 * @param {object} user - Mongoose user document.
 * @returns {string} Signed JWT string.
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @route  GET /api/auth/google/callback
 * @desc   Handle Google OAuth callback, issue JWT, redirect to frontend
 * @access Public (called by Google)
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: undefined, // handled manually below
  }),
  (req, res) => {
    try {
      if (!req.user) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendURL}/login?error=oauth_failed`);
      }

      const token = signToken(req.user);
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendURL}/oauth-callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error.message);
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendURL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
