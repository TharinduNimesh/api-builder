import { Router } from 'express';
import * as appUserController from '../controllers/appUser.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// list app users (owner only check in controller)
router.get('/', authenticate, appUserController.listAppUsers);

// set app user status (active/inactive)
router.patch('/:id/status', authenticate, appUserController.setStatus);

export default router;
