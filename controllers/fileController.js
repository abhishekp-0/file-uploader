import { getFileById, renameFile as renameFileService } from '../services/fileService.js';
import { buildBreadcrumbs } from '../services/entityService.js';
import { getLocalFilePath } from '../services/fileService.js';

async function viewFile(req, res, next) {
  try {
    const fileId = parseInt(req.params.id);
    const file = await getFileById(fileId, req.user.id);
    const breadcrumbs = await buildBreadcrumbs(file);

    res.render('entities/file', {
      file: file,
      user: req.user,
      currentFolderId: file.parentId,
      breadcrumbs: breadcrumbs,
    });
  } catch (error) {
    console.error('View file error:', error);

    if (error.message.includes('not found')) {
      error.status = 404;
    }

    next(error);
  }
}

async function downloadFile(req, res, next) {
  try {
    const fileId = parseInt(req.params.id);
    const file = await getFileById(fileId, req.user.id);

    if (!file.storageKey) {
      const error = new Error('File storage key missing. This file cannot be downloaded.');
      error.status = 400;
      throw error;
    }

    const filePath = getLocalFilePath(file);

    res.download(filePath, file.name, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          next(err);
        }
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    next(error);
  }
}

async function renameFile(req, res, next) {
  try {
    const fileId = req.params.id;
    const newName = req.body.name;

    if (!newName || !newName.trim()) {
      const error = new Error('File name is required');
      error.status = 400;
      throw error;
    }

    const updatedFile = await renameFileService(fileId, req.user.id, newName);

    const redirectUrl = updatedFile.parentId ? `/folders/${updatedFile.parentId}` : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Rename file error:', error);

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

export { viewFile, downloadFile, renameFile };
