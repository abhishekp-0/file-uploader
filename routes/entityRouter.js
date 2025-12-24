import { Router } from 'express';
import { createFolder, renderFolder } from '../controllers/entityController.js';

export const entityRouter = Router();
entityRouter.get('/:id', renderFolder);
entityRouter.post('/folder', createFolder);
