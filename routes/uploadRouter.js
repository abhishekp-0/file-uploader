import { Router } from 'express';
import { upload } from '../middlewares/multerMiddleware.js';
import { validateFile } from '../middlewares/fileValidationMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
const uploadRouter = Router();

uploadRouter.post('/upload/file', isAuthenticated, upload.single('file'), validateFile, uploadFile);

export default uploadRouter;
