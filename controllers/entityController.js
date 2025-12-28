import { prisma } from '../config/prisma.js';

async function buildBreadcrumb(entity) {
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

async function renderEntityView(req, res) {
  const entity = await prisma.entity.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });

  const children = await prisma.entity.findMany({
    where: {
      userId: req.user.id,
      parentId: parseInt(req.params.id),
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!entity) res.status(404);

  const breadcrumbs = await buildBreadcrumb(entity);
  if (entity.type === 'FOLDER') {
    // folder view
    res.render('dashboard/dashboard', {
      entities: children,
      user: req.user,
      currentFolderId: parseInt(req.params.id),
      breadcrumbs: breadcrumbs,
    });
  } else {
    res.render('entities/file', {
      file: entity,
      user: req.user,
      currentFolderId: parseInt(req.params.id),
      breadcrumbs: breadcrumbs,
    });
    // file detail view (Phase 2 basic)
  }
}

async function createFolder(req, res) {
  const parentId = req.query.parent ? parseInt(req.query.parent) : null;
  const parent = parentId
    ? await prisma.entity.findFirst({
        where: { id: parentId, userId: req.user.id, type: 'FOLDER' },
      })
    : null;

  if (parent) {
    await prisma.entity.create({
      data: {
        name: req.body.name,
        type: 'FOLDER',
        userId: req.user.id,
        parentId: parentId,
      },
    });
  }

  const redirectUrl = parentId ? `/entities/${parentId}` : '/dashboard';
  res.redirect(redirectUrl);
}

export { renderEntityView, createFolder };
