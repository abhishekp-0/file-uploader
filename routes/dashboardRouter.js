import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { renderDashboard } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();
dashboardRouter.get('/', isAuthenticated, renderDashboard);
