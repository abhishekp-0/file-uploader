import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { createFolder, renderEntityView } from '../controllers/entityController.js';

export const entityRouter = Router();
entityRouter.get('/:id', isAuthenticated, renderEntityView);
entityRouter.post('/folder', createFolder);
