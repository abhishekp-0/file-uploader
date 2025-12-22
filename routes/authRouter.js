import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { prisma } from '../prisma.js';

const authRouter = Router();

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Login page
authRouter.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('login');
});

// Login POST
authRouter.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
);

// Signup page
authRouter.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('signup');
});

// Signup POST
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
});

// Logout POST
authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

export default authRouter;
