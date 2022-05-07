import http from 'http';
import WebSocket from 'ws';

export const createWebSocketServer = (server: http.Server): WebSocket.Server => {
  const webSocketServer = new WebSocket.Server({ server, path: '/ws/v1' });

  webSocketServer.on('connection', (ws, req) => {
    ws.once('message', () => {
      ws.send('hello world!');
      ws.close();
    });
  });

  return webSocketServer;
};

export default createWebSocketServer;
