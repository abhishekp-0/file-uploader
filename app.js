import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import methodOverride from 'method-override';
import { sessionMiddleware } from './config/session.js';
import passport from 'passport';
import './config/passport.js';
import { authRouter } from './routes/authRouter.js';
import { dashboardRouter } from './routes/dashboardRouter.js';
import { folderRouter } from './routes/folderRouter.js';
import { fileRouter } from './routes/fileRouter.js';
import uploadRouter from './routes/uploadRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Body parsers (REQUIRED before method-override)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 2. method-override
app.use(methodOverride('_method'));

// 3. View engine & static
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 4. Session
app.use(sessionMiddleware);

// 5. Passport (depends on req.method)
app.use(passport.initialize());
app.use(passport.session());

// 6. Routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);
app.use('/', uploadRouter);

// Error handling middleware
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).render('error', {
    message: message,
    status: status,
    user: req.user || null,
  });
});

export default app;
