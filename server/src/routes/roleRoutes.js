import express from 'express';
import * as roleController from '../controllers/roleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes here require authentication
router.use(protect);

// Anyone authenticated can read roles
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRole);

// Only 'Fleet Manager' can perform write/mutate actions on roles
router.post('/', restrictTo('Fleet Manager'), roleController.createRole);
router.put('/:id', restrictTo('Fleet Manager'), roleController.updateRole);
router.delete('/:id', restrictTo('Fleet Manager'), roleController.deleteRole);

export default router;
