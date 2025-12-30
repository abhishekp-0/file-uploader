import { prisma } from '../config/prisma.js';
import { getLocalFilePath } from '../services/fileService.js';
import {
  buildBreadcrumbs,
  renameEntity as renameEntityService,
} from '../services/entityService.js';

async function renderEntityView(req, res, next) {
  try {
    const entity = await prisma.entity.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });

    if (!entity) {
      const error = new Error('Entity not found');
      error.status = 404;
      throw error;
    }

    const children = await prisma.entity.findMany({
      where: {
        userId: req.user.id,
        parentId: parseInt(req.params.id),
      },
      orderBy: { createdAt: 'asc' },
    });

    const breadcrumbs = await buildBreadcrumbs(entity);

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
    }
  } catch (error) {
    console.error('Render entity error:', error);
    next(error);
  }
}

async function downloadEntity(req, res, next) {
  try {
    const entity = await prisma.entity.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
        type: 'FILE',
      },
    });

    if (!entity) {
      const error = new Error('File not found');
      error.status = 404;
      throw error;
    }

    if (!entity.storageKey) {
      const error = new Error('File storage key missing. This file cannot be downloaded.');
      error.status = 400;
      throw error;
    }

    const filePath = getLocalFilePath(entity);

    res.download(filePath, entity.name, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          next(err);
        }
      }
    });
  } catch (error) {
    console.error('Download entity error:', error);
    next(error);
  }
}

async function renameEntity(req, res, next) {
  try {
    const { id } = req.params;
    const newName = req.body.name;

    const updatedEntity = await renameEntityService(id, req.user.id, newName);
    const redirectUrl = updatedEntity.parentId
      ? `/entities/${updatedEntity.parentId}`
      : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Rename failed:', error);

    // Set appropriate status code
    if (error.message.includes('already exists')) {
      error.status = 409;
    } else if (error.message.includes('not found') || error.message.includes('access denied')) {
      error.status = 404;
    } else if (!error.status) {
      error.status = 500;
    }

    next(error);
  }
}

async function createFolder(req, res, next) {
  try {
    const parentId = req.query.parent ? parseInt(req.query.parent) : null;

    if (parentId) {
      const parent = await prisma.entity.findFirst({
        where: { id: parentId, userId: req.user.id, type: 'FOLDER' },
      });

      if (!parent) {
        const error = new Error('Invalid parent folder');
        error.status = 404;
        throw error;
      }

      await prisma.entity.create({
        data: {
          name: req.body.name,
          type: 'FOLDER',
          userId: req.user.id,
          parentId: parentId,
        },
      });
    } else {
      await prisma.entity.create({
        data: {
          name: req.body.name,
          type: 'FOLDER',
          userId: req.user.id,
          parentId: null,
        },
      });
    }

    const redirectUrl = parentId ? `/entities/${parentId}` : '/dashboard';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Create folder error:', error);
    next(error);
  }
}

export { renderEntityView, createFolder, downloadEntity, renameEntity };
