import {
  getFileById,
  renameFile as renameFileService,
  deleteFile as deleteFileService,
} from '../services/fileService.js';
import { buildBreadcrumbs } from '../services/entityService.js';
import { getLocalFilePath } from '../services/fileService.js';
import fs from 'fs/promises';

// Helper function for validation
function validateFileId(id) {
  const fileId = parseInt(id);
  if (isNaN(fileId) || fileId <= 0) {
    const error = new Error('Invalid file ID');
    error.status = 400;
    throw error;
  }
  return fileId;
}

async function viewFile(req, res, next) {
  try {
    const fileId = validateFileId(req.params.id);

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
    const fileId = validateFileId(req.params.id);
    const file = await getFileById(fileId, req.user.id); // Verify DB entity

    if (!file.storageKey) {
      const error = new Error('File storage key missing. This file cannot be downloaded.');
      error.status = 400;
      throw error;
    }

    const filePath = getLocalFilePath(file);

    //  Verify filesystem file exists
    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch (fsError) {
      //  Log the actual error
      console.error(`File missing on disk: ${file.storageKey} (ID: ${fileId})`, fsError);

      //  Show user-friendly message
      const error = new Error('This file is unavailable. It may have been removed.');
      error.status = 404;
      throw error;
    }

    res.download(filePath, file.name, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          // Even if download fails mid-stream, log it properly
          const error = new Error('File download failed. Please try again.');
          error.status = 500;
          next(error);
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
    const fileId = validateFileId(req.params.id);
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

async function deleteFile(req, res, next) {
  try {
    const fileId = validateFileId(req.params.id);
    const deletedFile = await deleteFileService(fileId, req.user.id);

    const redirectUrl = deletedFile.parentId ? `/folders/${deletedFile.parentId}` : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Delete file error:', error);

    if (error.message.includes('not found')) {
      error.status = 404;
    } else if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
}

export { viewFile, downloadFile, renameFile, deleteFile };
