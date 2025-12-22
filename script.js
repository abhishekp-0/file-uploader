import { prisma } from './prisma.js';

async function main() {
  // Create a new user
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      password: 'hashedpassword123',
    },
  });
  console.log('Created user:', user);

  // Create a root folder for the user
  const rootFolder = await prisma.entity.create({
    data: {
      name: 'My Documents',
      type: 'FOLDER',
      userId: user.id,
    },
  });
  console.log('Created root folder:', rootFolder);

  // Create a file inside the folder
  const file = await prisma.entity.create({
    data: {
      name: 'test-document.pdf',
      type: 'FILE',
      size: 1024,
      mimeType: 'application/pdf',
      userId: user.id,
      parentId: rootFolder.id,
    },
  });
  console.log('Created file:', file);

  // Create a subfolder
  const subfolder = await prisma.entity.create({
    data: {
      name: 'Images',
      type: 'FOLDER',
      userId: user.id,
      parentId: rootFolder.id,
    },
  });
  console.log('Created subfolder:', subfolder);

  // Create a shared folder link
  const sharedFolder = await prisma.sharedFolder.create({
    data: {
      userId: user.id,
      folderId: rootFolder.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });
  console.log('Created shared folder:', sharedFolder);

  // Fetch user with all their entities
  const userWithEntities = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      documents: {
        include: {
          childEntities: true,
        },
      },
      sharedFolders: {
        include: {
          folder: true,
        },
      },
    },
  });
  console.log('User with entities:', JSON.stringify(userWithEntities, null, 2));

  // Fetch folder hierarchy
  const folderHierarchy = await prisma.entity.findUnique({
    where: { id: rootFolder.id },
    include: {
      childEntities: true,
      sharedFolders: true,
    },
  });
  console.log('Folder hierarchy:', JSON.stringify(folderHierarchy, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\nTest completed successfully!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
