import { prisma } from '../config/prisma.js';
import fs from 'fs/promises';
import { validateParentId } from '../services/entityService.js';

export async function uploadFile(req, res, next) {
  const file = req.file;
  const parentId = req.query.parentId || null;

  try {
    if (!file) {
      const error = new Error('No file provided');
      error.status = 400;
      throw error;
    }

    const parent = await validateParentId(parentId, req.user.id);

    await prisma.entity.create({
      data: {
        name: file.originalname,
        type: 'FILE',
        size: file.size,
        mimeType: file.mimetype,
        storageKey: file.filename,
        parentId: parent ? parseInt(parentId) : null,
        userId: req.user.id,
      },
    });

    if (parent) {
      return res.redirect(`/entities/${parent.id}`);
    }

    return res.redirect('/dashboard');
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
