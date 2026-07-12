import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token
 * @param {Object} payload - Data to sign inside the token
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes';
  return jwt.verify(token, secret);
};
