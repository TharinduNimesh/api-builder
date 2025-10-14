import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { ensureActiveUser } from '../middleware/projectAccess.middleware';
import * as endpointController from '../controllers/endpoint.controller';

const router = Router();

// CRUD for endpoints (builder-only)
router.get('/', authenticate, ensureActiveUser, endpointController.list);
router.post('/', authenticate, ensureActiveUser, endpointController.create);
router.put('/:id', authenticate, ensureActiveUser, endpointController.update);
router.delete('/:id', authenticate, ensureActiveUser, endpointController.remove);

export default router;
