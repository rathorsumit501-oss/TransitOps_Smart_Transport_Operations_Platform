import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hashHelper.js';
import { generateToken } from '../utils/jwtHelper.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errorHandler.js';

/**
 * Register a new user
 * @param {Object} userData - User register details
 * @returns {Promise<Object>} Created user details without password
 */
export const registerUser = async ({ name, email, password, roleId }) => {
  // Check if roleId exists
  const roleExists = await prisma.role.findUnique({
    where: { id: parseInt(roleId) },
  });

  if (!roleExists) {
    throw new BadRequestError('The provided role ID does not exist.');
  }

  // Check if email already exists
  const emailExists = await prisma.user.findUnique({
    where: { email },
  });

  if (emailExists) {
    throw new ConflictError('A user account with this email address already exists.');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: parseInt(roleId),
    },
    include: {
      role: true,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Authenticate a user
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Contains auth token and user profile
 */
export const loginUser = async ({ email, password }) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials.');
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password credentials.');
  }

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email });

  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword,
  };
};

/**
 * Retrieve user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User details without password
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new BadRequestError('User not found.');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
