import { Router } from 'express';
import { productsIndex } from '../controllers/productController.js';

const router = Router();

router.get('/', productsIndex);

export default router;
