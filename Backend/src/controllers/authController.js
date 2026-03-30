const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ──── Helpers ──────────────────────────────────────

/**
 * Signs a JWT containing the user's id, name, and email.
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

// ──── Controllers ──────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with name, email, and password.
 *          Validation is handled by the validate middleware on the route.
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Create and save user (password is hashed via pre-save hook)
    const user = await User.create({ name, email, password });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an existing user with email and password.
 *          Validation is handled by the validate middleware on the route.
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If the user registered via OAuth and has no password
    if (!user.password) {
      return res.status(400).json({ error: 'Please use Google login' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently authenticated user's profile.
 *          Never returns password hash, iv, or encryptedPassword.
 * @access  Private (requires auth middleware)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error('GetMe error:', err.message);
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
};

module.exports = { register, login, getMe };
