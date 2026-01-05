import { checkUserExists, createUser } from '../services/userService.js';
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

    const userExists = await checkUserExists(username);
    if (userExists) {
      return res.render('auth/register', { error: 'User already exists' });
    }

    await createUser(username, password);
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
