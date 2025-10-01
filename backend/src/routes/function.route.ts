import { Router } from 'express';
import * as functionController from '../controllers/function.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ensureActiveUser } from '../middleware/projectAccess.middleware';

const router = Router();

router.post('/', authenticate, ensureActiveUser, functionController.createFunction);
router.get('/', authenticate, ensureActiveUser, functionController.listFunctions);
router.get('/:schema/:name', authenticate, ensureActiveUser, functionController.getDefinition);
router.delete('/:schema/:name', authenticate, ensureActiveUser, functionController.dropFunction);
router.post('/:schema/:name/run', authenticate, ensureActiveUser, functionController.runFunction);

export default router;
