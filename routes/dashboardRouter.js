import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { fetchRoot } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();
dashboardRouter.get('/', isAuthenticated, fetchRoot);
