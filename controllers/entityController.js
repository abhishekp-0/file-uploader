import { prisma } from '../config/prisma.js';

async function renderFolder(req, res) {
  const entities = await prisma.entity.findMany({
    where: {
      userId: req.user.id,
      parentId: parseInt(req.params.id),
    },
    orderBy: { createdAt: 'asc' },
  });
  res.render('dashboard/dashboard', {
    entities: entities,
    user: req.user,
    currentFolderId: parseInt(req.params.id),
  });
}

async function createFolder(req, res) {
  const parentId = req.query.parent ? parseInt(req.query.parent) : null;

  await prisma.entity.create({
    data: {
      name: req.body.name,
      type: 'FOLDER',
      userId: req.user.id,
      parentId: parentId,
    },
  });

  const redirectUrl = parentId ? `/entities/${parentId}` : '/dashboard';
  res.redirect(redirectUrl);
}

export { renderFolder, createFolder };
