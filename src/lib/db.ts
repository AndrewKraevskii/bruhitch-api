import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
  (global as any)._prisma ||
  new PrismaClient({
    log: ['query']
  });

if (process.env.DEV) (global as any)._prisma = prisma;
