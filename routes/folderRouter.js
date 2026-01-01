import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  viewFolder,
  createFolder,
  renameFolder,
  deleteFolder,
} from '../controllers/folderController.js';

export const folderRouter = Router();

folderRouter.use(isAuthenticated);

// View folder contents
folderRouter.get('/:id', viewFolder);

// Create new folder
folderRouter.post('/', createFolder);

// Rename folder
folderRouter.put('/:id', renameFolder);

// Delete folder
folderRouter.delete('/:id', deleteFolder);
