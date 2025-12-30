import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createFolder,
  renderEntityView,
  downloadEntity,
  renameEntity,
} from '../controllers/entityController.js';

export const entityRouter = Router();

entityRouter.use(isAuthenticated);
entityRouter.get('/:id', renderEntityView);
entityRouter.get('/:id/download', downloadEntity);
entityRouter.put('/:id', renameEntity);

entityRouter.post('/folder', createFolder);
