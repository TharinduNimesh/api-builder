import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh', authController.refresh);
router.get('/revalidate', authenticate, authController.revalidate);

export default router;
