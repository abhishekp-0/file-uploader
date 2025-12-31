import path from 'path';
import { prisma } from '../config/prisma.js';
import fs from 'fs/promises';

export function getLocalFilePath(entity) {
  return path.join(process.cwd(), 'uploads', entity.storageKey);
}

async function getFileById(fileId, userId) {
  const file = await prisma.entity.findFirst({
    where: {
      id: parseInt(fileId),
      userId: userId,
      type: 'FILE',
    },
  });

  if (!file) {
    throw new Error('File not found');
  }

  return file;
}

async function createFile(fileData, userId, parentId = null) {
  const { originalname, size, mimetype, filename } = fileData;

  return await prisma.entity.create({
    data: {
      name: originalname,
      type: 'FILE',
      size: size,
      mimeType: mimetype,
      storageKey: filename,
      parentId: parentId ? parseInt(parentId) : null,
      userId: userId,
    },
  });
}

async function renameFile(fileId, userId, newName) {
  const file = await getFileById(fileId, userId);

  // Check for name conflicts
  const conflict = await prisma.entity.findFirst({
    where: {
      parentId: file.parentId,
      userId: userId,
      name: newName.trim(),
      type: 'FILE',
      NOT: { id: file.id },
    },
  });

  if (conflict) {
    throw new Error('A file with this name already exists in this location');
  }

  return await prisma.entity.update({
    where: { id: parseInt(fileId) },
    data: { name: newName.trim() },
  });
}

async function deleteFile(fileId, userId) {
  const file = await getFileById(fileId, userId);

  // Delete from database
  await prisma.entity.delete({
    where: { id: parseInt(fileId) },
  });

  // Delete physical file
  if (file.storageKey) {
    try {
      const filePath = getLocalFilePath(file);
      await fs.unlink(filePath);
      console.log(`Deleted file from disk: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file from disk:`, error);
      // Don't throw - file already deleted from DB
    }
  }

  return file;
}

export { getFileById, createFile, renameFile, deleteFile };
