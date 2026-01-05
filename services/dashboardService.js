import { prisma } from '../config/prisma.js';

async function getRootEntities(userId) {
  return await prisma.entity.findMany({
    where: {
      userId: userId,
      parentId: null,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export { getRootEntities };
