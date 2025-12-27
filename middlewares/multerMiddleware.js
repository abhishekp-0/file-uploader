import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, 'uploads/');
  },
  filename: (req, file, done) => {
    done(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
