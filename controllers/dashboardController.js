import { getRootEntities } from '../services/dashboardService.js';

export async function renderDashboard(req, res, next) {
  try {
    const entities = await getRootEntities(req.user.id);

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
