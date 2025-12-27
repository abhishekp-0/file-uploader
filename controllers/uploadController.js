import { prisma } from '../config/prisma.js';
import fs from 'fs/promises';

export async function uploadFile(req, res, _next) {
  const file = req.file;
  const parentId = req.query.parentId || null; // Changed from parentId to parent
  let parent = null;

  try {
    await validateParentId();

    //upload logic
    await prisma.entity.create({
      data: {
        name: file.originalname,
        type: 'FILE',
        size: file.size,
        mimeType: file.mimetype,
        parentId: parent ? parseInt(parentId) : null, // Added parseInt()
        userId: req.user.id,
      },
    });

    if (parent) {
      return res.redirect(`/entities/${parent.id}`);
    }

    return res.redirect('/dashboard');
  } catch (error) {
    // Delete uploaded file from disk
    if (file && file.path) {
      try {
        await fs.unlink(file.path);
        console.log(`Deleted file: ${file.path}`);
      } catch (unlinkError) {
        console.error(`Failed to delete file: ${file.path}`, unlinkError);
      }
    }

    // Surface error cleanly
    console.error('Upload error:', error);
    return res.status(400).render('error', {
      message: error.message || 'Failed to upload file',
      user: req.user,
    });
  }

  async function validateParentId() {
    if (parentId) {
      parent = await prisma.entity.findFirst({
        where: {
          id: parseInt(parentId),
          userId: req.user.id,
          type: 'FOLDER',
        },
      });

      if (!parent) {
        throw new Error('Invalid parent folder');
      }
    }
  }
}
