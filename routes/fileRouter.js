import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { viewFile, downloadFile, renameFile } from '../controllers/fileController.js';

export const fileRouter = Router();

fileRouter.use(isAuthenticated);

// View file details
fileRouter.get('/:id', viewFile);

// Download file
fileRouter.get('/:id/download', downloadFile);

// Rename file
fileRouter.put('/:id', renameFile);
