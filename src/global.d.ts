import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  var _prisma: PrismaClient | undefined;
}
