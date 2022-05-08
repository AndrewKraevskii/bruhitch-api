import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
  global._prisma ||
  new PrismaClient({
    log: []
  });

global._prisma = prisma;
