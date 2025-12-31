import { prisma } from '../config/prisma.js';

async function buildBreadcrumbs(entity) {
  const trail = [entity];
  let current = entity;

  while (current?.parentId) {
    current = await prisma.entity.findUnique({
      where: { id: current.parentId },
    });
    trail.unshift(current);
  }
  return trail;
}

export { buildBreadcrumbs };
