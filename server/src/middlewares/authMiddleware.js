import { verifyToken } from '../utils/jwtHelper.js';
import prisma from '../config/db.js';
import { UnauthorizedError } from '../utils/errorHandler.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication protector middleware
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Read token from authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Access denied. No authentication token provided.');
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired verification token. Please log in again.');
  }

  // 3) Find user in database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('The account associated with this session no longer exists.');
  }

  // 4) Attach user object (excluding the hashed password) to req.user
  const { password, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;

  next();
});
