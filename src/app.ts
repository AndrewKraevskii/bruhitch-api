import fetch, { Headers } from 'cross-fetch';
import { config } from 'dotenv';
import http from 'http';
import 'module-alias/register';
import createExpressServer from './express';
import unsubscribe from './unsubscribe';
import createWebSocketServer from './ws';

// Load environment variables from .env
config();
const PORT = process.env.PORT || 3005;

global.wsClients = [];
global.fetch = fetch;
global.Headers = Headers;

//#region Create server express with websocket
const app = createExpressServer();
const server = http.createServer(app);
const wsServer = createWebSocketServer(server);
unsubscribe(server);
//#endregion

wsServer.once('listening', () =>
  console.log(`WebSocket listening on ws://localhost:${PORT}/ws/v1`)
);
server.listen(PORT, () => {
  console.log(`Application listening on http://localhost:${PORT}`);
});
