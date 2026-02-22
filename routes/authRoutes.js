import { Router } from 'express';
import {
  login,
  logout,
  register,
  showLogin,
  showRegister
} from '../controllers/authController.js';

const router = Router();

router.get('/login', showLogin);
router.get('/register', showRegister);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

export default router;
