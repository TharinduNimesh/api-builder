import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ensureProjectOwner } from '../middleware/projectAccess.middleware';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Get settings (available to all authenticated users)
router.get('/', settingsController.getSettings);

// Update profile (available to all authenticated users)
router.put('/profile', settingsController.updateProfile);

// Delete/deactivate account (available to all authenticated users)
// Owners will delete account + project, regular users will deactivate
router.delete('/account', settingsController.deleteAccount);

// Owner-only routes (project management, roles, danger zone)
router.put('/project', ensureProjectOwner, settingsController.updateProject);
router.put('/roles', ensureProjectOwner, settingsController.updateRoles);
router.post('/reset', ensureProjectOwner, settingsController.resetProject);

export default router;
