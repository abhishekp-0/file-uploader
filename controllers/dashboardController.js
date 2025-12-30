import { prisma } from '../config/prisma.js';

export async function renderDashboard(req, res, next) {
  try {
    const entities = await prisma.entity.findMany({
      where: {
        userId: req.user.id,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.render('dashboard/dashboard', {
      entities: entities,
      user: req.user,
      currentFolderId: null,
      breadcrumbs: [],
    });
  } catch (error) {
    console.error('Dashboard render error:', error);
    next(error);
  }
}
