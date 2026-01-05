import {
  createFolder as createFolderService,
  getFolderById,
  getFolderContents,
  renameFolder as renameFolderService,
  deleteFolder as deleteFolderService,
} from '../services/folderService.js';
import { buildBreadcrumbs } from '../services/entityService.js';

// Helper function for validation
function validateFolderId(id) {
  const folderId = parseInt(id);
  if (isNaN(folderId) || folderId <= 0) {
    const error = new Error('Invalid folder ID');
    error.status = 400;
    throw error;
  }
  return folderId;
}

async function viewFolder(req, res, next) {
  try {
    const folderId = validateFolderId(req.params.id);
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

    // parentId can be null (root), validate only if provided
    if (parentId !== null) {
      validateFolderId(parentId);
    }

    await createFolderService(folderName, req.user.id, parentId);

    const redirectUrl = parentId ? `/folders/${parentId}` : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
}

async function renameFolder(req, res, next) {
  try {
    const folderId = validateFolderId(req.params.id);
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
    next(error);
  }
}

async function deleteFolder(req, res, next) {
  try {
    const folderId = validateFolderId(req.params.id);
    const deletedFolder = await deleteFolderService(folderId, req.user.id);

    const redirectUrl = deletedFolder.parentId
      ? `/folders/${deletedFolder.parentId}`
      : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
}

export { viewFolder, createFolder, renameFolder, deleteFolder };
