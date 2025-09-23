 import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// public read to check existence
router.get('/', projectController.getProject);

// creation requires auth
router.post('/', authenticate, projectController.createProject);

export default router;
