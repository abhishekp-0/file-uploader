import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import passport from 'passport';

export function renderLogin(req, res) {
  res.render('auth/login', { error: null });
}

export function login(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })(req, res, next);
}

export function renderRegister(req, res) {
  res.render('auth/register', { error: null });
}

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    // validate (already run via middleware)
    //TODO validationService

    // 2. check uniqueness
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.render('auth/register', { error: 'User already exists' });
    }

    // 3. hash
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. persist
    await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    // 5. redirect
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
}

export function logout(req, res) {
  req.logout(() => {
    res.redirect('/login');
  });
}
