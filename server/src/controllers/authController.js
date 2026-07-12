import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to handle user registration
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, roleId } = req.body;
  const user = await authService.registerUser({ name, email, password, roleId });
  return sendSuccess(res, 'User registered successfully.', user, 201);
});

/**
 * Controller to handle user authentication (login)
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return sendSuccess(res, 'Authentication successful.', result, 200);
});

/**
 * Controller to retrieve authenticated user profile
 */
export const me = asyncHandler(async (req, res) => {
  // req.user has already been verified and populated by protect middleware
  return sendSuccess(res, 'Authenticated user details retrieved.', req.user, 200);
});
