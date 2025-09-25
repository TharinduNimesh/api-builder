import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ensureActiveUser, ensureProjectOwner } from '../middleware/projectAccess.middleware';

const router = Router();

// list users - only active accounts can view users
router.get('/', authenticate, ensureActiveUser, userController.listUsers);

// update user status (activate/inactivate) - only project owner
router.patch('/:id/status', authenticate, ensureProjectOwner, userController.updateUserStatus);

export default router;
