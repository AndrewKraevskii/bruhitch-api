import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
  _prisma ||
  new PrismaClient({
    log: []
  });

global._prisma = prisma;
