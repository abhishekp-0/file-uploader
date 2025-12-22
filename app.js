import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from './prisma.js';
import authRouter, { isAuthenticated } from './routes/authRouter.js';
import fileRouter from './routes/fileRouter.js';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session configuration with Prisma session store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use('/', authRouter);
app.use('/', isAuthenticated, fileRouter);

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  const uploadSuccess = req.query.upload === 'success';
  res.render('dashboard', { user: req.user, uploadSuccess });
});

app.use((req, res) => {
  res.status(404).send('404 ERROR : Page not found');
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error(`${statusCode} ERROR :`, err);

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File too large. Maximum size is 10MB.');
    }
    return res.status(400).send(`Upload error: ${err.message}`);
  }

  res.status(statusCode).send(`${statusCode} ERROR : ${err.message}`);
});

app.listen(PORT, () => {
  console.log(`App listening on Port ${PORT}`);
});
