import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  providerProfile,
  respondReview,
  updatePlanMock
} from '../controllers/providerController.js';
import { createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/:id', providerProfile);
router.post('/:id/reviews', requireAuth, requireRole(['USER', 'ADMIN']), createReview);
router.post('/:id/activate-pro', requireAuth, requireRole(['PROVIDER', 'ADMIN']), updatePlanMock);
router.post('/reviews/:reviewId/reply', requireAuth, requireRole(['PROVIDER', 'ADMIN']), respondReview);

export default router;
