import { prisma } from '../config/prisma.js';

export async function fetchRoot(req, res) {
  const entities = await prisma.entity.findMany({
    where: {
      userId: req.user.id,
      parentId: null,
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json(entities);
}
