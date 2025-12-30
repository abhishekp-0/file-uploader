import { prisma } from '../config/prisma.js';

async function buildBreadcrumbs(entity) {
  const trail = [entity];
  let current = entity;

  while (current?.parentId) {
    {
      current = await prisma.entity.findUnique({
        where: { id: current.parentId },
      });
    }
    trail.unshift(current);
  }
  return trail;
}

async function verifyParentFolder(parentId, userId) {
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
}

async function renameEntity(entityId, userId, newName) {
  const entity = await prisma.entity.findFirst({
    where: {
      id: parseInt(entityId),
      userId: userId,
    },
  });

  if (!entity) {
    throw new Error('Entity not found or access denied');
  }

  const conflict = await prisma.entity.findFirst({
    where: {
      parentId: entity.parentId,
      userId: userId,
      name: newName.trim(),
      NOT: { id: entity.id },
    },
  });

  if (conflict) {
    throw new Error('An entity with this name already exists in this folder');
  }

  const updatedEntity = await prisma.entity.update({
    where: { id: parseInt(entityId) },
    data: { name: newName.trim() },
  });

  return updatedEntity;
}

export { buildBreadcrumbs, verifyParentFolder as validateParentId, renameEntity };
