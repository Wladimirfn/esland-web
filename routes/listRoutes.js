import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  activatePro,
  createList,
  myLists,
  saveProvider
} from '../controllers/listController.js';

const router = Router();

router.use(requireAuth, requireRole(['USER', 'ADMIN']));
router.get('/', myLists);
router.post('/', createList);
router.post('/activate-pro', activatePro);
router.post('/save/:providerId', saveProvider);

export default router;
