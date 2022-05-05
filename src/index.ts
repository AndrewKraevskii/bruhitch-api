import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { unsubscribeFromFailed } from './lib/unsubscribeFromFailed';
import apiV1 from './routes/api/v1';
import { createWebSocketCallback } from './ws';

config();

(global as any).wsClients = [];

const app = express();
const port = process.env.PORT || 3005; // default port to listen

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ server, path: '/ws/v1' });

webSocketServer.on('connection', createWebSocketCallback(webSocketServer));
webSocketServer.on('listening', () =>
  console.log('Start listening websocket at ws://localhost:' + port + '/ws/v1')
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', apiV1);

try {
  server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
    unsubscribeFromFailed();
    setInterval(unsubscribeFromFailed, 1000 * 60 * 5);
  });
} catch (e) {
  console.error(e);
}
