const express = require('express');
const Joi = require('joi');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require('../controllers/passwordController');

const router = express.Router();

// All password routes require authentication
router.use(protect);

// ──── Validation schemas ───────────────────────────

/**
 * Joi schema for creating a new password entry.
 */
const createSchema = Joi.object({
  appName: Joi.string().trim().max(100).required().messages({
    'string.empty': 'App name is required',
    'string.max': 'App name cannot exceed 100 characters',
  }),
  username: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Username is required',
    'string.max': 'Username cannot exceed 100 characters',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
  category: Joi.string()
    .valid('work', 'personal', 'finance', 'social', 'other')
    .default('other')
    .messages({ 'any.only': 'Category must be one of: work, personal, finance, social, other' }),
  remarks: Joi.string().trim().max(500).allow('').default('').messages({
    'string.max': 'Remarks cannot exceed 500 characters',
  }),
});

/**
 * Joi schema for updating an existing password entry.
 * All fields are optional — only supplied fields are updated.
 */
const updateSchema = Joi.object({
  appName: Joi.string().trim().max(100).messages({
    'string.empty': 'App name cannot be empty',
    'string.max': 'App name cannot exceed 100 characters',
  }),
  username: Joi.string().trim().max(100).messages({
    'string.empty': 'Username cannot be empty',
    'string.max': 'Username cannot exceed 100 characters',
  }),
  password: Joi.string().messages({
    'string.empty': 'Password cannot be empty',
  }),
  category: Joi.string()
    .valid('work', 'personal', 'finance', 'social', 'other')
    .messages({ 'any.only': 'Category must be one of: work, personal, finance, social, other' }),
  remarks: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Remarks cannot exceed 500 characters',
  }),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

// ──── Routes ───────────────────────────────────────

/**
 * @route  POST /api/passwords
 * @desc   Create a new password entry
 * @access Private
 */
router.post('/', validate(createSchema), create);

/**
 * @route  GET /api/passwords
 * @desc   Get all password entries for the authenticated user
 * @access Private
 */
router.get('/', getAll);

/**
 * @route  GET /api/passwords/:id
 * @desc   Get a single password entry by ID
 * @access Private
 */
router.get('/:id', getOne);

/**
 * @route  PUT /api/passwords/:id
 * @desc   Update an existing password entry
 * @access Private
 */
router.put('/:id', validate(updateSchema), update);

/**
 * @route  DELETE /api/passwords/:id
 * @desc   Delete a password entry
 * @access Private
 */
router.delete('/:id', remove);

module.exports = router;
