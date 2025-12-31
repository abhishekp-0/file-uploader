import {
  createFolder as createFolderService,
  getFolderById,
  getFolderContents,
  renameFolder as renameFolderService,
} from '../services/folderService.js';
import { buildBreadcrumbs } from '../services/entityService.js';

async function viewFolder(req, res, next) {
  try {
    const folderId = parseInt(req.params.id);
    const folder = await getFolderById(folderId, req.user.id);
    const children = await getFolderContents(folderId, req.user.id);
    const breadcrumbs = await buildBreadcrumbs(folder);

    res.render('dashboard/dashboard', {
      entities: children,
      user: req.user,
      currentFolderId: folderId,
      breadcrumbs: breadcrumbs,
    });
  } catch (error) {
    console.error('View folder error:', error);

    if (error.message.includes('not found')) {
      error.status = 404;
    }

    next(error);
  }
}

async function createFolder(req, res, next) {
  try {
    const parentId = req.query.parent || null;
    const folderName = req.body.name;

    if (!folderName || !folderName.trim()) {
      const error = new Error('Folder name is required');
      error.status = 400;
      throw error;
    }

    const folder = await createFolderService(folderName, req.user.id, parentId);

    const redirectUrl = parentId ? `/folders/${parentId}` : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Create folder error:', error);

    if (error.message.includes('already exists')) {
      error.status = 409;
    } else if (error.message.includes('Invalid parent')) {
      error.status = 404;
    } else if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
}

async function renameFolder(req, res, next) {
  try {
    const folderId = req.params.id;
    const newName = req.body.name;

    if (!newName || !newName.trim()) {
      const error = new Error('Folder name is required');
      error.status = 400;
      throw error;
    }

    const updatedFolder = await renameFolderService(folderId, req.user.id, newName);

    const redirectUrl = updatedFolder.parentId
      ? `/folders/${updatedFolder.parentId}`
      : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Rename folder error:', error);

    if (error.message.includes('already exists')) {
      error.status = 409;
    } else if (error.message.includes('not found')) {
      error.status = 404;
    } else if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
}

export { viewFolder, createFolder, renameFolder };
