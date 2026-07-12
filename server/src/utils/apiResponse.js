/**
 * Standard API Response helpers
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Response payload data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {any} errors - Detailed errors list or validation errors
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const sendError = (res, message, errors = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
