import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { sessionMiddleware } from './config/session.js';
import passport from 'passport';
import './config/passport.js';
import { authRouter } from './routes/authRouter.js';
import { dashboardRouter } from './routes/dashboardRouter.js';
import { entityRouter } from './routes/entityRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(sessionMiddleware);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/entities', entityRouter);

// // Routes
// app.use('/', authRouter);
// app.use('/', isAuthenticated, fileRouter);

// app.get('/', (req, res) => {
//   res.render('index', { user: req.user });
// });

// app.get('/dashboard', isAuthenticated, (req, res) => {
//   const uploadSuccess = req.query.upload === 'success';
//   res.render('dashboard', { user: req.user, uploadSuccess });
// });

// app.use((req, res) => {
//   res.status(404).send('404 ERROR : Page not found');
// });

// app.use((err, req, res, _next) => {
//   const statusCode = err.statusCode || 500;
//   console.error(`${statusCode} ERROR :`, err);
//   res.status(statusCode).send(`${statusCode} ERROR : ${err.message}`);
// });

export default app;
