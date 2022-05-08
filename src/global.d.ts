import { WsClient } from '$types/ws';
import { PrismaClient } from '@prisma/client';

declare global {
  var _prisma: PrismaClient | undefined;
  var wsClients: WsClient[];
  namespace NodeJS {
    interface ProcessEnv {
      TWITCH_CLIENT_ID: string;
      TWITCH_SECRET_KEY: string;
      DONATIONALERTS_CLIENT_ID: string;
      DONATIONALERTS_SECRET_KEY: string;
      SECRET_KEY: string;
      CALLBACK_ORIGIN: string;
      PORT?: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export {};
