import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { createFolder, renderFolder } from '../controllers/entityController.js';

export const entityRouter = Router();
entityRouter.get('/:id', isAuthenticated, renderFolder);
entityRouter.post('/folder', createFolder);
