import { MAX_FILE_SIZE, ALLOWED_TYPES } from '../config/filePolicy.js';

export function validateFile(req, res, next) {
  const file = req.file;

  if (!file) {
    return res.status(400).render('error', {
      message: 'No file uploaded',
    });
  }

  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).render('error', {
      message: 'File exceeds maximum allowed size',
    });
  }

  // MIME type validation
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).render('error', {
      message: 'Unsupported file type',
    });
  }

  next();
}
