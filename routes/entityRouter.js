import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { createFolder, renderEntityView, downloadEntity } from '../controllers/entityController.js';

export const entityRouter = Router();
entityRouter.get('/:id', isAuthenticated, renderEntityView);
entityRouter.get('/:id/download', isAuthenticated, downloadEntity);

entityRouter.post('/folder', createFolder);
