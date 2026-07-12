import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test connection on boot
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to the MySQL database via Prisma Client.');
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error.message);
  });

export default prisma;
