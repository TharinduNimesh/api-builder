import { Router } from 'express';
import * as appAuthController from '../controllers/appAuth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', appAuthController.signup);
router.post('/signin', appAuthController.signin);
router.post('/refresh', appAuthController.refresh);
router.get('/revalidate', authenticate, appAuthController.revalidate);

export default router;
