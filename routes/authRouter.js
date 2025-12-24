import { Router } from 'express';
import * as authController from '../controllers/authController.js';
const router = Router();

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.get('/register', authController.renderRegister);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

export { router as authRouter };
