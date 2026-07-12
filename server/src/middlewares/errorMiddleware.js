import { sendError } from '../utils/apiResponse.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * Global Express Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log non-operational error stack trace during development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      raw: err,
    });
  } else {
    // In production, log critical errors
    if (err.statusCode === 500 || !err.isOperational) {
      console.error('Critical Error:', err);
    }
  }

  // Handle Prisma Known Request Errors
  if (err.code && err.code.startsWith('P')) {
    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
      const targetFields = err.meta?.target || 'field';
      return sendError(
        res,
        `Duplicate value resource violation. A resource with this ${targetFields} already exists.`,
        null,
        409
      );
    }

    // Prisma Record Not Found
    if (err.code === 'P2025') {
      return sendError(
        res,
        err.meta?.cause || 'Record not found in database.',
        null,
        404
      );
    }

    // Prisma Foreign Key Constraint Violation
    if (err.code === 'P2003') {
      return sendError(
        res,
        'Database relation key constraint failed. Related resource was not found.',
        null,
        400
      );
    }
  }

  // Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid verification token. Please log in again.', null, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired. Please log in again.', null, 401);
  }

  // If the error is operational (custom instance of AppError), send the response
  if (err.isOperational) {
    return sendError(res, err.message, err.errors || null, err.statusCode);
  }

  // For unhandled non-operational errors (bugs, package breakdowns), send generic message in production
  const productionMessage = 'Something went wrong on the server. Please try again later.';
  return sendError(
    res,
    process.env.NODE_ENV === 'development' ? err.message : productionMessage,
    process.env.NODE_ENV === 'development' ? err.stack : null,
    err.statusCode
  );
};

export default errorMiddleware;
