/**
 * Async handler utility to wrap express middleware/route handlers
 * and forward any uncaught exceptions to the next error middleware.
 * 
 * @param {Function} fn - Async express handler
 * @returns {Function} Wrapped express handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
