const mongoose = require('mongoose');

/**
 * Mongoose schema for stored password entries.
 *
 * Passwords are NEVER stored in plaintext. The `encryptedPassword` field
 * holds AES-256-CBC ciphertext, and `iv` holds the random initialisation
 * vector used during encryption.  Both are hex-encoded strings.
 */
const passwordEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    appName: {
      type: String,
      required: [true, 'App name is required'],
      trim: true,
      maxlength: [100, 'App name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      maxlength: [100, 'Username cannot exceed 100 characters'],
    },
    iv: {
      type: String,
      required: [true, 'IV is required'],
    },
    encryptedPassword: {
      type: String,
      required: [true, 'Encrypted password is required'],
    },
    category: {
      type: String,
      enum: {
        values: ['work', 'personal', 'finance', 'social', 'other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'other',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PasswordEntry', passwordEntrySchema);
