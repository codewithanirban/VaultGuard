const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 *
 * Production-ready connection options:
 *   - serverSelectionTimeoutMS: fail fast (5s) if no server is reachable.
 *   - socketTimeoutMS: close idle sockets after 45s to prevent hangs.
 *
 * Exits the process with code 1 if the initial connection fails,
 * allowing the process manager (PM2, Docker, Render, etc.) to restart it.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
