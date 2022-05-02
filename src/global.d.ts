import { PrismaClient } from '@prisma/client';
import { WsClient } from './types/ws';

declare global {
  // allow global `var` declarations
  var _prisma: PrismaClient | undefined;
  var wsClients: WsClient[];
}
