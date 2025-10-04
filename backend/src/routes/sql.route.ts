import { Router } from 'express';
import * as sqlController from '../controllers/sql.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ensureActiveUser } from '../middleware/projectAccess.middleware';

const router = Router();

// SQL execution
router.post('/execute', authenticate, ensureActiveUser, sqlController.executeQuery);

// Query history
router.get('/history', authenticate, ensureActiveUser, sqlController.getQueryHistory);
router.get('/history/all', authenticate, ensureActiveUser, sqlController.getAllQueryHistory);

// SQL snippets
router.post('/snippets', authenticate, ensureActiveUser, sqlController.saveSnippet);
router.get('/snippets', authenticate, ensureActiveUser, sqlController.getSnippets);
router.get('/snippets/all', authenticate, ensureActiveUser, sqlController.getAllSnippets);
router.put('/snippets/:id', authenticate, ensureActiveUser, sqlController.updateSnippet);
router.delete('/snippets/:id', authenticate, ensureActiveUser, sqlController.deleteSnippet);

export default router;
