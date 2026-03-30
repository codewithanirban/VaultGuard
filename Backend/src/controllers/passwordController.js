const PasswordEntry = require('../models/PasswordEntry');
const { encrypt, decrypt } = require('../utils/encryption');

// ──── Helpers ──────────────────────────────────────

/**
 * Converts a Mongoose PasswordEntry document into a safe response
 * object with the password decrypted.
 * Never exposes iv, encryptedPassword, or __v fields.
 *
 * @param {object} entry - Mongoose document or plain object.
 * @returns {object} Sanitised entry with decrypted `password` field.
 */
const toDecryptedResponse = (entry) => {
  const obj = entry.toObject ? entry.toObject() : { ...entry };
  const decryptedPassword = decrypt({
    iv: obj.iv,
    encryptedData: obj.encryptedPassword,
  });

  return {
    _id: obj._id,
    userId: obj.userId,
    appName: obj.appName,
    username: obj.username,
    password: decryptedPassword,
    category: obj.category,
    remarks: obj.remarks,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

// ──── Controllers ──────────────────────────────────

/**
 * @route   POST /api/passwords
 * @desc    Create a new password entry (encrypted).
 *          Validation is handled by the validate middleware on the route.
 * @access  Private
 */
const create = async (req, res) => {
  try {
    const { appName, username, password, category, remarks } = req.body;

    // Encrypt the password before storage
    const { iv, encryptedData } = encrypt(password);

    const entry = await PasswordEntry.create({
      userId: req.user.id,
      appName,
      username,
      iv,
      encryptedPassword: encryptedData,
      category,
      remarks,
    });

    return res.status(201).json({ entry: toDecryptedResponse(entry) });
  } catch (err) {
    console.error('Create password error:', err.message);
    return res.status(500).json({ error: 'Server error creating password entry' });
  }
};

/**
 * @route   GET /api/passwords
 * @desc    Get all password entries for the authenticated user.
 *          Supports ?search= (case-insensitive appName/username) and ?category= filter.
 * @access  Private
 */
const getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { userId: req.user.id };

    // Apply category filter
    if (category && ['work', 'personal', 'finance', 'social', 'other'].includes(category)) {
      filter.category = category;
    }

    // Apply search filter (case-insensitive on appName or username)
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ appName: regex }, { username: regex }];
    }

    const entries = await PasswordEntry.find(filter)
      .select('-__v')
      .sort({ updatedAt: -1 });

    const decrypted = entries.map(toDecryptedResponse);
    return res.status(200).json({ entries: decrypted });
  } catch (err) {
    console.error('GetAll passwords error:', err.message);
    return res.status(500).json({ error: 'Server error fetching password entries' });
  }
};

/**
 * @route   GET /api/passwords/:id
 * @desc    Get a single password entry by ID (ownership enforced).
 * @access  Private
 */
const getOne = async (req, res) => {
  try {
    const entry = await PasswordEntry.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    return res.status(200).json({ entry: toDecryptedResponse(entry) });
  } catch (err) {
    console.error('GetOne password error:', err.message);
    return res.status(500).json({ error: 'Server error fetching password entry' });
  }
};

/**
 * @route   PUT /api/passwords/:id
 * @desc    Update an existing password entry (ownership enforced).
 *          If the `password` field is present, it is re-encrypted.
 *          Validation is handled by the validate middleware on the route.
 * @access  Private
 */
const update = async (req, res) => {
  try {
    const entry = await PasswordEntry.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    const { appName, username, password, category, remarks } = req.body;

    // Update plain-text fields
    if (appName !== undefined) entry.appName = appName;
    if (username !== undefined) entry.username = username;
    if (category !== undefined) entry.category = category;
    if (remarks !== undefined) entry.remarks = remarks;

    // If a new password is supplied, re-encrypt
    if (password !== undefined) {
      const { iv, encryptedData } = encrypt(password);
      entry.iv = iv;
      entry.encryptedPassword = encryptedData;
    }

    await entry.save();

    return res.status(200).json({ entry: toDecryptedResponse(entry) });
  } catch (err) {
    console.error('Update password error:', err.message);
    return res.status(500).json({ error: 'Server error updating password entry' });
  }
};

/**
 * @route   DELETE /api/passwords/:id
 * @desc    Delete a password entry (ownership enforced).
 * @access  Private
 */
const remove = async (req, res) => {
  try {
    const entry = await PasswordEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete password error:', err.message);
    return res.status(500).json({ error: 'Server error deleting password entry' });
  }
};

module.exports = { create, getAll, getOne, update, remove };
