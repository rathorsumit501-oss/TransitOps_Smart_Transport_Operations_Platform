import prisma from '../config/db.js';
import { ConflictError, NotFoundError } from '../utils/errorHandler.js';

/**
 * Retrieve all roles
 * @returns {Promise<Array>} List of roles
 */
export const getAllRoles = async () => {
  return prisma.role.findMany({
    orderBy: { id: 'asc' },
  });
};

/**
 * Retrieve a role by ID
 * @param {number} id - Role ID
 * @returns {Promise<Object>} Role details
 */
export const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id: parseInt(id) },
  });

  if (!role) {
    throw new NotFoundError(`Role with ID ${id} not found.`);
  }

  return role;
};

/**
 * Create a new role
 * @param {Object} roleData - Role details
 * @returns {Promise<Object>} Created role
 */
export const createRole = async ({ name, description }) => {
  // Check unique role name
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    throw new ConflictError(`Role with name "${name}" already exists.`);
  }

  return prisma.role.create({
    data: {
      name,
      description,
    },
  });
};

/**
 * Update an existing role
 * @param {number} id - Role ID
 * @param {Object} updateData - Role updates
 * @returns {Promise<Object>} Updated role
 */
export const updateRole = async (id, { name, description }) => {
  const parsedId = parseInt(id);

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: parsedId },
  });

  if (!role) {
    throw new NotFoundError(`Role with ID ${id} not found.`);
  }

  // Check if changing name to a name that already exists in other roles
  if (name && name !== role.name) {
    const existingName = await prisma.role.findUnique({
      where: { name },
    });
    if (existingName) {
      throw new ConflictError(`Another role with name "${name}" already exists.`);
    }
  }

  return prisma.role.update({
    where: { id: parsedId },
    data: {
      name: name || undefined,
      description: description !== undefined ? description : undefined,
    },
  });
};

/**
 * Delete a role by ID
 * @param {number} id - Role ID
 * @returns {Promise<Object>} Deleted role
 */
export const deleteRole = async (id) => {
  const parsedId = parseInt(id);

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: parsedId },
  });

  if (!role) {
    throw new NotFoundError(`Role with ID ${id} not found.`);
  }

  return prisma.role.delete({
    where: { id: parsedId },
  });
};
