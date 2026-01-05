import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';

async function checkUserExists(username) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user !== null;
}

async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
}

export { checkUserExists, createUser };
