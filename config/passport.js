import passport from 'passport';
import LocalStrategy from 'passport-local';
import { prisma } from './prisma.js';
import bcrypt from 'bcrypt';

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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }, // Convert to number if needed
    });
    if (!user) {
      return done(null, false); // User not found
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});
