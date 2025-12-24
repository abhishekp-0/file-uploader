import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { prisma } from '../config/prisma.js';
import { isAuthenticated } from './authRouter.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileRouter = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// File filter to validate file types (optional)
const fileFilter = (req, file, cb) => {
  // Accept all files for now
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload file route
fileRouter.post('/upload', isAuthenticated, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Save file metadata to database
    const fileEntity = await prisma.entity.create({
      data: {
        name: req.file.originalname,
        type: 'FILE',
        size: req.file.size,
        mimeType: req.file.mimetype,
        userId: req.user.id,
        // parentId can be set if uploading to a specific folder
        parentId: req.body.folderId ? parseInt(req.body.folderId) : null,
      },
    });

    console.log('File saved to database:', fileEntity);

    res.redirect('/dashboard?upload=success');
  } catch (err) {
    // If database save fails, delete the uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(err);
  }
});

export default fileRouter;
