import { ForbiddenError } from '../utils/errorHandler.js';

/**
 * Middleware to restrict endpoints to specific user roles
 * @param {...string} roles - Permitted roles (e.g. 'Fleet Manager', 'Driver')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user and req.user.role should be populated by protect middleware
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Access forbidden. User permissions not verified.'));
    }

    const hasPermission = roles.includes(req.user.role.name);
    if (!hasPermission) {
      return next(
        new ForbiddenError('Access forbidden. You do not have permission to access this resource.')
      );
    }

    next();
  };
};
export default restrictTo;
