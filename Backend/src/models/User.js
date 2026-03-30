const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Mongoose schema for application users.
 *
 * - `password` is nullable to support Google OAuth users who have no local password.
 * - `googleId` is nullable and only populated for OAuth sign-ins.
 * - Passwords are automatically hashed via a pre-save hook.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook — hashes the password with bcrypt whenever it is
 * created or modified. Skips hashing if the password field is not
 * dirty (e.g. when only the name is updated).
 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || this.password === null) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Compares a plain-text candidate password against the stored hash.
 * @param {string} candidatePassword - The password supplied by the user.
 * @returns {Promise<boolean>} True if the passwords match.
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Ensure the password field is never included in JSON output by default.
 */
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
