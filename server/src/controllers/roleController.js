import * as roleService from '../services/roleService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to get all roles
 */
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.getAllRoles();
  return sendSuccess(res, 'Roles retrieved successfully.', roles, 200);
});

/**
 * Controller to get a specific role details by ID
 */
export const getRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await roleService.getRoleById(id);
  return sendSuccess(res, 'Role details retrieved successfully.', role, 200);
});

/**
 * Controller to create a new role
 */
export const createRole = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const newRole = await roleService.createRole({ name, description });
  return sendSuccess(res, 'Role created successfully.', newRole, 201);
});

/**
 * Controller to update a role
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const updatedRole = await roleService.updateRole(id, { name, description });
  return sendSuccess(res, 'Role updated successfully.', updatedRole, 200);
});

/**
 * Controller to delete a role
 */
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await roleService.deleteRole(id);
  return sendSuccess(res, `Role with ID ${id} deleted successfully.`, null, 200);
});
