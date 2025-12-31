import { createFile } from '../services/fileService.js';
import { validateParentFolder } from '../services/folderService.js';
import fs from 'fs/promises';

export async function uploadFile(req, res, next) {
  const file = req.file;
  const parentId = req.query.parentId || null;

  try {
    if (!file) {
      const error = new Error('No file provided');
      error.status = 400;
      throw error;
    }

    // Validate parent folder if provided
    if (parentId) {
      await validateParentFolder(parentId, req.user.id);
    }

    await createFile(file, req.user.id, parentId);

    const redirectUrl = parentId ? `/folders/${parentId}` : '/dashboard';
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Upload error:', error);

    // Delete uploaded file from disk if it exists
    if (file && file.path) {
      try {
        await fs.unlink(file.path);
        console.log(`Deleted file: ${file.path}`);
      } catch (unlinkError) {
        console.error(`Failed to delete file: ${file.path}`, unlinkError);
      }
    }

    // Set status if not already set
    if (!error.status) {
      error.status = 400;
    }

    next(error);
  }
}
