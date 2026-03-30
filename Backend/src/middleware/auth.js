const jwt = require('jsonwebtoken');

/**
 * Express middleware that protects routes by verifying a JWT.
 *
 * Expects the token in the `Authorization` header as:
 *   Authorization: Bearer <token>
 *
 * On success, attaches the decoded payload to `req.user`.
 * On failure, responds with 401 Unauthorized.
 *
 * @param {import('express').Request}  req  - Express request
 * @param {import('express').Response} res  - Express response
 * @param {Function}                   next - Express next middleware
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorised — no token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, iat, exp }
    return next();
  } catch (error) {
    // Differentiate between expired and malformed tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired — please log in again' });
    }
    return res.status(401).json({ error: 'Not authorised — invalid token' });
  }
};

module.exports = { protect };
