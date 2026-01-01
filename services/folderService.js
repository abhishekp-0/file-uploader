import { prisma } from '../config/prisma.js';
import { getLocalFilePath } from './fileService.js';
import fs from 'fs/promises';

async function validateParentFolder(parentId, userId) {
  if (!parentId) return null;

  const parent = await prisma.entity.findFirst({
    where: {
      id: parseInt(parentId),
      userId: userId,
      type: 'FOLDER',
    },
  });

  if (!parent) {
    throw new Error('Invalid parent folder');
  }

  return parent;
}

async function getFolderById(folderId, userId) {
  const folder = await prisma.entity.findFirst({
    where: {
      id: parseInt(folderId),
      userId: userId,
      type: 'FOLDER',
    },
  });

  if (!folder) {
    throw new Error('Folder not found');
  }

  return folder;
}

async function getFolderContents(folderId, userId) {
  return await prisma.entity.findMany({
    where: {
      userId: userId,
      parentId: parseInt(folderId),
    },
    orderBy: { createdAt: 'asc' },
  });
}

async function createFolder(name, userId, parentId = null) {
  // Validate parent if provided
  if (parentId) {
    await validateParentFolder(parentId, userId);
  }

  // Check for name conflicts
  const conflict = await prisma.entity.findFirst({
    where: {
      parentId: parentId ? parseInt(parentId) : null,
      userId: userId,
      name: name.trim(),
      type: 'FOLDER',
    },
  });

  if (conflict) {
    throw new Error('A folder with this name already exists in this location');
  }

  return await prisma.entity.create({
    data: {
      name: name.trim(),
      type: 'FOLDER',
      userId: userId,
      parentId: parentId ? parseInt(parentId) : null,
    },
  });
}

async function renameFolder(folderId, userId, newName) {
  const folder = await getFolderById(folderId, userId);

  // Check for name conflicts
  const conflict = await prisma.entity.findFirst({
    where: {
      parentId: folder.parentId,
      userId: userId,
      name: newName.trim(),
      type: 'FOLDER',
      NOT: { id: folder.id },
    },
  });

  if (conflict) {
    throw new Error('A folder with this name already exists in this location');
  }

  return await prisma.entity.update({
    where: { id: parseInt(folderId) },
    data: { name: newName.trim() },
  });
}

async function collectDescendantFiles(folderId) {
  const files = [];

  const children = await prisma.entity.findMany({
    where: { parentId: parseInt(folderId) },
  });

  for (const child of children) {
    if (child.type === 'FILE') {
      files.push(child);
    } else {
      const nestedFiles = await collectDescendantFiles(child.id);
      files.push(...nestedFiles);
    }
  }

  return files;
}

async function deleteFolder(folderId, userId) {
  const folder = await getFolderById(folderId, userId);

  // Collect all descendant files recursively
  const descendantFiles = await collectDescendantFiles(folderId);

  // Delete folder entity (DB cascade will delete all children)
  await prisma.entity.delete({
    where: { id: parseInt(folderId) },
  });

  // Delete all descendant files from filesystem
  for (const file of descendantFiles) {
    if (file.storageKey) {
      try {
        const filePath = getLocalFilePath(file);
        await fs.unlink(filePath);
        console.log(`Deleted file from disk: ${filePath}`);
      } catch (error) {
        console.error(`Failed to delete file from disk: ${file.storageKey}`, error);
        // Continue deleting other files even if one fails
      }
    }
  }

  return folder;
}

export {
  validateParentFolder,
  getFolderById,
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
};
