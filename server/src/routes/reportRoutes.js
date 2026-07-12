import { Router } from 'express';
import { getAnalyticsData, exportCsv, exportPdf } from '../controllers/reportController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.route('/analytics').get(getAnalyticsData);
router.route('/export/csv').get(exportCsv);
router.route('/export/pdf').get(exportPdf);

export default router;
