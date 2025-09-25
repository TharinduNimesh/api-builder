import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ensureActiveUser } from '../middleware/projectAccess.middleware';

const router = Router();

// Create table endpoint - only authenticated active users
router.post('/', authenticate, ensureActiveUser, tableController.createTable);
// List tables
router.get('/', authenticate, ensureActiveUser, tableController.listTables);

// Table introspection and management
router.get('/:schema/:name/columns', authenticate, ensureActiveUser, tableController.getColumns);
router.get('/:schema/:name/rows', authenticate, ensureActiveUser, tableController.getRows);
router.delete('/:schema/:name', authenticate, ensureActiveUser, tableController.dropTable);

export default router;
