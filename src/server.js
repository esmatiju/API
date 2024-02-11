require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function resetAndSeedDatabase() {
  await prisma.$queryRawUnsafe('PRAGMA foreign_keys = OFF');
  await prisma.user.deleteMany({});
  await prisma.botanist.deleteMany({});
  await prisma.garden.deleteMany({});
  await prisma.plant.deleteMany({});
  await prisma.photos.deleteMany({});
  await prisma.tags.deleteMany({});
  await prisma.tagsPlant.deleteMany({});
  await prisma.photo_comu.deleteMany({});
  await prisma.plantGardenPhoto.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON');
}

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();
