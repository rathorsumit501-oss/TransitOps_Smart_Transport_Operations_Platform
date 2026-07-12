import { Router } from 'express';
import { getStats, getCharts } from '../controllers/dashboardController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Assuming verifyJWT middleware is imported and used, but for now we'll route directly or use a dummy auth.
// If the user wants no changes to auth, we assume they will add it, or we add a basic structure.
router.route('/stats').get(getStats);
router.route('/charts').get(getCharts);

export default router;
